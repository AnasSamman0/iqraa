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
    const filetypes = /pdf|doc|docx|epub|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Loosen mimetype check as it can be inconsistent across browsers/OS
    // Now including images for cover extraction
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents (PDF, DOC...) and images (JPG, PNG) are allowed!'));
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

