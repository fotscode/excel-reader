import mongoose from 'mongoose'

const uploadStatusSchema = new mongoose.Schema({
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