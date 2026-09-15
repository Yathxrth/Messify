import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._-]+@mnnit\.ac\.in$/.test(v);
      },
      message: 'Email must be from @mnnit.ac.in domain'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'worker', 'admin'],
    default: 'student'
  },
  regNo: {
    type: String,
    trim: true
  },
  branch: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  hostel: {
    type: String,
    trim: true,
    default: 'SVBH'
  },
  roomNo: {
    type: String,
    trim: true,
    default: ''
  },
  dietaryPreference: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Jain'],
    default: 'Veg'
  },
  allergies: {
    type: String,
    trim: true,
    default: 'None'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  semesterFee: {
    type: Number,
    default: 25000
  },
  annualFee: {
    type: Number,
    default: 50000
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
