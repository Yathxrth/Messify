import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getFeeSummary,
  getUsers
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/fee-summary', protect, getFeeSummary);
router.get('/users', protect, getUsers);

export default router;
