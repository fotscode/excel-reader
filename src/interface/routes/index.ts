import { Router } from 'express';
import upload from '@infrastructure/middleware/upload';
import queues from '@infrastructure/queues/publisher';
import uploadRepo from '@infrastructure/repositories/UploadStatusRepo';
import errorsRepo from '@infrastructure/repositories/ProcessErrorRepo';

const router = Router();

router.post('/upload', upload.single('file'), async (req: any, res) => {
  const savedStatus = await uploadRepo.createPendingUploadStatus(req.body.format, req.file.filename);
  const { uploadUUID, format, filename } = savedStatus;
  queues.sendMessageToQueue({ uploadUUID, format, filename });
  res.json({ uploadUUID })
});

router.get('/status/:uploadUUID', async (req, res) => {
  const uploadUUID = req.params.uploadUUID;
  const uploadStatus = await uploadRepo.findUploadStatusByUUID(uploadUUID);
  if (!uploadStatus) {
    res.status(404).json({ "message": "UploadStatus not found" }); // TODO: make better error handling
    return;
  }
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const sort = req.query.sort ? req.query.sort as string : 'asc';
  const errors = await errorsRepo.findErrorsPaginatedAndSorted(uploadUUID, page, limit, sort);
  // TODO: encapsulate the following response in an object
  res.json({
    uploadUUID,
    status: uploadStatus.status,
    errors,
    timestamp_enqueued: uploadStatus.timestamp_enqueued,
    timestamp_started: uploadStatus.timestamp_started,
    timestamp_finished: uploadStatus.timestamp_finished,
  })
})

export default router
