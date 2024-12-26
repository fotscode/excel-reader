import { convertStringToJson, createSchemaFromJSON, getRowErrors, fillRowObject } from "../../application/services/FormatSchema.js";
import { createModelFromSchema } from "../../infrastructure/repositories/DynamicFileRepo.js";
import UploadStatus from "../../domain/models/UploadStatus.js";
import ProcessError from "../../domain/models/ProcessError.js";
import XLSX from "xlsx";
import amqp from "amqplib";
import mongoose from "mongoose";


// TODO: change with .env
const queueName = "csv";

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
      const message = JSON.parse(msg.content.toString());
      const uploadUUID = message.uploadUUID;
      // encapsulate this as a service
      const uploadStatus = await UploadStatus.findOne({ uploadUUID });
      if (!uploadStatus) {
        console.error("UploadStatus not found for uploadUUID:", uploadUUID);
        return;
      }
      uploadStatus.timestamp_started = new Date().toISOString();
      uploadStatus.status = "processing";
      await uploadStatus.save();
      // encapsulate following
      let format = convertStringToJson(uploadStatus.format)
      let schema = createSchemaFromJSON(format);
      const DynamicModel = createModelFromSchema(schema, uploadStatus.uploadUUID);
      const workbook = XLSX.readFile(`/home/fots/koibanx-challenge/uploads/${uploadStatus.filename}`);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1);
      let rows = []
      data.forEach((row, index) => {
        let obj = new DynamicModel()
        fillRowObject(obj, row, schema)
        let error = obj.validateSync();
        if (error) {
          let rowErrors = getRowErrors(index + 1, error.errors, schema)
          rowErrors.forEach((rowError) => {
            let processError = new ProcessError({
              _upload: uploadStatus._id,
              uploadUUID: uploadStatus.uploadUUID,
              row: rowError.row,
              col: rowError.col,
            })
            processError.save()
          })
        } else {
          rows.push(obj)
          if (rows.length === 1024) { // config
            DynamicModel.insertMany(rows, { ordered: false })
            rows = [];
          }
        }
      });
      if (rows.length > 0) {
        DynamicModel.insertMany(rows, { ordered: false })
      }
      uploadStatus.timestamp_finished = new Date().toISOString()
      uploadStatus.status = "done"
      uploadStatus.save()

      channel.ack(msg);
    },
    { noAck: false }
  );
}

startConsumer().catch((err) => console.error("Consumer error:", err));