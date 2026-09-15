import mongoose from 'mongoose';

const optOutSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    lowercase: true
  }
}, {
  timestamps: true
});

// Prevent duplicate opt-outs: one student can opt out of a meal only once per day
optOutSchema.index({ student: 1, date: 1, mealType: 1 }, { unique: true });

const OptOut = mongoose.model('OptOut', optOutSchema);
export default OptOut;
