import express from 'express';
import { getBooks, createBook, deleteBook, toggleBookStatus, markBookFinished } from '../controllers/bookController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getBooks).post(protect, admin, createBook);
router.route('/:id').delete(protect, admin, deleteBook);
router.route('/:id/toggle').patch(protect, admin, toggleBookStatus);
router.route('/:id/finish').post(protect, markBookFinished);

export default router;
