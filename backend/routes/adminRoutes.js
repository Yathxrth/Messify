import express from 'express';
import {
  getStudents,
  verifyStudent,
  toggleBlockStudent,
  getAttendanceReport,
  getAnalytics,
  getFilteredRatings
} from '../controllers/adminController.js';
import protect, { authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/students', protect, authorize('worker', 'admin'), getStudents);
router.put('/students/:id/verify', protect, authorize('worker', 'admin'), verifyStudent);
router.put('/students/:id/block', protect, authorize('admin'), toggleBlockStudent);
router.get('/attendance-report', protect, authorize('worker', 'admin'), getAttendanceReport);
router.get('/analytics', protect, authorize('worker', 'admin'), getAnalytics);
router.get('/ratings-filtered', protect, authorize('worker', 'admin'), getFilteredRatings);

export default router;
