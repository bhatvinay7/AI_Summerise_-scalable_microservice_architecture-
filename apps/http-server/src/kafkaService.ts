// kafkaService.ts
import { Kafka, Producer,SASLOptions } from "kafkajs";
import dotenv from 'dotenv'
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';
dotenv.config()

// async function oauthBearerTokenProvider({ region }:{region:string}) {
//   const auth = await generateAuthToken({ region });
//   return { value: auth.token };
// }


let producer: Producer;

export async function getKafkaProducer(): Promise<Producer> {
  if (!producer) {
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
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
      } as SASLOptions
    });
    // const kafka = new Kafka({
    //   clientId: 'my-app',
    //   brokers: ['<msk-bootstrap-hostname>:9098'],
    //   ssl: true,
    //   sasl: {
    //     mechanism: 'oauthbearer',
    //     oauthBearerProvider: () => oauthBearerTokenProvider({ region: '<aws-region>' }),
    //   },
    // });
    
    producer = kafka.producer({
      allowAutoTopicCreation:true,
      metadataMaxAge:60000
    });

    const admin = kafka.admin();
    await admin.connect();
    const metadata = await admin.fetchTopicMetadata({ topics: ["upload-file"] });
    await producer.connect();

    // log disconnections
    producer.on("producer.disconnect", () => {
      console.warn("Kafka producer disconnected!");
    });

    console.log("Kafka Producer connected ");
  }

  return producer;
}
