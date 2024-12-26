import mongoose from 'mongoose';

const processErrorSchema = new mongoose.Schema({
  _upload: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadStatus' },
  uploadUUID: String,
  row: Number,
  col: Number
})

const ProcessError = mongoose.model("ProcessError", processErrorSchema)

export default ProcessError