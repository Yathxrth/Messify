import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    lowercase: true
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    lowercase: true
  },
  items: {
    type: [String],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'Menu must have at least one item'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index: one entry per day + mealType
menuSchema.index({ day: 1, mealType: 1 }, { unique: true });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
