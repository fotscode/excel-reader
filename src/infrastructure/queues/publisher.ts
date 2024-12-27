import ProcessMessage from "./ProcessMessage";
import { createChannel } from "./amqp";
import { QUEUE_NAME } from "./config";


async function sendMessageToQueue(message: ProcessMessage) {
  const channel = await createChannel();
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
  console.log("Message sent:", message);
}

export { sendMessageToQueue };
export default { sendMessageToQueue };