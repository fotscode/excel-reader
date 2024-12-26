import mongoose, { Document } from 'mongoose'

enum Status {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done'
}

interface IUploadStatus extends Document {
  uploadUUID: string;
  timestamp_enqueued: string;
  timestamp_started: string;
  timestamp_finished: string;
  status: Status;
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
  if (this.status === Status.PENDING && !this.timestamp_enqueued) {
    this.timestamp_enqueued = now
  }
  if (this.status === Status.PROCESSING && !this.timestamp_started) {
    this.timestamp_started = now
  }
  if (this.status === Status.DONE && !this.timestamp_finished) {
    this.timestamp_finished = now
  }
  next()
})

const UploadStatus = mongoose.model<IUploadStatus>("UploadStatus", uploadStatusSchema)

export { IUploadStatus, Status }
export default UploadStatus