import { Kafka, KafkaMessage, SASLOptions } from "kafkajs";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAuth } from "./utils/verifyUserAuth";
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';
import dotenv from 'dotenv'
dotenv.config()
import { sc, subcriber, natsConnection } from "./nats-server/nats";
import express from "express";

const app = express();
const PORT = 8080;

const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9092", "notekafka3:9092","notekafka4:9092"],
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


// async function oauthBearerTokenProvider({ region }:{region:string}) {
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





const producer = kafka.producer({metadataMaxAge:60000});
const consumer = kafka.consumer({
  groupId: "llm-response",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  maxWaitTimeInMs: 5000,
});
interface Message {
  userId: number;
  sessionId: string;
  message: string;
  token: string | null;
  join: boolean;
}

// Maps for managing connections
const userMap = new Map<number, WebSocket>();
const socketMap = new Map<WebSocket, number>();

const wss = new WebSocketServer({ port: PORT, host: "0.0.0.0" });

async function setupAndRun() {
  try {
    const admin = kafka.admin();
    await admin.connect();
    const metadata = await admin.fetchTopicMetadata({ topics: ["llm-query"] });
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: "llm-response", fromBeginning: false });

    console.log("Kafka producer and consumer connected successfully");

    // 2. Start the single Kafka consumer loop here
    await consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: {
        topic: string;
        partition: number;
        message: KafkaMessage;
      }) => {
        try {
          const parsedMessage: Message = JSON.parse(
            message?.value?.toString()!
          );
          const userId = parsedMessage.userId;
          console.log(userId);
          console.log(parsedMessage);
          const ws = userMap.get(userId);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(parsedMessage));
          } else {
            console.error(`WebSocket for user ${userId} is not open or found.`);
          }
        } catch (error) {
          console.error("Error processing Kafka message:", error);
        }
      },
    });

    // 3. Start the single NATS subscriber loop here
    (async () => {
      try {
        for await (const m of subcriber) {
          const message = JSON.parse(sc.decode(m.data));
          const ws = userMap.get(parseInt(message?.userId));
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(sc.decode(m.data));
          } else {
            console.error(`WebSocket for user ${message.userId} is not open.`);
          }
        }
      } catch (error) {
        console.error("Error processing NATS message:", error);
      }
    })();

    // 4. Handle WebSocket connections
    wss.on("connection", (ws: WebSocket) => {
      console.log("New WebSocket client connected");

      ws.on("message", async (data: ArrayBuffer) => {
        try {
          const message: Message = JSON.parse(data.toString());
          console.log(message);
          // 5. Authenticate every message
          if (!message?.token) {
            ws.close(1008, "Token not provided");
            return;
          }

          try {
            verifyAuth(message.token);
          } catch (error) {
            console.error("Authentication failed:", error);
            return;
          }

          // 6. Set or update the user mappings
          userMap.set(message.userId, ws);
          socketMap.set(ws, message.userId);

          // 7. Send message to Kafka if it's a 'join' event
          if (message && message.join) {
            const userId = message.userId;
            await producer.send({
              topic: "llm-query",
              messages: [
                {
                  value: JSON.stringify({
                    userId,
                    sessionId: message.sessionId,
                    message: message.message,
                  }),
                },
              ],
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      ws.on("close", () => {
        const userId = socketMap.get(ws);
        if (userId) {
          userMap.delete(userId);
          socketMap.delete(ws);
          console.log(`User ${userId} disconnected.`);
        }
      });

      ws.on("error", (error: Error) => {
        console.error("WebSocket error:", error);
      });
    });
  } catch (error) {
    console.error("Fatal error during setup:", error);
    process.exit(1); // Exit if initial setup fails
  }
}

setupAndRun().catch((error) => {
  console.error("Error in setupAndRun:", error);
  process.exit(1);
})
