import mongoose from 'mongoose';

interface IProcessError extends Document {
  _upload: mongoose.Schema.Types.ObjectId;
  uploadUUID: string;
  row: number;
  col: number;
}

const processErrorSchema = new mongoose.Schema<IProcessError>({
  _upload: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadStatus' },
  uploadUUID: String,
  row: Number,
  col: Number
})

const ProcessError = mongoose.model("ProcessError", processErrorSchema)

export { IProcessError }
export default ProcessError