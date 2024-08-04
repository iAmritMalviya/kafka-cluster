
import { Kafka, logLevel } from "kafkajs";
import dotenv from "dotenv";
import { input, select,  } from '@inquirer/prompts';
import { listTopic } from "./utils";

const kafka = new Kafka({
  brokers: ['special-cub-9315-us1-kafka.upstash.io:9092'],
  ssl: true,
  sasl: {
      mechanism: 'scram-sha-256',
      username: 'c3BlY2lhbC1jdWItOTMxNSRQNS55miVLOe0Y3YwM9yVFp_CD1DZ5H3B_ovNNqNk',
      password: 'MjRkYzU4ZTAtYjY1My00ZmJiLTk1MjMtMTg1YjJlMGJlNjQ1'
  },
  logLevel: logLevel.ERROR,
});

const admin = kafka.admin()

const main = async () => {
  let exit = false;

    const action = await select({
      message: "Select your action",
      choices: [
        {
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
        },
        {
          name: "Exit",
          value: 4,
          description: "Exit the program",
        },
      ],
    });
    console.log(action)
    switch (action) {
      case 1:
        await listTopic(admin)
        break;
      case 2:
        console.log('producer')
        break;
      case 3:
        console.log('consumer')
        break;
      case 4:
        exit = true;
        console.log("Exiting program...");
        process.exit(0)
      default:
        break;
    }
  }


main();