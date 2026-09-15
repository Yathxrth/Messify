import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  UtensilsCrossed,
  Bell,
  MessageSquare,
  Plus,
  Save,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  CalendarOff,
  IndianRupee,
  UserCheck,
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  X,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import {
  menuAPI,
  feedbackAPI,
  notificationAPI,
  optoutAPI,
  adminAPI,
  complaintAPI
} from '../services/api';

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Student Verification & Management
  const [students, setStudents] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  const [studentBlockedFilter, setStudentBlockedFilter] = useState('all');

  // 2. Ratings & Feedback
  const [ratingsList, setRatingsList] = useState([]);
  const [ratingMealFilter, setRatingMealFilter] = useState('all');
  const [ratingStarFilter, setRatingStarFilter] = useState('all');
  const [ratingDishSearch, setRatingDishSearch] = useState('');

  // 3. Complaints
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintStats, setComplaintStats] = useState(null);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState('all');
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [adminNewStatus, setAdminNewStatus] = useState('resolved');

  // 4. Attendance Reports
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceReport, setAttendanceReport] = useState(null);

  // 5. Analytics
  const [analyticsData, setAnalyticsData] = useState(null);

  // 6. Menu Management
  const [menus, setMenus] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [newMenu, setNewMenu] = useState({ day: 'monday', mealType: 'breakfast', items: '', price: '' });
  const [showAddMenu, setShowAddMenu] = useState(false);

  // 7. Notification state
  const [newNotif, setNewNotif] = useState({ title: '', message: '', type: 'general' });

  const tabs = [
    { id: 'verification', label: 'Student Verification', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'ratings', label: 'View Ratings', icon: <Star className="w-4 h-4" /> },
    { id: 'complaints', label: 'Complaint Management', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics & Trends', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu Management', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'notifications', label: 'Post Announcements', icon: <Bell className="w-4 h-4" /> },
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    fetchDataForTab(activeTab);
  }, [activeTab]);

  const fetchDataForTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'verification') {
        const res = await adminAPI.getStudents({
          search: studentSearch,
          status: studentStatusFilter,
          blocked: studentBlockedFilter
        });
        if (res.data?.success) {
          setStudents(res.data.students || []);
          setStudentStats(res.data.stats || null);
        }
      } else if (tab === 'ratings') {
        const res = await adminAPI.getFilteredRatings({
          mealType: ratingMealFilter,
          rating: ratingStarFilter,
          search: ratingDishSearch
        });
        if (res.data?.success) {
          setRatingsList(res.data.ratings || []);
        }
      } else if (tab === 'complaints') {
        const res = await complaintAPI.getAll({
          status: complaintStatusFilter,
          category: complaintCategoryFilter
        });
        if (res.data?.success) {
          setComplaintsList(res.data.complaints || []);
          setComplaintStats(res.data.stats || null);
        }
      } else if (tab === 'attendance') {
        const res = await adminAPI.getAttendanceReport(attendanceDate);
        if (res.data?.success) {
          setAttendanceReport(res.data);
        }
      } else if (tab === 'analytics') {
        const res = await adminAPI.getAnalytics();
        if (res.data?.success) {
          setAnalyticsData(res.data.analytics);
        }
      } else if (tab === 'menu') {
        const menuRes = await menuAPI.getAll();
        setMenus(menuRes.data?.menus || []);
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Student Actions
  const handleVerifyStudent = async (id, status) => {
    try {
      const res = await adminAPI.verifyStudent(id, status);
      if (res.data?.success) {
        showMessage('success', `Student account ${status}!`);
        fetchDataForTab('verification');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      const res = await adminAPI.toggleBlock(id, !currentStatus);
      if (res.data?.success) {
        showMessage('success', `Student ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`);
        fetchDataForTab('verification');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Block update failed');
    }
  };

  // Complaint Actions
  const handleRespondComplaint = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      const res = await complaintAPI.updateStatus(activeComplaint._id, {
        status: adminNewStatus,
        adminResponse: adminResponseText
      });
      if (res.data?.success) {
        showMessage('success', 'Complaint resolution saved & sent to student!');
        setActiveComplaint(null);
        setAdminResponseText('');
        fetchDataForTab('complaints');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update complaint');
    }
  };

  // Menu Handlers
  const handleAddMenu = async () => {
    try {
      const items = newMenu.items.split(',').map(i => i.trim()).filter(i => i);
      await menuAPI.create({
        day: newMenu.day,
        mealType: newMenu.mealType,
        items,
        price: Number(newMenu.price)
      });
      showMessage('success', 'Menu entry added!');
      setShowAddMenu(false);
      setNewMenu({ day: 'monday', mealType: 'breakfast', items: '', price: '' });
      fetchDataForTab('menu');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to add menu');
    }
  };

  const handleUpdateMenu = async (id) => {
    try {
      const items = editingMenu.items;
      await menuAPI.update(id, {
        items: typeof items === 'string' ? items.split(',').map(i => i.trim()) : items,
        price: Number(editingMenu.price)
      });
      showMessage('success', 'Menu updated!');
      setEditingMenu(null);
      fetchDataForTab('menu');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update menu');
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm('Delete this menu entry?')) return;
    try {
      await menuAPI.delete(id);
      showMessage('success', 'Menu deleted!');
      fetchDataForTab('menu');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to delete menu');
    }
  };

  // Notification Handler
  const handlePostNotification = async () => {
    if (!newNotif.title || !newNotif.message) {
      showMessage('error', 'Title and message are required');
      return;
    }
    try {
      await notificationAPI.create(newNotif);
      showMessage('success', 'Broadcast announcement posted successfully!');
      setNewNotif({ title: '', message: '', type: 'general' });
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to post notification');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#161b22] to-slate-900 border border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> MNNIT Mess Administration Control Center
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin & Worker Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">
                Student Verifications • Rating Analytics • Complaints Redressal • Meal Attendance Projections
              </p>
            </div>
            <button
              onClick={() => fetchDataForTab(activeTab)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
            </button>
          </div>
        </div>

        {/* Toast / Message */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                  : 'bg-[#161b22] text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: STUDENT VERIFICATION & MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            {studentStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Total Registered</span>
                  <div className="text-2xl font-bold text-white mt-1">{studentStats.total}</div>
                </div>
                <div className="bg-[#161b22] border border-amber-500/20 rounded-xl p-4">
                  <span className="text-xs text-amber-400 font-medium">Pending Verification</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{studentStats.pending}</div>
                </div>
                <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl p-4">
                  <span className="text-xs text-emerald-400 font-medium">Approved / Verified</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{studentStats.approved}</div>
                </div>
                <div className="bg-[#161b22] border border-rose-500/20 rounded-xl p-4">
                  <span className="text-xs text-rose-400 font-medium">Suspended / Blocked</span>
                  <div className="text-2xl font-bold text-rose-400 mt-1">{studentStats.blocked}</div>
                </div>
              </div>
            )}

            {/* Filter Toolbar */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, regNo, or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDataForTab('verification')}
                  className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={studentStatusFilter}
                  onChange={(e) => { setStudentStatusFilter(e.target.value); }}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Verification</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={studentBlockedFilter}
                  onChange={(e) => { setStudentBlockedFilter(e.target.value); }}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Accounts</option>
                  <option value="false">Active Only</option>
                  <option value="true">Blocked Only</option>
                </select>

                <button
                  onClick={() => fetchDataForTab('verification')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-[#0d1117] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Reg No / Branch</th>
                      <th className="py-3 px-4">Hostel / Room</th>
                      <th className="py-3 px-4">Diet Preference</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading students...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-400">No students found matching query.</td></tr>
                    ) : (
                      students.map(s => (
                        <tr key={s._id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{s.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{s.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{s.regNo || 'N/A'}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{s.branch || 'MNNIT'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{s.hostel || 'SVBH'}</div>
                            <div className="text-[11px] text-slate-400">Room: {s.roomNo || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              s.dietaryPreference === 'Veg' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              s.dietaryPreference === 'Non-Veg' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {s.dietaryPreference || 'Veg'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {s.verificationStatus === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            ) : s.verificationStatus === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-rose-400 font-medium text-xs">
                                <X className="w-3.5 h-3.5" /> Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-400 font-medium text-xs">
                                <Clock className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {s.isBlocked ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Blocked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {s.verificationStatus !== 'approved' && (
                                <button
                                  onClick={() => handleVerifyStudent(s._id, 'approved')}
                                  title="Approve Registration"
                                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold"
                                >
                                  Approve
                                </button>
                              )}
                              {s.verificationStatus !== 'rejected' && (
                                <button
                                  onClick={() => handleVerifyStudent(s._id, 'rejected')}
                                  title="Reject Registration"
                                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleBlock(s._id, s.isBlocked)}
                                title={s.isBlocked ? 'Unblock User' : 'Block User'}
                                className={`p-1.5 rounded-lg border text-xs font-semibold ${
                                  s.isBlocked
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                                }`}
                              >
                                {s.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: VIEW RATINGS & FILTERED FEEDBACK */}
        {/* ======================================================== */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by dish name (e.g. Biryani, Paneer, Paratha)..."
                  value={ratingDishSearch}
                  onChange={(e) => setRatingDishSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchDataForTab('ratings')}
                  className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ratingMealFilter}
                  onChange={(e) => setRatingMealFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Meals</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>

                <select
                  value={ratingStarFilter}
                  onChange={(e) => setRatingStarFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Ratings (1-5★)</option>
                  <option value="5">5 Stars Only ★★★★★</option>
                  <option value="4">4 Stars ★★★★</option>
                  <option value="3">3 Stars ★★★</option>
                  <option value="2">2 Stars ★★</option>
                  <option value="1">1 Star ★</option>
                </select>

                <button
                  onClick={() => fetchDataForTab('ratings')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 text-center py-12 text-slate-400">Loading student ratings...</div>
              ) : ratingsList.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-[#161b22] border border-slate-800 rounded-xl">
                  <Star className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No ratings found for the selected criteria.</p>
                </div>
              ) : (
                ratingsList.map(r => (
                  <div key={r._id} className="bg-[#161b22] border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                          {r.mealType || 'Meal'}
                        </span>
                        {r.dishName && (
                          <span className="text-xs font-semibold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {r.dishName}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(r.rating || 5)}
                        <span className="text-xs font-bold text-amber-400">{r.rating} / 5</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">By {r.student?.name || 'Anonymous Student'}</span>
                    </div>

                    {r.comment && (
                      <p className="text-xs sm:text-sm text-slate-300 bg-[#0d1117] p-3 rounded-lg border border-slate-800 italic">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COMPLAINT MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            {/* Complaint Stats */}
            {complaintStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400">Total Grievances</span>
                  <div className="text-2xl font-bold text-white mt-1">{complaintStats.total}</div>
                </div>
                <div className="bg-[#161b22] border border-amber-500/20 rounded-xl p-4">
                  <span className="text-xs text-amber-400">Pending Action</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">{complaintStats.pending}</div>
                </div>
                <div className="bg-[#161b22] border border-blue-500/20 rounded-xl p-4">
                  <span className="text-xs text-blue-400">In Investigation</span>
                  <div className="text-2xl font-bold text-blue-400 mt-1">{complaintStats.inProgress}</div>
                </div>
                <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl p-4">
                  <span className="text-xs text-emerald-400">Resolved & Closed</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{complaintStats.resolved}</div>
                </div>
              </div>
            )}

            {/* Filter Toolbar */}
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={complaintStatusFilter}
                  onChange={(e) => setComplaintStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={complaintCategoryFilter}
                  onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Food Quality">Food Quality</option>
                  <option value="Hygiene & Cleanliness">Hygiene & Cleanliness</option>
                  <option value="Staff Behavior">Staff Behavior</option>
                  <option value="Billing & Mess Fee">Billing & Mess Fee</option>
                  <option value="Menu & Timings">Menu & Timings</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  onClick={() => fetchDataForTab('complaints')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-slate-400">Loading complaints...</div>
              ) : complaintsList.length === 0 ? (
                <div className="text-center py-12 bg-[#161b22] border border-slate-800 rounded-xl text-slate-400">
                  No complaints in this category.
                </div>
              ) : (
                complaintsList.map(c => (
                  <div key={c._id} className="bg-[#161b22] border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {c.category}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          From: <strong className="text-white">{c.studentName}</strong> ({c.regNo || 'Reg N/A'}, {c.hostel || 'SVBH'})
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        c.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        c.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{c.subject}</h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{c.description}</p>
                    </div>

                    {c.adminResponse && (
                      <div className="bg-[#0f1d24] border border-cyan-800/40 rounded-lg p-3 text-xs text-cyan-200">
                        <strong className="text-cyan-400 block mb-1">Current Response ({c.resolvedByName || 'Admin'}):</strong>
                        {c.adminResponse}
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setActiveComplaint(c);
                          setAdminResponseText(c.adminResponse || '');
                          setAdminNewStatus(c.status || 'resolved');
                        }}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold"
                      >
                        Respond & Update Status
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Response Modal */}
            {activeComplaint && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">Resolve Grievance</h3>
                    <button onClick={() => setActiveComplaint(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div><strong className="text-white">Student:</strong> {activeComplaint.studentName} ({activeComplaint.regNo})</div>
                    <div><strong className="text-white">Subject:</strong> {activeComplaint.subject}</div>
                  </div>

                  <form onSubmit={handleRespondComplaint} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Update Status</label>
                      <select
                        value={adminNewStatus}
                        onChange={(e) => setAdminNewStatus(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="in-progress">In Review / Investigation</option>
                        <option value="resolved">Resolved & Fixed</option>
                        <option value="rejected">Rejected / Invalid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Response / Action Taken *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="e.g. Instructed the head cook to adjust spices and verified water purifier serviced."
                        value={adminResponseText}
                        onChange={(e) => setAdminResponseText(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveComplaint(null)}
                        className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                      >
                        Save & Send Response
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ATTENDANCE REPORTS */}
        {/* ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" /> Meal-Wise & Date-Wise Attendance Projections
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time headcount projections for kitchen cooks based on student opt-outs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3.5 py-2 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => fetchDataForTab('attendance')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Generate Report
                </button>
              </div>
            </div>

            {/* Attendance Summary */}
            {attendanceReport && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400">Total Registered Hostel Students</span>
                    <div className="text-3xl font-extrabold text-white mt-1">{attendanceReport.totalStudents}</div>
                  </div>
                  <div className="bg-[#161b22] border border-amber-500/20 rounded-xl p-5">
                    <span className="text-xs text-amber-400">Total Opt-Outs on {attendanceReport.date}</span>
                    <div className="text-3xl font-extrabold text-amber-400 mt-1">{attendanceReport.summary?.totalOptOutsToday}</div>
                  </div>
                  <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl p-5">
                    <span className="text-xs text-emerald-400">Food Waste Prevented</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                      {attendanceReport.summary?.estimatedFoodSavedKg} kg
                    </div>
                  </div>
                </div>

                {/* 4 Meal Projection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => {
                    const data = attendanceReport.meals?.[meal] || {};
                    return (
                      <div key={meal} className="bg-[#161b22] border border-slate-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{meal}</span>
                          <span className="text-[11px] font-semibold text-slate-400">{data.attendanceRate}% turn-up</span>
                        </div>
                        <div>
                          <div className="text-3xl font-black text-white">{data.expectedAttendance}</div>
                          <span className="text-xs text-slate-400">Expected Headcount to Cook</span>
                        </div>
                        <div className="text-xs text-rose-400 pt-2 border-t border-slate-800 flex justify-between">
                          <span>Opted Out / Absent:</span>
                          <strong className="font-bold">{data.optedOutCount} students</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ANALYTICS & TRENDS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsData && (
              <>
                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5">
                    <span className="text-xs text-slate-400">Overall Rating</span>
                    <div className="text-3xl font-extrabold text-amber-400 mt-1 flex items-center gap-1">
                      {analyticsData.overallAvgRating} <Star className="w-5 h-5 fill-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{analyticsData.totalReviews} verified reviews</p>
                  </div>

                  <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl p-5">
                    <span className="text-xs text-emerald-400">Total Food Saved</span>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                      {analyticsData.totalKgSaved} kg
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Through smart opt-outs</p>
                  </div>

                  <div className="bg-[#161b22] border border-blue-500/20 rounded-xl p-5">
                    <span className="text-xs text-blue-400">Total Rebates Refunded</span>
                    <div className="text-3xl font-extrabold text-blue-400 mt-1 flex items-center">
                      <IndianRupee className="w-6 h-6 mr-0.5" /> {analyticsData.totalRefundsGenerated}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Credited to students</p>
                  </div>

                  <div className="bg-[#161b22] border border-purple-500/20 rounded-xl p-5">
                    <span className="text-xs text-purple-400">Grievance Resolution</span>
                    <div className="text-3xl font-extrabold text-purple-400 mt-1">
                      {analyticsData.complaints?.resolutionRate}%
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{analyticsData.complaints?.resolved} of {analyticsData.complaints?.total} resolved</p>
                  </div>
                </div>

                {/* Popular vs Needs Improvement Dishes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Popular */}
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Top 5 Highly Rated Dishes
                    </h3>
                    <div className="space-y-2.5">
                      {analyticsData.popularDishes?.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-[#0d1117] rounded-lg border border-slate-800">
                          <span className="text-xs font-semibold text-white">{d.dish}</span>
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            {d.rating} ★ <span className="text-[11px] text-slate-500">({d.reviewCount})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dishes to improve */}
                  <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" /> Dishes Needing Improvement
                    </h3>
                    <div className="space-y-2.5">
                      {analyticsData.dishesToImprove?.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-[#0d1117] rounded-lg border border-slate-800">
                          <span className="text-xs font-semibold text-slate-300">{d.dish}</span>
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                            {d.rating} ★ <span className="text-[11px] text-slate-500">({d.reviewCount})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MENU MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
              >
                {showAddMenu ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddMenu ? 'Cancel' : 'Add New Menu Item'}
              </button>
            </div>

            {showAddMenu && (
              <div className="bg-[#161b22] rounded-xl p-6 border border-slate-700 shadow-sm space-y-4">
                <h3 className="font-bold text-white text-sm">Add Menu Entry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={newMenu.day}
                    onChange={e => setNewMenu({ ...newMenu, day: e.target.value })}
                    className="px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(d => (
                      <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    value={newMenu.mealType}
                    onChange={e => setNewMenu({ ...newMenu, mealType: e.target.value })}
                    className="px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {['breakfast', 'lunch', 'snacks', 'dinner'].map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={newMenu.items}
                  onChange={e => setNewMenu({ ...newMenu, items: e.target.value })}
                  placeholder="Items (comma separated): Paneer Butter Masala, Jeera Rice, Tandoori Roti, Gulab Jamun"
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    value={newMenu.price}
                    onChange={e => setNewMenu({ ...newMenu, price: e.target.value })}
                    placeholder="Meal Cost (₹)"
                    className="w-40 px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAddMenu}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    <Save className="w-4 h-4" /> Save Menu
                  </button>
                </div>
              </div>
            )}

            {/* Menu List */}
            <div className="space-y-3">
              {menus.map(menu => (
                <div key={menu._id} className="bg-[#161b22] rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition">
                  {editingMenu?._id === menu._id ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold capitalize text-white">{menu.day}</span>
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-semibold capitalize">{menu.mealType}</span>
                      </div>
                      <input
                        type="text"
                        value={typeof editingMenu.items === 'string' ? editingMenu.items : editingMenu.items.join(', ')}
                        onChange={e => setEditingMenu({ ...editingMenu, items: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <div className="flex gap-3 items-center">
                        <input
                          type="number"
                          value={editingMenu.price}
                          onChange={e => setEditingMenu({ ...editingMenu, price: e.target.value })}
                          className="w-32 px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs text-white"
                        />
                        <button
                          onClick={() => handleUpdateMenu(menu._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMenu(null)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold capitalize text-white text-sm">{menu.day}</span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[11px] font-semibold capitalize">{menu.mealType}</span>
                          <span className="text-xs font-bold text-emerald-400">₹{menu.price}</span>
                        </div>
                        <p className="text-xs text-slate-400">{menu.items.join(' • ')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingMenu({ ...menu })}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu._id)}
                          className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: POST ANNOUNCEMENTS */}
        {/* ======================================================== */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl bg-[#161b22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" /> Post Institutional Announcement
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Announcement Title</label>
                <input
                  type="text"
                  value={newNotif.title}
                  onChange={e => setNewNotif({ ...newNotif, title: e.target.value })}
                  placeholder="e.g. Special Mess Timings during Examinations"
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Type</label>
                <select
                  value={newNotif.type}
                  onChange={e => setNewNotif({ ...newNotif, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="general">General</option>
                  <option value="menu">Menu Update</option>
                  <option value="announcement">Important Announcement</option>
                  <option value="alert">Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Message</label>
                <textarea
                  value={newNotif.message}
                  onChange={e => setNewNotif({ ...newNotif, message: e.target.value })}
                  placeholder="Write message details for hostel residents..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              <button
                onClick={handlePostNotification}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition"
              >
                <Send className="w-4 h-4" /> Broadcast Announcement
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
