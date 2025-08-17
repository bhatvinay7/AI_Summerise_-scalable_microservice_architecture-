import express, { Request, Response } from "express";
import { Kafka } from "kafkajs";
import redis from "./redis/redisClient";
import dotenv from "dotenv";
dotenv.config();
const kafka = new Kafka({
  clientId: "notes",
  brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
});

const consumer = kafka.consumer({ groupId: "upload-file" });
const app = express();
const port = 3000;

try {
  const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "upload-file", fromBeginning: false });

    await consumer.run({
      autoCommit: false,

      eachMessage: async ({ topic, partition, message }) => {
        // console.log({
        //   partition,
        //   offset: message.offset,
        // });

        try {
          const sessionId = JSON.parse(message?.value?.toString()!).sessionId;
          redis.set(`#{sessionId}`, JSON.stringify(message?.value?.toString()));

          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (parseInt(message.offset) + 1).toString(), // Commit the next expected offset
            },
          ]);
        } catch (error: any) {
          console.error("Error in consumer:", error);
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

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server running at `);
});
