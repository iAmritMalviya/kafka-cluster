> Admin
    > Create Topic
        - Enter Topicname
    > List Topic
    > Delete Topic
    > Exit
> Consumer
    > Subscribe Topic
        - Enter Topicname
        - Enter Consumer Group
    > Exit
> Producer
    > Produce in Topic
        - Enter Topicname
    > Exit
> Exit



const adminUtils = async () => {
  const adminAction = await select({
    message: "Admin Action",
    choices: [
      {
        name: "List Topics",
        value: 1,
        description: "List all topics in the Kafka cluster",
      },
      {
        name: "Create Topic",
        value: 2,
        description: "Create a new topic in the Kafka cluster",
      },
      {
        name: "Exit",
        value: 3,
        description: "Exit the admin menu",
      },
    ],
  });

  switch (adminAction) {
    case 1:
      await listTopic(admin);
      break;
    case 2:
      const topicName = await input({ message: "Enter the topic name" });
      await createTopic(admin, topicName);
      break;
    case 3:
      console.log("Exiting admin menu...");
      break;
    default:
      break;
  }
};

const consumerUtils = async () => {
  const consumerAction  = await select({
    message: "Select the consumer action",
    choices: [
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
    ],
  });

  switch (consumerAction) {
    case 1:
      console.log("Starting consumer...");
      // const topicName = 
      // Add logic to start consumer
      break;
    case 2:
      console.log("Exiting consumer menu...");
      break;
    default:
      break;
  }
};

const producerUtils = async () => {
  console.log("Producer functionality not implemented yet.");
  // Add producer logic here
};
