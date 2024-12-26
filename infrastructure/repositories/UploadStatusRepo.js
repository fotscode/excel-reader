const uuid = require('uuid');
const UploadStatus = require('../../domain/models/UploadStatus');

const findUploadStatusByUUID = async (uuid) => {
    return UploadStatus.findOne({ uploadUUID: uuid });
}

const createPendingUploadStatus = async (format, filename) => {
    const newStatus = new UploadStatus({
        timestamp_enqueued: new Date().toISOString(),
        uploadUUID: uuid.v4(),
        status: 'pending',
        format: format,
        filename: filename,
    });
    return newStatus.save();
}

module.exports = {
    findUploadStatusByUUID,
    createPendingUploadStatus
}