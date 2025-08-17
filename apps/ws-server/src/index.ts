import { Kafka } from "kafkajs";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
const app = express();

const kafka = new Kafka({
  clientId: "notes",
  brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
});
interface Message {
  userId: number;
  message: string;
  join: boolean;
  ispushed: boolean;
}

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "llm-response" });
const userMap = new Map<number, WebSocket>();
const socketMap = new Map<WebSocket, number>();
const wss = new WebSocketServer();

try {
  const run = async () => {
    // Producing
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic:"llm-response", fromBeginning: false });
  };

  const promise = new Promise((resolve, reject) => {
    run().then(resolve).catch(reject);
  });
} catch (error) {
  console.error("Error connecting to Kafka:", error);

  wss.on("connection", async (ws: WebSocket) => {
    ws.on("message", async (data: ArrayBuffer) => {
      try {
        const message: Message = JSON.parse(data.toString());
        if (!userMap.has(message.userId)) {
          userMap.set(message.userId, ws);
        }
        if (message && message.join && message.ispushed) {
          const userId = message.userId;
          await producer.send({
            topic: "llm-query",
            messages: [{ value: "Hello KafkaJS user!" }],
          });
        }

        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
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

app.listen(3000, () => {
  console.log("WebSocket server is running on port 3000");
});
