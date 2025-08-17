import { Kafka } from "kafkajs";
import prisma from "prisma";

import express from "express";
const app = express();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
});

import { fetchResponse } from "./llm/responsGenerater";
interface Message {
  userId: number;
  message: string;
  join: boolean;
  ispushed: boolean;
  sessionId?: string | null;
}

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "test-group" });

try {
  const run = async () => {
    // Producing
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: "llm-query", fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // console.log({
        //   partition,
        //   offset: message.offset,
        //   value: message?.value?.toString(),
        // });
        const parsedMessage: Message = JSON.parse(message?.value?.toString()!);

        if (!parsedMessage || !parsedMessage.message) {
          console.error("Invalid message format or missing content");
          return;
        }

        try {
          const response = fetchResponse(parsedMessage.message);
          await producer.send({
            topic: "llm-response",
            messages: [
              {
                value: JSON.stringify({
                  userId: parsedMessage.userId,
                  response: response,
                }),
              },
            ],
          });
          const Session = await prisma.session.findFirsrt({
            where: {
              userId: parsedMessage.userId,
              id: parsedMessage.sessionId,
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
            const query = await prisma.query.create({
              data: {
                userquery: parsedMessage.message,
                sessionId: newSession.id,
                response: {
                  create: {
                    llmResponse: response,
                    queryId: newSession.id,
                  },
                },
              },
            });
          } else {
            const query = await prisma.query.create({
              data: {
                userquery: parsedMessage.message,
                sessionId: Session.id,
                response: {
                  create: {
                    llmResponse: response,
                    queryId: Session.id,
                  },
                },
              },
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
  };

  const promise = new Promise((resolve, reject) => {
    run().then(resolve).catch(reject);
  });
} catch (error) {
  console.error("Error connecting to Kafka:", error);
}

app.listen(3000, () => {
  console.log("WebSocket server is running on port 3000");
});
