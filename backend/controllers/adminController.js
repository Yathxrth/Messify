import User from '../models/User.js';
import OptOut from '../models/OptOut.js';
import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';
import Menu from '../models/Menu.js';

// @desc    Get all students with search & filters
// @route   GET /api/admin/students
// @access  Private (Worker, Admin)
export const getStudents = async (req, res) => {
  try {
    const { status, search, branch, blocked } = req.query;
    const filter = { role: 'student' };

    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }
    if (blocked !== undefined && blocked !== 'all') {
      filter.isBlocked = blocked === 'true';
    }
    if (branch && branch !== 'all') {
      filter.branch = { $regex: branch, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingVerification = await User.countDocuments({ role: 'student', verificationStatus: 'pending' });
    const approvedStudents = await User.countDocuments({ role: 'student', verificationStatus: 'approved' });
    const blockedStudents = await User.countDocuments({ role: 'student', isBlocked: true });

    res.status(200).json({
      success: true,
      count: students.length,
      stats: {
        total: totalStudents,
        pending: pendingVerification,
        approved: approvedStudents,
        blocked: blockedStudents
      },
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students list',
      error: error.message
    });
  }
};

// @desc    Verify/Approve/Reject student registration
// @route   PUT /api/admin/students/:id/verify
// @access  Private (Worker, Admin)
export const verifyStudent = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.verificationStatus = status;
    student.isVerified = status === 'approved';
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student account ${status} successfully`,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        verificationStatus: student.verificationStatus,
        isVerified: student.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
};

// @desc    Block or unblock student account
// @route   PUT /api/admin/students/:id/block
// @access  Private (Admin)
export const toggleBlockStudent = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    student.isBlocked = typeof isBlocked === 'boolean' ? isBlocked : !student.isBlocked;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${student.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: student.isBlocked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user block status',
      error: error.message
    });
  }
};

// @desc    Generate date-wise and meal-wise attendance reports
// @route   GET /api/admin/attendance-report
// @access  Private (Worker, Admin)
export const getAttendanceReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Total registered and active students
    const totalStudents = await User.countDocuments({
      role: 'student',
      isBlocked: false,
      verificationStatus: { $ne: 'rejected' }
    });

    // Find all optouts on this date
    const optouts = await OptOut.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('student', 'name email regNo hostel roomNo');

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const mealReports = {};

    mealTypes.forEach(meal => {
      const optedOutList = optouts.filter(o => o.mealType === meal);
      const optedOutCount = optedOutList.length;
      const expectedAttendance = Math.max(0, totalStudents - optedOutCount);
      const attendanceRate = totalStudents > 0 ? ((expectedAttendance / totalStudents) * 100).toFixed(1) : 0;

      mealReports[meal] = {
        totalStudents,
        optedOutCount,
        expectedAttendance,
        attendanceRate: Number(attendanceRate),
        optedOutStudents: optedOutList.map(o => ({
          id: o._id,
          name: o.student?.name || 'Unknown',
          regNo: o.student?.regNo || 'N/A',
          hostel: o.student?.hostel || 'SVBH',
          roomNo: o.student?.roomNo || '',
          reason: o.reason,
          refundAmount: o.refundAmount || 0
        }))
      };
    });

    // Summary across all meals
    const totalOptOutsToday = optouts.length;
    const estimatedFoodSavedKg = (totalOptOutsToday * 0.45).toFixed(1); // avg ~450g per meal saved
    const estimatedSavingsRs = optouts.reduce((acc, curr) => acc + (curr.refundAmount || 50), 0);

    res.status(200).json({
      success: true,
      date: startOfDay.toISOString().split('T')[0],
      totalStudents,
      summary: {
        totalOptOutsToday,
        estimatedFoodSavedKg: Number(estimatedFoodSavedKg),
        estimatedSavingsRs
      },
      meals: mealReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating attendance report',
      error: error.message
    });
  }
};

// @desc    Get comprehensive analytics & ratings
// @route   GET /api/admin/analytics
// @access  Private (Worker, Admin)
export const getAnalytics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOptOuts = await OptOut.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });

    // Aggregate feedback
    const feedbackStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$mealType',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Top rated dishes vs low rated dishes
    const dishRatings = await Feedback.aggregate([
      { $match: { dishName: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$dishName',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    const popularDishes = dishRatings.slice(0, 5).map(d => ({
      dish: d._id,
      rating: Number(d.avgRating.toFixed(1)),
      reviewCount: d.count
    }));

    const dishesToImprove = [...dishRatings].reverse().slice(0, 5).map(d => ({
      dish: d._id,
      rating: Number(d.avgRating.toFixed(1)),
      reviewCount: d.count
    }));

    // Overall average rating
    const overallRatingAgg = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const overallAvgRating = overallRatingAgg.length > 0 ? Number(overallRatingAgg[0].avg.toFixed(1)) : 4.2;
    const totalReviews = overallRatingAgg.length > 0 ? overallRatingAgg[0].count : 0;

    // Estimated waste and refund statistics (25k fee scheme)
    const allOptOuts = await OptOut.find();
    const totalRefundsGenerated = allOptOuts.reduce((acc, cur) => acc + (cur.refundAmount || 60), 0);
    const totalKgSaved = (allOptOuts.length * 0.45).toFixed(1);

    res.status(200).json({
      success: true,
      analytics: {
        totalStudents,
        totalOptOuts,
        totalRefundsGenerated,
        totalKgSaved: Number(totalKgSaved),
        overallAvgRating,
        totalReviews,
        complaints: {
          total: totalComplaints,
          resolved: resolvedComplaints,
          pending: pendingComplaints,
          resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100
        },
        mealFeedback: feedbackStats,
        popularDishes,
        dishesToImprove
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// @desc    Get filtered ratings list
// @route   GET /api/admin/ratings-filtered
// @access  Private (Worker, Admin)
export const getFilteredRatings = async (req, res) => {
  try {
    const { mealType, rating, search, startDate, endDate } = req.query;
    const filter = {};

    if (mealType && mealType !== 'all') {
      filter.mealType = mealType;
    }
    if (rating && rating !== 'all') {
      filter.rating = Number(rating);
    }
    if (search) {
      filter.$or = [
        { dishName: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const ratings = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name email regNo');

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching filtered ratings',
      error: error.message
    });
  }
};
