import { ECODES } from '@interface/mappers/error'
import ProcessMessage from './ProcessMessage'
import { createChannel } from './amqp'
import { QUEUE_NAME } from './config'

async function sendMessageToQueue(message: ProcessMessage): Promise<void | ECODES> {
    const channel = await createChannel()
    if (!channel) {
        return ECODES.CHANNEL_NOT_CREATED
    }
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)))
    console.debug(`Message sent to queue: ${QUEUE_NAME}, message: ${JSON.stringify(message)}`)
}

export { sendMessageToQueue }
export default { sendMessageToQueue }
