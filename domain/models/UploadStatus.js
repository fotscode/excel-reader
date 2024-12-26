const mongoose = require('mongoose');

const uploadStatusSchema = new mongoose.Schema({
  uploadUUID: String,
  timestamp_enqueued: Date,
  timestamp_started: Date,
  timestamp_finished: Date,
  status: String,
  format: String,
  filename: String,
  errors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProcessError' }]
})

const UploadStatus = mongoose.model("UploadStatus", uploadStatusSchema)

module.exports = UploadStatus
