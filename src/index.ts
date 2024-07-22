import bodyParser from 'body-parser';
import { group } from 'console';
import express, { Request, Response } from 'express';
import { Admin, AssignerProtocol, Kafka } from "kafkajs";
import { getConsumerGroupTopics, getConsumerGroupMemberInfo, clearTopic } from './utils';

const kafka = new Kafka({
  brokers: process.env.BROKERS?.split(',') || ["localhost:19092"],
});

const app = express();


const admin = kafka.admin();
app.use(bodyParser.json())


const PORT = process.env.PORT || 7007;

const BASEURL = '/api/v1/kafka-operation'

app.get(BASEURL + '/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get(BASEURL + '/consumer-group-topics/:consumerGroupId', async (req: Request, res: Response) => {
  try {
    const consumerGroupId = req.params.consumerGroupId;

    if (!consumerGroupId) {
      throw new Error('Missing required parameter: consumerGroupId');
    }
    const consumerGroupOffsets = await getConsumerGroupTopics(admin, consumerGroupId)
    return res.json({ consumerGroupOffsets });
  } catch (error: any) {
    console.error(error.message);
    return res.status(error.name === 'Error' ? 400 : 500).json({ error: error.message }); 
  }
});


app.get(BASEURL + '/consumer-group-members/:consumerId', async (req: Request, res: Response) => {
  try {

    const listGroups = await admin.listGroups();
    const consumerGroupId = req.params.consumerId

    const consumerGroupOffsets = await getConsumerGroupMemberInfo(admin, consumerGroupId)

    res.json({ consumerGroupOffsets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching consumer groups and offsets' });
  }
});

app.post(BASEURL + "/clear-topic", async (req: Request, res: Response) => {
  try {
    const { consumerGroupId, topicName, partitions, clearType} = req.body;

    if (!consumerGroupId ||!topicName) {
      throw new Error("Missing required parameters: consumerGroupId, topicName, partitions");
    }

    const response = await clearTopic(admin, topicName, partitions, clearType)
    return res.status(200).json({response: response });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const getTopicsByConsumerGroupId = async (groupId: string) => {
    try {
      const groupInfo = await admin.describeGroups([groupId]);

    console.log("groupInfo",groupInfo)

    } catch (error: any) {
      throw new Error(`Error getting topics for group ${groupId}: ${error.message}`);
    }
  };

