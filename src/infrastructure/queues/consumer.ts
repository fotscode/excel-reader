import { convertStringToJson, createSchemaFromJSON, getRowErrors, fillRowObject } from "@application/services/FormatSchema";
import { createModelFromSchema } from "@infrastructure/repositories/DynamicFileRepo";
import uploadRepo from "@infrastructure/repositories/UploadStatusRepo";
import ProcessError, { IProcessError } from "@domain/models/ProcessError";
import XLSX from "xlsx";
import amqp from "amqplib";
import mongoose from "mongoose";
import path from "path";

// TODO: change with .env
const queueName = "csv";
const uploadsPath = path.join(__dirname, "..", "..", "..", "uploads");

// move to helper fn
mongoose.connect('mongodb://127.0.0.1:27017/koibanx_challenge')
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

async function startConsumer() {
  // TODO: change with .env
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  console.log("Waiting for messages in queue:", queueName);

  channel.consume(
    queueName,
    async (msg) => {
      if (!msg) {
        console.error("Empty message");
        return;
      }
      const message = JSON.parse(msg.content.toString());
      const uploadUUID = message.uploadUUID;
      const uploadStatus = await uploadRepo.findUploadStatusByUUID(uploadUUID);
      if (!uploadStatus) {
        console.error("UploadStatus not found for uploadUUID:", uploadUUID);
        channel.ack(msg);
        return;
      }
      console.log("Processing uploadUUID:", uploadUUID);
      await uploadRepo.updateUploadStatus(uploadStatus, "processing");
      // encapsulate following
      let format = convertStringToJson(uploadStatus.format)
      let schema = createSchemaFromJSON(format);
      const DynamicModel = createModelFromSchema(schema, uploadStatus.uploadUUID);
      console.log("Reading file:", `${uploadsPath}/${uploadStatus.filename}`);
      const workbook = XLSX.readFile(`${uploadsPath}/${uploadStatus.filename}`);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1) as any[];
      console.log("Finished reading file:", `${uploadsPath}/${uploadStatus.filename}`);
      let rows = [] as typeof DynamicModel[];
      let errors = [] as IProcessError[];
      let index = 0;
      const BATCH_SIZE = 256;  // config
      console.log("Processing data with BATCH_SIZE:", BATCH_SIZE);
      for (let row of data) {
        let obj = new DynamicModel()
        fillRowObject(obj, row, schema)
        let error = obj.validateSync();
        if (error) {
          let rowErrors = getRowErrors(index + 1, error.errors, schema)
          for (let rowError of rowErrors) {
            let processError = new ProcessError({
              _upload: uploadStatus._id,
              uploadUUID: uploadStatus.uploadUUID,
              row: rowError.row,
              col: rowError.col,
            })
            errors.push(processError)
            if (errors.length === BATCH_SIZE) {
              await ProcessError.insertMany(errors, { ordered: false })
              errors = []
            }
          }
        } else {
          rows.push(obj)
          if (rows.length === BATCH_SIZE) {
            await DynamicModel.insertMany(rows, { ordered: false })
            rows = [];
          }
        }
        index++;
      }
      if (rows.length > 0) {
        await DynamicModel.insertMany(rows, { ordered: false })
      }
      if (errors.length > 0) {
        await ProcessError.insertMany(errors, { ordered: false })
      }
      await uploadRepo.updateUploadStatus(uploadStatus, "done");
      channel.ack(msg);
    },
    { noAck: false }
  );
}

startConsumer().catch((err) => console.error("Consumer error:", err));