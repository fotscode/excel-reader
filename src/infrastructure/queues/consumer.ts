import uploadRepo from "@infrastructure/repositories/UploadStatusRepo";
import { Status } from "@domain/models/UploadStatus";
import { connectToDB } from "@infrastructure/db/mongooseConfig";
import { createChannel, getUploadUUIDFromMessage } from "./amqp";
import { QUEUE_NAME } from "./config";
import { ProcessFile } from "@application/use-cases/ProcessFile";

connectToDB()

async function startConsumer() {
  const channel = await createChannel();
  console.log("Waiting for messages in queue:", QUEUE_NAME);

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;
      const uploadUUID = getUploadUUIDFromMessage(msg);
      const uploadStatus = await uploadRepo.findUploadStatusByUUID(uploadUUID);
      if (!uploadStatus) {
        console.error(`UploadStatus not found for uploadUUID: ${uploadUUID}`);
        channel.ack(msg);
        return;
      }
      console.debug(`Processing uploadUUID: ${uploadUUID}`);
      await uploadRepo.updateUploadStatus(uploadStatus, Status.PROCESSING);

      await ProcessFile(uploadStatus);
 
      await uploadRepo.updateUploadStatus(uploadStatus, Status.DONE);
      console.debug(`Finished processing uploadUUID: ${uploadUUID}`);
      channel.ack(msg);
    },
    { noAck: false }
  );
}

startConsumer().catch((err) => console.error("Consumer error:", err));