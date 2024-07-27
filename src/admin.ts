import { Kafka } from "kafkajs";
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

const admin = kafka.admin();

const createTopic = async (topic: string, partitions = 1, replicas = 1) => {
  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes(topic)) {
      const answer = await new Promise((resolve) => rl.question(`Create topic '${topic}' with ${partitions} partitions and ${replicas} replicas? (y/n) `, (answer: string) => resolve(answer.toLowerCase() === 'y')));

      if (answer) {
        console.log(answer, "answer");
        
        await admin.createTopics({
          topics: [
            {
              topic,
              numPartitions: partitions,
              replicationFactor: replicas,
            },
          ],
        });
        console.log(`Topic '${topic}' created.`);
      } else {
        console.log("Topic creation canceled.");
      }
    } else {
      console.log(`Topic '${topic}' already exists.`);
    }
  } catch (error: any) {
    console.error(`Error creating topic: ${error.message}`);
  } finally {
    process.exit(0)
    await admin.disconnect();
    console.log("Admin disconnected...");
  }
};

const listTopics = async () => {
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    console.log("Existing Topics:");
    existingTopics.forEach((topic) => console.log(topic));
  } catch (error: any) {
    console.error(`Error listing topics: ${error.message}`);
  } finally {
    await admin.disconnect();
    console.log("Admin disconnected...");
  }
};

