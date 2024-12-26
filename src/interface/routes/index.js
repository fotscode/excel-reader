import { Router } from 'express';
import upload from '../../infrastructure/middleware/upload.js';
import queues from '../../infrastructure/queues/publisher.js';
import uploadRepo from '../../infrastructure/repositories/UploadStatusRepo.js';
import errorsRepo from '../../infrastructure/repositories/ProcessErrorRepo.js';

const router = Router();

router.post('/upload', upload.single('file'), async (req, res) => {
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
  const errors = await errorsRepo.findErrorsPaginatedAndSorted(uploadUUID, req.query.page, req.query.limit, req.query.sort);
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
