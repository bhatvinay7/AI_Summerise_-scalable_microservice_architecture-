import express from "express";
import { Kafka, KafkaMessage } from "kafkajs";
import { sc, natsCOnnection } from "../src/nats-server/nats";
import getFileBufferData from "./utils/getFileBufferData";
import redis from "./redis/redisClient";
import dotenv from "dotenv";
dotenv.config();
const kafka = new Kafka({
  clientId: "notes",
  brokers: ["notekafka1:9092", "notekafka2:9093", "notekafka3:9094"],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const consumer = kafka.consumer({ groupId: "upload-file" });
const app = express();
const port = 3002;

try {
  const run = async () => {
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
        // console.log({
        //   partition,
        //   offset: message.offset,
        // });

        try {
          const value = JSON.parse(message?.value?.toString()!);
          console.log(value)
          try{

        
          natsCOnnection.publish(
            "file-state-manager",
            sc.encode(
              JSON.stringify({
                userId: value.userId,
                message: "processing the file",
              })
            )
          );
          const ParsedData = getFileBufferData(value?.fileLink as string);

          const cash = await redis.get(`${value?.sessionId}` as string);
          if (!cash)
            redis.set(
              `${value?.sessionId as string}`,
              JSON.stringify(ParsedData)
            );
          else {
            redis.set(
              `${value?.sessionId as string}`,
              JSON.stringify(`${cash}/n ${ParsedData}`)
            );
          }
          natsCOnnection.publish(
            "file-state-manager",
            sc.encode(
              JSON.stringify({
                type:"notification",
                userId: value.userId,
                message: "processing is completed",
              })
            )
          );
          }
          catch(error:any){
           console.log(error)

          }  
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

  new Promise((resolve, reject) => {
    run()
      .then(resolve)
      .catch(async (Error) => {
        // await natsCOnnection.drain();
        console.error("Error connecting to Kafka:", Error);
      });
  });
} catch (error) {
  console.error("Error connecting to Kafka:", error);
}

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
