import { Request,Response, Router } from "express";
import { Kafka } from "kafkajs";
export const router = Router()

// rpk cluster info --brokers seed-63758244.cog6l25pu5ejhljb62s0.byoc.prd.cloud.redpanda.com:9092 --user intverse --password intverse --sasl-mechanism SCRAM-SHA-256 --tls-enabled


router.post('/test-sasl-client', async (req: Request, res: Response) => {
    try {
        const {brokers, username, password, mechanism} = req.body
        console.log({brokers, username, password, mechanism})
        const kafka = new Kafka({
            brokers: ["seed-63758244.cog6l25pu5ejhljb62s0.byoc.prd.cloud.redpanda.com:9092"],
            sasl: {
                mechanism: 'scram-sha-256',
                username: "intverse",
                password:  "intverse"
            },
            ssl: false
          });
          
          const admin = kafka.admin();
          await admin.connect();
          console.log('Connected to Kafka')
          console.log(await admin.describeCluster())
          await admin.disconnect()
          return res.send('connection')
    } catch (error) {
        return res.status(500).json(error.message)
    }
})