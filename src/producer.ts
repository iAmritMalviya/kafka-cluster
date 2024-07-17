import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import inquirer from "inquirer";


const kafka = new Kafka({
  brokers: ["localhost:19092"],
});

const producer = kafka.producer();

const groupId = '3ab53af2-06c8-458a-936d-b2dab16d6d44';
const topic = 'testtopic';

async function sendMessage(topicName: string, groupId: string) {
  const message = {
    user: uuidv4(),
    message: `New message at ${new Date().toLocaleString()}`,
  };

  try {
    await producer.connect();
    await producer.send({
      topic: topicName,
      messages: [
        { value: JSON.stringify(message) }, 
      ],
    });

    console.log(`Sent message: ${JSON.stringify(message)}`);
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    await producer.disconnect();
  }
}



const main = async () => {
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["Enter Topic Name & ConsumerGroupId", "Exit"],
  });

  switch (action) {
    case "Enter Topic Name & ConsumerGroupId": {
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

      setInterval(() => {
        sendMessage(topicName, consumerGroupId)
      }, 1000);
      break;
    }
    default:
      console.log("Exiting...");
  }
};

main();
