import { Kafka, KafkaMessage } from "kafkajs";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAuth } from "./utils/verifyUserAuth";
import { sc, subcriber,natsConnection } from "./nats-server/nats";
import express from "express";

const app = express();

const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9093", "notekafka3:9094"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "llm-response" });
interface Message {
  userId: number,
  sessionId:string,
  message: string,
  token: string | null,
  join: boolean,
}

const userMap = new Map<number, WebSocket>();
const socketMap = new Map<WebSocket, number>();
const wss = new WebSocketServer({ port: 8080, host: "0.0.0.0" });

try {
  const run = async () => {
    // Producing
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: "llm-response", fromBeginning: false });
  };

  console.log("Kafka producer and consumer connected successfully");
  const promise = new Promise((resolve, reject) => {
    run()
      .then(resolve)
      .catch(async(Error) => async() => {
        // await natsConnection.drain()
        console.error("Error connecting to Kafka:", Error);
      });
  });
} catch (error) {
  console.error("Error connecting to Kafka:", error);
}

try {
  wss.on("connection", async (ws: WebSocket) => {
    console.log("connected")
    ws.on("message", async (data: ArrayBuffer) => {
      try {
        const message: Message = JSON.parse(data.toString());
        console.log(message)
        if (!userMap.has(message.userId)) {
          try {
            verifyAuth(message?.token!);
            userMap.set(message.userId, ws);
          } catch (error: any) {
            return;
          }
        }
        if (message && message.join) {
          const userId = message.userId;
          await producer.send({
            topic: "llm-query",
            messages:[{ value:JSON.stringify({userId:userId,sessionId:message.sessionId,message:message.message}) }],
          });
        }

        // sc.decode(subcriber.)
        (async () => {
          for await (const m of subcriber) {
            const message = JSON.parse(sc.decode(m.data));
            const ws = userMap.get(parseInt(message?.userId));
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(sc.decode(m.data)));
            } else {
              console.error(
                `WebSocket for user ${message.userId} is not open.`
              );
            }
          }
        })();

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
            console.log({
              partition,
              offset: message.offset,
              value: message?.value?.toString(),
            });
            const parsedMessage: Message = JSON.parse(
              message?.value?.toString()!
            );
            const userId = parsedMessage.userId;
            const ws = userMap.get(userId);
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(parsedMessage));
            } else {
              console.error(`WebSocket for user ${userId} is not open.`);
            }
          },
        });
      } catch (error: any) {
        console.error("Error processing message:", error);
      }
    });

    ws.on("close", () => {
      const userId = socketMap.get(ws);
      if (userId) {
        userMap.delete(userId);
        socketMap.delete(ws);
      }
    });

    ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });
  });
} 
catch(error:any){
   console.log(error)
  }
