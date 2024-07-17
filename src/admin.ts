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

const main = async () => {
  let action;
  do {
    action = await new Promise((resolve) => rl.question("What would you like to do? (1 for create-topic, 2 for list-topics, 3 for exit) ", (answer: string) => resolve(answer.toLowerCase())));

    switch (action) {
      case "1": {
        const topicName: string = await new Promise((resolve) => rl.question("What is your topic name ? ", (answer: string) => resolve(answer)));
        const partitionCount = parseInt(await new Promise((resolve) => rl.question("How many partitions ? (default: 1) ", (answer: any) => resolve(answer || 1))), 10);
        const replicaCount = parseInt(await new Promise((resolve) => rl.question("How many replicas ? (default: 1) ", (answer: any) => resolve(answer || 1))), 10);
        console.log(topicName, partitionCount, replicaCount)
        await createTopic(topicName, partitionCount, replicaCount);
        break;
      }
      case "2":
        await listTopics();
        break;
      default:
        if (action !== '3') {
          console.log("Invalid option. Please try again.");
        }
    }
  } while (action !== '3');

  rl.close();
};

main();
