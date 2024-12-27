import amqp from 'amqplib';
import { AmqpConfig, amqpConfig, QUEUE_NAME } from './config';

let channel: amqp.Channel;

const buildAmqpConnectionString = (config: AmqpConfig): string => {
    const {
        host,
        port = 5672, // default RabbitMQ port
        user,
        password,
        vhost = '/',
    } = config;

    const encodedUser = user ? encodeURIComponent(user) : '';
    const encodedPassword = password ? encodeURIComponent(password) : '';
    const encodedVhost = vhost.startsWith('/') ? vhost : `/${vhost}`;

    const credentials =
        user && password ? `${encodedUser}:${encodedPassword}@` : '';

    return `amqp://${credentials}${host}:${port}${encodedVhost}`;
};


const createChannel = async () => {
    if (channel) {
        return channel;
    }
    const connection = await amqp.connect(buildAmqpConnectionString(amqpConfig));
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    return channel;
}

const getUploadUUIDFromMessage = (msg: amqp.ConsumeMessage | null): string => {
    if (!msg) {
        console.error("Empty message");
        return '';
    }
    const message = JSON.parse(msg.content.toString());
    return message.uploadUUID;
}

export { createChannel, getUploadUUIDFromMessage }