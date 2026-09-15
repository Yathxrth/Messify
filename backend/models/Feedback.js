import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'general'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  responses: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  // NOTE: No userId field — feedback is anonymous by design
}, {
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
