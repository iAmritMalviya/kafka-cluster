## Running Kafka Producer, Consumer, and Admin Tools

This document provides instructions on how to run the producer, consumer, and admin tools for interacting with a Kafka cluster. 

**Prerequisites:**

* Git installed on your machine
* Docker installed and running
* Node.js and npm installed

**Steps:**

1. **Clone the Repository:**

   ```bash
   git clone <repository_url>
   ```

   Replace `<repository_url>` with the actual URL of your Kafka project repository.

2. **Change Directory:**

   ```bash
   cd <project_directory>
   ```

   Replace `<project_directory>` with the name of the directory created after cloning the repository.

3. **Install Dependencies:**

   ```bash
   npm install
   ```

   (or `yarn install` if you prefer using yarn)
   This command installs all the necessary libraries required by the producer, consumer, and admin tools.

4. **Start Redpanda (Single Broker):**

   ```bash
   docker-compose -f redpanda-single-broker.yaml up -d
   ```

   This command starts a single-node Redpanda Kafka broker using Docker Compose. The `-f` option specifies the path to the docker-compose configuration file (`redpanda-single-broker.yaml`). The `up -d` flags tell Docker Compose to start the services defined in the configuration file in detached mode (running in the background).

5. **Configure Broker URLs (Optional):**

   If not already configured, copy the sample environment file and provide the broker URL(s):

   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and edit the `BROKERS` variable to specify the list of broker URLs. Each URL should be in the format `host:port`. For example:

   ```
   BROKERS=localhost:9092
   ```

   **Note:** This step is optional if the broker URL is already set in the code or defined in the Docker Compose configuration.

**Running the Tools:**

* **Producer:**

   ```bash
   npm run producer
   ```

   This command starts the producer tool that sends messages to a Kafka topic.

* **Consumer:**

   ```bash
   npm run consumer
   ```

   This command starts the consumer tool that subscribes to a Kafka topic and receives messages published by the producer.

* **Admin:**

   ```bash
   npm run admin
   ```

   This command starts the admin tool that allows you to manage your Kafka cluster, including listing topics, creating topics, etc.

**Inputs and Expected Outputs:**

**Producer:**

* **Input:** The user can interact with the producer tool through a console menu and provide details like topic name and message content.
* **Expected Output:** The producer sends messages to the specified Kafka topic and displays confirmation messages upon successful sending.

**Consumer:**

* **Input:** The user can choose which topic to subscribe to through a console menu.
* **Expected Output:** The consumer continuously listens for messages on the subscribed topic and displays the received messages on the console.

**Admin:**

* **Input:** The user interacts with the admin tool using a console menu to choose actions like listing topics or creating new topics.
* **Expected Output:** The admin tool displays a list of existing topics, creates new topics based on user input, and provides confirmation messages for completed actions.

**Additional Notes:**

* Remember to adjust the commands and instructions based on your specific project setup.
* Refer to the project documentation for more details about the functionalities offered by each tool.

This guide should help your teammates understand how to interact with the Kafka ecosystem using the provided tools. Feel free to customize this document further by adding screenshots or specific examples relevant to your project.