import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import { input, select } from '@inquirer/prompts';


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
        process.once('SIGINT', () => reject(new Error('Cancelled')));
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
  let exit = false;

  while (!exit) {
    const action = await select({message: "Select your action", choices: [{
      name: "Admin",
      value: 1,
      description: "Manage Kafka cluster",
    }, 
  {
    name: "Producer",
    value: 2,
    description: "Send messages to Kafka",
  }, 
{
  name: "Consumer",
  value: 3,
  description: "Consume messages from Kafka",
  },{
    name: "Exit",
    value: 4,
    description: "Exit the program",
  }]})

  switch (action) {
    case 1:
        await adminUtils()
        break;
    case 2:
        await consumerUtils()
    default:
      break;
  }}
};

main();

const adminUtils = async () => {

      const adminAction = await select({message: "Admin Action", choices: [{
        name: "List Topics",
        value: 1,
        description: "List all topics in the Kafka cluster",
      },{
        name: "Create Topic",
        value: 2,
        description: "Create a new topic in the Kafka cluster",
      },{
        name: "Exit",
        value: 3,
        description: "Exit the admin menu",
      }]});

      switch (adminAction) {
        case 1:
          console.log("admin")
          break;
      
        default:
          break;
      }
}


const consumerUtils = async() => {

  const action = select({message: "Select the consumer action", choices: [
    {
      name: "Start Consumer",
      value: 1,
      description: "Start consuming messages from a specific Kafka topic",
    },
    {
      name: "Exit",
      value: 2,
      description: "Exit the consumer menu",
    },
  ]})

}