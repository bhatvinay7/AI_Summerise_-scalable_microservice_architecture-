import { Kafka, KafkaMessage } from "kafkajs";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAuth } from "./utils/verifyUserAuth";
import { sc, subcriber, natsConnection } from "./nats-server/nats";
import express from "express";

const app = express();
const PORT = 8080;

const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9092", "notekafka3:9092"],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "llm-response" });
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
    // 1. Connect Kafka producer and consumer once at startup
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
          const ws = userMap.get(userId);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(parsedMessage));
          } else {
            console.error(
              `WebSocket for user ${userId} is not open or found.`
            );
          }
        } catch (error) {
          console.error("Error processing Kafka message:", error);
          // Implement a DLT (Dead Letter Topic) strategy for non-recoverable errors
          // See BMC Software documentation for best practices on this.
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
            console.error(
              `WebSocket for user ${message.userId} is not open.`
            );
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
              messages: [{ value: JSON.stringify({ userId, sessionId: message.sessionId, message: message.message }) }],
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

setupAndRun();

