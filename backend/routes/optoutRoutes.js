import express from 'express';
import { createOptOut, getMyOptOuts, cancelOptOut, getOptOutStats, calculateRefund } from '../controllers/optoutController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createOptOut);
router.get('/me', protect, authorize('student'), getMyOptOuts);
router.delete('/:id', protect, authorize('student'), cancelOptOut);
router.get('/stats', protect, authorize('worker', 'admin'), getOptOutStats);
router.get('/refund/:studentId', protect, authorize('worker', 'admin'), calculateRefund);

export default router;
