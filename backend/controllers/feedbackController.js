import Feedback from '../models/Feedback.js';

// @desc    Submit anonymous feedback
// @route   POST /api/feedback
// @access  Student (authenticated but not linked to feedback)
export const submitFeedback = async (req, res) => {
  try {
    const { mealType, rating, comment, responses } = req.body;

    // NOTE: We intentionally do NOT store req.user._id to keep feedback anonymous
    const feedback = await Feedback.create({
      mealType: mealType || 'general',
      rating,
      comment,
      responses: responses || {}
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted anonymously. Thank you!',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all feedback (for workers/admin)
// @route   GET /api/feedback
// @access  Worker/Admin
export const getFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, mealType } = req.query;

    const query = {};
    if (mealType) query.mealType = mealType;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get aggregated feedback stats
// @route   GET /api/feedback/stats
// @access  Worker/Admin
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$mealType',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          maxRating: { $max: '$rating' },
          minRating: { $min: '$rating' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const overallStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      overall: overallStats[0] || { avgRating: 0, totalFeedback: 0 },
      byMealType: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
