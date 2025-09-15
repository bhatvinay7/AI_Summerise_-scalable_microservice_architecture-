import { Kafka, KafkaMessage, SASLOptions } from "kafkajs";
const prisma = require("prisma/client");
import dotenv from 'dotenv'
dotenv.config()
import express from "express";
import { natsConnection, sc } from "./nats-server/nats";
import redisClient from "./redis/redisClient";
import{ generateAuthToken } from 'aws-msk-iam-sasl-signer-js';
const app = express();



const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9092", "notekafka3:9092"],
  retry: {
    initialRetryTime: 30000,
    retries: 10,
  },
  ssl: false,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_CFG_USERNAME,
    password: process.env.KAFKA_CFG_PASSWORD,
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


enum MessageType {
  Notification = "notification",
  Response = "response",
}

const producer = kafka.producer({metadataMaxAge:60000});
const consumer = kafka.consumer({
  groupId: "query-consumer-group",
  maxWaitTimeInMs: 5000,
});
import { fetchResponse } from "./llm/responsGenerater";
interface Message {
  userId: number;
  message: string;
  join: boolean;
  sessionId?: string | null;
}

const run = async () => {
  // Producing
  const admin = kafka.admin();
  await admin.connect();
  const metadata = await admin.fetchTopicMetadata({ topics: ["llm-query"] });
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "llm-query", fromBeginning: false });

  consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message,
    }: {
      topic: string;
      partition: number;
      message: KafkaMessage;
    }) => {
      // console.log({
      //   partition,
      //   offset: message.offset,
      //   value: message?.value?.toString(),
      // });
      const parsedMessage: Message = JSON.parse(message?.value?.toString()!);
      console.log(parsedMessage);
      if (!parsedMessage || !parsedMessage.message) {
        console.error("Invalid message format or missing content");
        return;
      }

      try {
        let response = null;
        let Userquery: any;
        let sessionId: string = parsedMessage?.sessionId as string;
        if (parsedMessage.sessionId) {
          const sessionData = await redisClient.get(
            `${parsedMessage.sessionId}`
          );
          natsConnection?.publish(
            "file-state-manager",
            sc.encode(
              JSON.stringify({
                userId: parsedMessage.userId,
                response: "generating the response",
                type: MessageType.Notification,
                sessionId: parsedMessage.sessionId,
              })
            )
          );
          response = await fetchResponse(
            `${parsedMessage.message}/n ${sessionData}`
          );
          console.log(response);
        }
        const Session = await prisma.session.findFirst({
          where: {
            userId: parsedMessage.userId!,
            id: parsedMessage.sessionId as string,
          },
        });

        if (!Session) {
          const newSession = await prisma.session.create({
            data: {
              userId: parsedMessage.userId,
              sessionName: "",
              createdAt: new Date().toISOString(),
            },
          });
          sessionId = newSession.id as string;
          Userquery = await prisma.query.create({
            data: {
              userquery: parsedMessage.message,
              sessionId: newSession.id as string,
              response: {
                create: {
                  llmResponse: response as string,
                },
              },
            },
            include: {
              response: true,
            },
          });
        } else {
          Userquery = await prisma.query.create({
            data: {
              userquery: parsedMessage.message,
              sessionId: Session.id as string,
              response: {
                create: {
                  llmResponse: response as string,
                },
              },
            },
            include: {
              response: true,
            },
          });
        }
        await producer.send({
          topic: "llm-response",
          messages: [
            {
              value: JSON.stringify({
                userId: parsedMessage.userId,
                query: { userquery: null, id: Userquery.id as number },
                response: response,
                sessionId: sessionId as string,
                type: MessageType.Response,
              }),
            },
          ],
        });
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

try {
  run().catch(async (Error) => {
    // await natsCOnnection.drain();
    console.log(Error.message);
  });
} catch (error) {
  console.error("Error connecting to Kafka:");
}

app.listen(3003, "0.0.0.0", () => {
  console.log("WebSocket server is running on port 3003");
});
