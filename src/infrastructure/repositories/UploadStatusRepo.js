import UploadStatus from '../../domain/models/UploadStatus.js';
import { v4 } from 'uuid';

const findUploadStatusByUUID = async (uuid) => {
    return UploadStatus.findOne({ uploadUUID: uuid });
}

const createPendingUploadStatus = async (format, filename) => {
    const newStatus = new UploadStatus({
        timestamp_enqueued: new Date().toISOString(),
        uploadUUID: v4(),
        status: 'pending',
        format: format,
        filename: filename,
    });
    return newStatus.save();
}

export default { findUploadStatusByUUID, createPendingUploadStatus }