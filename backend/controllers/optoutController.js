import OptOut from '../models/OptOut.js';
import Menu from '../models/Menu.js';

// Meal times (24-hour format) — used for cutoff enforcement
const MEAL_TIMES = {
  breakfast: 8,   // 8:00 AM
  lunch: 12,      // 12:00 PM
  snacks: 16,     // 4:00 PM
  dinner: 20      // 8:00 PM
};

const CUTOFF_HOURS = 2; // Must opt-out at least 2 hours before meal

// @desc    Create an opt-out
// @route   POST /api/optouts
// @access  Student
export const createOptOut = async (req, res) => {
  try {
    const { date, mealType } = req.body;

    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Date and meal type are required'
      });
    }

    // Enforce cutoff time
    const mealDate = new Date(date);
    const now = new Date();

    // Set meal time on the meal date
    const mealDateTime = new Date(mealDate);
    mealDateTime.setHours(MEAL_TIMES[mealType.toLowerCase()] || 12, 0, 0, 0);

    // Calculate cutoff: meal time minus CUTOFF_HOURS
    const cutoffTime = new Date(mealDateTime);
    cutoffTime.setHours(cutoffTime.getHours() - CUTOFF_HOURS);

    if (now > cutoffTime) {
      return res.status(400).json({
        success: false,
        message: `Cutoff time has passed. You must opt out at least ${CUTOFF_HOURS} hours before the meal.`
      });
    }

    // Normalize the date to start of day for consistent storage
    const normalizedDate = new Date(mealDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const optOut = await OptOut.create({
      student: req.user._id,
      date: normalizedDate,
      mealType: mealType.toLowerCase()
    });

    res.status(201).json({
      success: true,
      optOut
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already opted out of this meal'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my opt-outs
// @route   GET /api/optouts/me
// @access  Student
export const getMyOptOuts = async (req, res) => {
  try {
    const optOuts = await OptOut.find({ student: req.user._id })
      .sort({ date: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: optOuts.length,
      optOuts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel an opt-out
// @route   DELETE /api/optouts/:id
// @access  Student
export const cancelOptOut = async (req, res) => {
  try {
    const optOut = await OptOut.findById(req.params.id);

    if (!optOut) {
      return res.status(404).json({
        success: false,
        message: 'Opt-out not found'
      });
    }

    // Ensure the student owns this opt-out
    if (optOut.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this opt-out'
      });
    }

    // Check cutoff for cancellation too
    const mealDateTime = new Date(optOut.date);
    mealDateTime.setHours(MEAL_TIMES[optOut.mealType] || 12, 0, 0, 0);
    const cutoffTime = new Date(mealDateTime);
    cutoffTime.setHours(cutoffTime.getHours() - CUTOFF_HOURS);

    if (new Date() > cutoffTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel opt-out — cutoff time has passed'
      });
    }

    await optOut.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opt-out cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get opt-out statistics (for workers/admin)
// @route   GET /api/optouts/stats
// @access  Worker/Admin
export const getOptOutStats = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const stats = await OptOut.aggregate([
      {
        $match: {
          date: { $gte: queryDate, $lt: nextDay }
        }
      },
      {
        $group: {
          _id: '$mealType',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      date: queryDate.toISOString().split('T')[0],
      breakfast: 0,
      lunch: 0,
      snacks: 0,
      dinner: 0
    };

    stats.forEach(s => {
      result[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      stats: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Calculate refund for a student
// @route   GET /api/optouts/refund/:studentId
// @access  Worker/Admin
export const calculateRefund = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { student: studentId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const optOuts = await OptOut.find(query);

    // Get menu prices for refund calculation
    const menus = await Menu.find();
    const priceMap = {};
    menus.forEach(m => {
      priceMap[`${m.day}_${m.mealType}`] = m.price;
    });

    let totalRefund = 0;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const breakdown = optOuts.map(opt => {
      const dayName = days[new Date(opt.date).getDay()];
      const price = priceMap[`${dayName}_${opt.mealType}`] || 0;
      totalRefund += price;

      return {
        date: opt.date,
        mealType: opt.mealType,
        refundAmount: price
      };
    });

    res.status(200).json({
      success: true,
      studentId,
      totalOptOuts: optOuts.length,
      totalRefund,
      breakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
