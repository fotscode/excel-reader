const QUEUE_NAME = 'csv';

interface AmqpConfig {
    host: string;
    port?: number;
    user?: string;
    password?: string;
    vhost?: string;
}

const amqpConfig: AmqpConfig = {
    host: process.env.AMQP_HOST || 'localhost',
    port: process.env.AMQP_PORT ? parseInt(process.env.AMQP_PORT) : undefined,
    user: process.env.AMQP_USER,
    password: process.env.AMQP_PASSWORD,
    vhost: process.env.AMQP_VHOST,
};

export { QUEUE_NAME, amqpConfig, AmqpConfig }