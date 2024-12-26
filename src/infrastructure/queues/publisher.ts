import amqp, { Channel } from "amqplib";
import ProcessMessage from "./ProcessMessage";

let channel: Channel;
// TODO: change with .env
const queueName = "csv";

async function connectRabbitMQ() {
  // TODO: change with .env
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });
}

async function sendMessageToQueue(message: ProcessMessage) {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  console.log("Message sent:", message);
}

export { connectRabbitMQ, sendMessageToQueue };
export default { connectRabbitMQ, sendMessageToQueue };