import UploadStatus from '@domain/models/UploadStatus';
import { v4 } from 'uuid';

const findUploadStatusByUUID = async (uuid: string) => {
    return UploadStatus.findOne({ uploadUUID: uuid });
}

const createPendingUploadStatus = async (format: string, filename: string) => {
    const newStatus = new UploadStatus({
        uploadUUID: v4(),
        status: 'pending',
        format: format,
        filename: filename,
    });
    return newStatus.save();
}

export default { findUploadStatusByUUID, createPendingUploadStatus }