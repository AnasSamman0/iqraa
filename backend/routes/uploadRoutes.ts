import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx|epub/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Loosen mimetype check as it can be inconsistent across browsers/OS
    // Especially for doc/docx/epub which often have varied mimetypes
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('PDF, DOC, DOCX, EPUB files only!'));
    }
  },
});

router.post('/', protect, admin, upload.single('book'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'يرجى اختيار ملف' });
  }
  // Standardize path separator for web
  const filePath = req.file.path.replace(/\\/g, '/');
  res.send(`/${filePath}`);
});

export default router;

