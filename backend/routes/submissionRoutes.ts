import express from 'express';
import { createSubmission, getSubmissionsForBook, likeSubmission, deleteSubmission, getAllSubmissions } from '../controllers/submissionController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createSubmission);
router.get('/', protect, admin, getAllSubmissions);
router.get('/book/:bookId', protect, getSubmissionsForBook);
router.post('/:id/like', protect, likeSubmission);
router.delete('/:id', protect, admin, deleteSubmission);

export default router;
