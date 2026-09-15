import express from 'express';
import { submitFeedback, getFeedback, getFeedbackStats } from '../controllers/feedbackController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', protect, authorize('worker', 'admin'), getFeedback);
router.get('/stats', protect, authorize('worker', 'admin'), getFeedbackStats);

export default router;
