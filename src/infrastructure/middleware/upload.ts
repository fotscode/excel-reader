import { Request } from 'express';
import multer from 'multer';
import { multerUploadPath } from '@shared/config';

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: DestinationCallback) => {
    cb(null, multerUploadPath);
  },
  filename: (req: Request, file, cb: FileNameCallback) => {
    cb(null, new Date().toISOString() + '_' + file.originalname);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

export { RequestWithFile }
export default upload
