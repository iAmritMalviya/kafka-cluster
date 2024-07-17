import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

dotenv.config();

const kafka = new Kafka({
  brokers: process.env.BROKERS?.split(',') || ["localhost:19092"],
});

const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS as string) || 3;

const connectWithConsumer = async (topicName: string, consumerGroupId: string) => {
  const consumer = kafka.consumer({ groupId: consumerGroupId });

  let retryCount = 0;

  while (retryCount < MAX_RETRY_ATTEMPTS) {
    try {
      await consumer.connect();
      console.log("Connected to Kafka!");

      await consumer.subscribe({ topic: topicName });
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const formattedValue = JSON.parse((message.value as Buffer).toString());
          console.log(`${topic}: ${partition}: ${formattedValue.user}: ${formattedValue.message}`);
        },
      });

      await new Promise((resolve, reject) => {
        rl.once('SIGINT', () => reject(new Error('Cancelled')));
      });
      break;
    } catch (error: any) {
      console.error(`Error connecting to Kafka (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS}): ${error.message}`);
      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (retryCount === MAX_RETRY_ATTEMPTS) {
    console.error("Failed to connect to Kafka after retries.");
  } else {
    console.log("Consumer disconnected (Cancelled).");
  }

  await consumer.disconnect();
};

const main = async () => {
  let action;
  do {
    action = await new Promise((resolve) => rl.question("What would you like to do? (press 1 for enter topic & group, press 2 for exit) ", (answer: string) => resolve(answer.toLowerCase())));

    switch (action) {
      case "1": {
        const topicName: string = await new Promise((resolve) => rl.question("What is your topic name ? (default: testtopic) ", (answer: any) => resolve(answer || "testtopic")));
        const consumerGroupId : string = await new Promise((resolve) => rl.question("What is your consumer group Id ? (default: 0460cbbd-ca68-4243-afed-370628dc1e6e) ", (answer: any) => resolve(answer ||"0460cbbd-ca68-4243-afed-370628dc1e6e")));

        await connectWithConsumer(topicName, consumerGroupId);
        break;
      }
      case "2":
        console.log("Exiting...");
        rl.close(); 
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  } while (action !== "2");
};

main();
