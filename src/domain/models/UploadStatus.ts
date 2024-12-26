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

uploadStatusSchema.pre('save', function (next) {
  const now = new Date().toISOString()
  if (this.status === 'pending') {
    this.timestamp_enqueued = now
  }
  if (this.status === 'processing') {
    this.timestamp_started = now
  }
  if (this.status === 'done') {
    this.timestamp_finished = now
  }
  next()
})

const UploadStatus = mongoose.model("UploadStatus", uploadStatusSchema)

export default UploadStatus