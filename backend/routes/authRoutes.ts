import express from 'express';
import { login, registerUser, getUsers, deleteUser } from '../controllers/authController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, admin, registerUser);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
