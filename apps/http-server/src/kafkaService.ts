// kafkaService.ts
import { Kafka, Producer } from "kafkajs";

let producer: Producer;

export async function getKafkaProducer(): Promise<Producer> {
  if (!producer) {
    const kafka = new Kafka({
      clientId: "notes",
      brokers: ["notekafka1:9092", "notekafka2:9092", "notekafka3:9092"],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    producer = kafka.producer({
      allowAutoTopicCreation: false,
    });

    await producer.connect();

    // log disconnections
    producer.on("producer.disconnect", () => {
      console.warn("Kafka producer disconnected!");
    });

    console.log("Kafka Producer connected ");
  }

  return producer;
}
