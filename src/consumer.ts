import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

import inquirer from "inquirer";

dotenv.config();


const kafka = new Kafka({
  brokers: process.env.BROKERS?.split(',') || ["localhost:19092"],
});



const MAX_RETRY_ATTEMPTS = parseInt(process.env.MAX_RETRY_ATTEMPTS as string)|| 3; 

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
      await consumer.disconnect();
      console.log("Consumer disconnected...");
    }
  } 



const main = async () => {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["Enter Topic Name & Consumer Group Name", "Exit"],
  });

  switch (action) {
    case "Enter Topic Name & Consumer Group Name": {
      const { topicName, consumerGroupId } = await inquirer.prompt([
        {
          type: "input",
          name: "topicName",
          message: "What is your topic name ?",
          default: "testtopic"
        },
        {
          type: "input",
          name: "consumerGroupId",
          message: "What is your consumer group Id ?",
          default: '3ab53af2-06c8-458a-936d-b2dab16d6d44',
        },
      ]);

      await connectWithConsumer(topicName, consumerGroupId);
      break;
    }
    default:
      console.log("Exiting...");
  }
};

main();
