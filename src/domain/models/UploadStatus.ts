import mongoose from 'mongoose'

interface IUploadStatus {
  uploadUUID: string;
  timestamp_enqueued: string;
  timestamp_started: string;
  timestamp_finished: string;
  status: string;
  format: string;
  filename: string;
}

const uploadStatusSchema = new mongoose.Schema<IUploadStatus>({
  uploadUUID: String,
  timestamp_enqueued: Date,
  timestamp_started: Date,
  timestamp_finished: Date,
  status: String,
  format: String,
  filename: String
})

const UploadStatus = mongoose.model("UploadStatus", uploadStatusSchema)

export default UploadStatus