import { Request } from 'express';
import multer from 'multer';
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: DestinationCallback) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file, cb: FileNameCallback) => {
    cb(null, new Date().toISOString() + '_' + file.originalname);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload
