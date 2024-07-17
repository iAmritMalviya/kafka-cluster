import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import inquirer from "inquirer";

dotenv.config();

export const kafka = new Kafka({
  brokers: process.env.BROKERS?.split(',') || ["localhost:19092"],
});

const admin = kafka.admin();

const createTopic = async (topic: string, partitions = 1, replicas = 1) => {
  try {
    await admin.connect();

    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes(topic)) {
      const { confirmed } = await inquirer.prompt({
        type: "confirm",
        name: "confirmed",
        message: `Create topic '${topic}' with ${partitions} partitions and ${replicas} replicas?`,
      });

      if (confirmed) {
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
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["Create Topic", "List Topics", "Exit"],
  });

  switch (action) {
    case "Create Topic": {
      const { topicName, partitionCount, replicaCount } = await inquirer.prompt([
        {
          type: "input",
          name: "topicName",
          message: "What is your topic name ?",
        },
        {
          type: "number",
          name: "partitionCount",
          message: "How many partitions ?",
          default: 1,
        },
        {
          type: "number",
          name: "replicaCount",
          message: "How many replicas ?",
          default: 1,
        },
      ]);

      await createTopic(topicName, partitionCount, replicaCount);
      break;
    }
    case "List Topics":
      await listTopics();
      break;
    default:
      console.log("Exiting...");
  }
};

main();
