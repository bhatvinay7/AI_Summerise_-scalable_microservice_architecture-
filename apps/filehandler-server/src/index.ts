import express from "express";
import { Kafka, KafkaMessage, SASLOptions } from "kafkajs";
import { sc, natsConnection } from "./nats-server/nats";
import getFileBufferData from "./utils/getFileBufferData";
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';
import redis from "./redis/redisClient";
import dotenv from "dotenv";

dotenv.config();


const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9092", "notekafka3:9092"],
  retry: {
    retries: parseInt(process.env.KAFKA_CLIENT_RETRY_RETRIES || '10', 10),
    factor: parseFloat(process.env.KAFKA_CLIENT_RETRY_FACTOR || '0.2'),
    initialRetryTime: parseInt(process.env.KAFKA_CLIENT_RETRY_BACKOFF_MS || '200', 10),
    maxRetryTime: parseInt(process.env.KAFKA_CLIENT_RETRY_BACKOFF_MAX_MS || '10000', 10),
  },
  ssl: false,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  } as SASLOptions,
});


// async function oauthBearerTokenProvider({ region }: { region: string }) {
//   const auth = await generateAuthToken({ region });
//   return { value: auth.token };
// }

// const kafka = new Kafka({
//   clientId: 'my-app',
//   brokers: ['<msk-bootstrap-hostname>:9098'],
//   ssl: true,
//   sasl: {
//     mechanism: 'oauthbearer',
//     oauthBearerProvider: () => oauthBearerTokenProvider({ region: '<aws-region>' }),
//   },
// });



const consumer = kafka.consumer({
  groupId: "upload-file",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000,
});

const app = express();
const port = 3002;

// Helper to safely publish NATS messages
const publishNatsMessage = async (channel: string, data: any) => {
  try {
    natsConnection.publish(channel, sc.encode(JSON.stringify(data)));
  } catch (err) {
    console.error(`Failed to publish to NATS channel ${channel}:`, err);
  }
};

const runConsumer = async () => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const metadata = await admin.fetchTopicMetadata({
      topics: ["upload-file"],
    });
    await consumer.connect();
    await consumer.subscribe({ topic: "upload-file", fromBeginning: false });

    await consumer.run({
      autoCommit: false,
      eachMessage: async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: number;
        message: KafkaMessage;
      }) => {
        if (!message.value) return;

        try {
          const value = JSON.parse(message.value.toString()) as {
            userId: string;
            sessionId: string;
            fileLink: string;
          };

          // Notify user that processing started
          await publishNatsMessage("file-state-manager", {
            userId: value.userId,
            message: "processing the file",
          });

          // Process file
          const parsedData = await getFileBufferData(value.fileLink);
          console.log("Parsed Data:", parsedData);

          // Handle Redis cache
          let cachedData
          try{

            cachedData = await redis.get(value.sessionId);
          }
          catch(err){
            console.error("Error handling Redis cache:", err);
          }
          let dataToStore: any;
          if (cachedData) {
            const arr = [];
            arr.push(JSON.parse(cachedData));
            arr.push(parsedData);
            dataToStore = arr;
          } else {
            dataToStore = [parsedData];
          }
          console.log(parsedData);
          await redis.set(value.sessionId, JSON.stringify(dataToStore));

          // Notify user that processing is completed
          await publishNatsMessage("file-state-manager", {
            type: "notification",
            userId:parseInt(value.userId),
            message: "processing is completed",
          });

          // Commit offset manually
          try{
            await consumer.commitOffsets([
              {
                topic,
                partition,
                offset: (parseInt(message.offset) + 1).toString(),
              },
            ]);

          }
          catch(err){
            console.error("Error committing offsets:", err);
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      },
    });
  } catch (err) {
    console.error("Error connecting to Kafka:", err);
  }
};

runConsumer();

// Optional: Express for health check
app.get("/health", (_req, res) => {
  res.status(200).send({ status: "ok" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at port ${port}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
