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
  await redisClient.connect()

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
        let response: {response:string,sessionName:string}|null = null;
        let Userquery: any;
        let sessionData :any;
        let sessionId: string = parsedMessage?.sessionId as string;
        if (parsedMessage.sessionId) {
          console.log((redisClient?.isOpen ? "Redis is connected" : "Redis is not connected"));  
           
          redisClient?.on("error", (err) => console.log("Redis Client Error", err));

         
            sessionData = await redisClient.get(
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

          if(sessionData){ 
            response = await fetchResponse(
              `${parsedMessage.message}/n ${sessionData}`
            );

          }
          else{
            response = await fetchResponse(parsedMessage.message);
          }
          console.log(response);
        }
        const Session = await prisma.session.findFirst({
          where: {
            userId: parsedMessage.userId!,
            id: parsedMessage.sessionId as string,
          },
        });

        if (!Session &&  response) {
          const newSession = await prisma.session.create({
            data: {
              userId:parsedMessage.userId!,
              sessionName:response?.sessionName! as string,
              createdAt: new Date().toISOString(),
            },
          });
          sessionId = newSession.id as string;
          Userquery = await prisma.query.create({
            data: {
              userquery: parsedMessage.message,
              sessionId: sessionId,
              response: {
                create: {
                  data:{
                    llmResponse: response?.response,
                    sessionId: Session.id as string,
                  }
                },
              },
            },
            include: {
              response: true,
            },
          });
        } else {
          if(response){
          Userquery = await prisma.query.create({
            data: {
              userquery: parsedMessage.message,
              sessionId: Session.id as string,
              response: {
                create: {
                  data:{

                    llmResponse: response?.response,
                    sessionId: Session.id as string,
                  }
                },
              },
            },
            include: {
              response: true,
            },
          });
        }
      }
        await producer.send({
          topic: "llm-response",
          messages: [
            {
              value: JSON.stringify({
                userId: parsedMessage.userId,
                query: { userquery: null, id: Userquery.id as number },
                response: response?.response,
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
