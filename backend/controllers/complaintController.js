import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
export const createComplaint = async (req, res) => {
  try {
    const { category, subject, description, mealType, mealDate, urgency } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, subject, and description'
      });
    }

    const user = await User.findById(req.user._id);

    const complaint = await Complaint.create({
      student: req.user._id,
      studentName: user.name,
      studentEmail: user.email,
      regNo: user.regNo || 'N/A',
      hostel: user.hostel || 'SVBH',
      roomNo: user.roomNo || '',
      category,
      subject,
      description,
      mealType: mealType || 'general',
      mealDate: mealDate || new Date(),
      urgency: urgency || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
};

// @desc    Get current student's complaints
// @route   GET /api/complaints/my
// @access  Private (Student)
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// @desc    Get all complaints (Worker/Admin)
// @route   GET /api/complaints
// @access  Private (Worker, Admin)
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, urgency, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (urgency && urgency !== 'all') {
      filter.urgency = urgency;
    }
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name email regNo hostel roomNo');

    // Summary counts
    const totalCount = await Complaint.countDocuments();
    const pendingCount = await Complaint.countDocuments({ status: 'pending' });
    const inProgressCount = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'resolved' });

    res.status(200).json({
      success: true,
      count: complaints.length,
      stats: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount
      },
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
};

// @desc    Update complaint status and admin response
// @route   PUT /api/complaints/:id/status
// @access  Private (Worker, Admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

    if (status === 'resolved' || status === 'rejected') {
      complaint.resolvedBy = req.user._id;
      complaint.resolvedByName = req.user.name;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin or complaint owner)
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Only creator or admin can delete
    if (complaint.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message
    });
  }
};
