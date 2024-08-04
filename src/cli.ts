import { input, select,  } from '@inquirer/prompts';
import Choice from 'inquirer/lib/objects/choice';
import Choices from 'inquirer/lib/objects/choices';


const main = async () => {
    let exit = false;
  
    while (!exit) {
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
  
      switch (action) {
        case 1:
          console.log('admin')
          break;
        case 2:
            console.log('admin')
          break;
        case 3:
            console.log('admin')
          break;
        case 4:
          exit = true;
          console.log("Exiting program...");
          process.exit(0)
        default:
          break;
      }
    }
  };
main();