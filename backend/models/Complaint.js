import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  regNo: {
    type: String,
    default: ''
  },
  hostel: {
    type: String,
    default: 'SVBH'
  },
  roomNo: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Complaint category is required'],
    enum: [
      'Food Quality',
      'Hygiene & Cleanliness',
      'Staff Behavior',
      'Billing & Mess Fee',
      'Menu & Timings',
      'Infrastructure',
      'Other'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [120, 'Subject cannot exceed 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Detailed description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'general'],
    default: 'general'
  },
  mealDate: {
    type: Date,
    default: Date.now
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    default: ''
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedByName: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
