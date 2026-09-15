import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OptOut from '../models/OptOut.js';

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Special keys for worker/admin registration
const SPECIAL_KEYS = {
  worker: 'WORKER2024KEY',
  admin: 'ADMIN2024KEY'
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, regNo, branch, phone, hostel, roomNo, dietaryPreference, allergies, specialKey } = req.body;

    // Validate email domain
    if (!email || !/^[a-zA-Z0-9._-]+@mnnit\.ac\.in$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email must be from @mnnit.ac.in domain'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate special key for non-student roles
    const userRole = role || 'student';
    if (userRole !== 'student') {
      if (!specialKey || specialKey !== SPECIAL_KEYS[userRole]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid special access key for the selected role'
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      regNo,
      branch,
      phone: phone || '',
      hostel: hostel || 'SVBH',
      roomNo: roomNo || '',
      dietaryPreference: dietaryPreference || 'Veg',
      allergies: allergies || 'None',
      isVerified: userRole !== 'student', // student can be approved or auto-approved
      verificationStatus: userRole === 'student' ? 'approved' : 'approved',
      semesterFee: 25000,
      annualFee: 50000
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        branch: user.branch,
        phone: user.phone,
        hostel: user.hostel,
        roomNo: user.roomNo,
        dietaryPreference: user.dietaryPreference,
        allergies: user.allergies,
        verificationStatus: user.verificationStatus,
        isBlocked: user.isBlocked,
        semesterFee: user.semesterFee,
        annualFee: user.annualFee
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Please contact the mess committee.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        branch: user.branch,
        phone: user.phone || '',
        hostel: user.hostel || 'SVBH',
        roomNo: user.roomNo || '',
        dietaryPreference: user.dietaryPreference || 'Veg',
        allergies: user.allergies || 'None',
        verificationStatus: user.verificationStatus || 'approved',
        isBlocked: user.isBlocked || false,
        semesterFee: user.semesterFee || 25000,
        annualFee: user.annualFee || 50000
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        branch: user.branch,
        phone: user.phone || '',
        hostel: user.hostel || 'SVBH',
        roomNo: user.roomNo || '',
        dietaryPreference: user.dietaryPreference || 'Veg',
        allergies: user.allergies || 'None',
        verificationStatus: user.verificationStatus || 'approved',
        isBlocked: user.isBlocked || false,
        semesterFee: user.semesterFee || 25000,
        annualFee: user.annualFee || 50000
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, hostel, roomNo, dietaryPreference, allergies, branch, regNo } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (hostel) user.hostel = hostel;
    if (roomNo !== undefined) user.roomNo = roomNo;
    if (dietaryPreference) user.dietaryPreference = dietaryPreference;
    if (allergies !== undefined) user.allergies = allergies;
    if (branch) user.branch = branch;
    if (regNo) user.regNo = regNo;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        branch: user.branch,
        phone: user.phone,
        hostel: user.hostel,
        roomNo: user.roomNo,
        dietaryPreference: user.dietaryPreference,
        allergies: user.allergies,
        verificationStatus: user.verificationStatus,
        isBlocked: user.isBlocked,
        semesterFee: user.semesterFee,
        annualFee: user.annualFee
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get Mess Fee and Opt-Out deduction summary for the student
// @route   GET /api/auth/fee-summary
// @access  Private (Student)
export const getFeeSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const baseSemesterFee = user.semesterFee || 25000;
    const baseAnnualFee = user.annualFee || 50000;

    // Get all opt-outs for this student
    const optouts = await OptOut.find({ student: req.user._id }).sort({ date: -1 });

    const mealRates = {
      breakfast: 40,
      lunch: 70,
      dinner: 70,
      snacks: 20
    };

    let totalOptOutMeals = optouts.length;
    let totalRefundEarned = 0;
    const mealBreakdown = {
      breakfast: { count: 0, refund: 0, rate: mealRates.breakfast },
      lunch: { count: 0, refund: 0, rate: mealRates.lunch },
      dinner: { count: 0, refund: 0, rate: mealRates.dinner },
      snacks: { count: 0, refund: 0, rate: mealRates.snacks }
    };

    optouts.forEach(opt => {
      const meal = opt.mealType;
      const amount = opt.refundAmount || mealRates[meal] || 50;
      totalRefundEarned += amount;

      if (mealBreakdown[meal]) {
        mealBreakdown[meal].count += 1;
        mealBreakdown[meal].refund += amount;
      }
    });

    const netAdjustedFee = Math.max(0, baseSemesterFee - totalRefundEarned);

    res.status(200).json({
      success: true,
      feeScheme: {
        semesterFee: baseSemesterFee,
        annualFee: baseAnnualFee,
        mealRates
      },
      summary: {
        baseFee: baseSemesterFee,
        totalOptOutMeals,
        totalRefundEarned,
        netAdjustedFee,
        savingsPercentage: Number(((totalRefundEarned / baseSemesterFee) * 100).toFixed(2))
      },
      mealBreakdown,
      recentOptOuts: optouts.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating fee summary',
      error: error.message
    });
  }
};

// @desc    Get all users (for members directory)
// @route   GET /api/auth/users
// @access  Private
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
