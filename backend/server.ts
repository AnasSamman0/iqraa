import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import { importData } from './seeder';

import path from 'path';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import submissionRoutes from './routes/submissionRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();

// CORS - allow all origins for development; restrict in production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/upload', uploadRoutes);

const __dirname_resolved = path.resolve();
app.use('/uploads', express.static(path.join(__dirname_resolved, '/uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await importData();
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});
