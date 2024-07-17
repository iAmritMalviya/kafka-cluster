import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from "uuid";
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const kafka = new Kafka({
  brokers: process.env.BROKERS?.split(',') || ["localhost:19092"],
});


const main = async () => {
  let action;
  do {
    action = await new Promise((resolve) => rl.question("What would you like to do? (press 1 for send message, press 2 for exit) ", (answer) => resolve(answer.toLowerCase())));

    switch (action) {
      case "1": {
        const topicName : string= await new Promise((resolve) => rl.question("Enter the topic name (default: testtopic): ", (answer) => resolve(answer || "testtopic")));
        const message = {
          user: uuidv4(),
          message: `New message at ${new Date().toLocaleString()}`,
        };

        setInterval(() => {
          sendMessage(topicName, message);
        }, 1000);
        break;
      }
      case "2":
        console.log("Exiting...");
        break;
      default:
        console.log("Invalid option. Please try again.");
    }
  } while (action !== "2");

  rl.close();
};

main();


const sendMessage = async (topicName: string, message: {user: string, message: string}) => {
  const producer = kafka.producer();
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