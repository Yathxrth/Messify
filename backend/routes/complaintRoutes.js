import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint
} from '../controllers/complaintController.js';
import protect, { authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('student'), createComplaint);
router.get('/my', protect, authorize('student'), getMyComplaints);
router.get('/', protect, authorize('worker', 'admin'), getAllComplaints);
router.put('/:id/status', protect, authorize('worker', 'admin'), updateComplaintStatus);
router.delete('/:id', protect, deleteComplaint);

export default router;
