import express from 'express';
import { getNotifications, createNotification, deleteNotification } from '../controllers/notificationController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/', protect, authorize('worker', 'admin'), createNotification);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

export default router;
