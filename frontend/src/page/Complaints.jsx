import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Utensils,
  ChevronRight,
  Send,
  X
} from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    category: 'Food Quality',
    subject: '',
    description: '',
    mealType: 'general',
    mealDate: new Date().toISOString().split('T')[0],
    urgency: 'medium'
  });

  const categories = [
    'Food Quality',
    'Hygiene & Cleanliness',
    'Staff Behavior',
    'Billing & Mess Fee',
    'Menu & Timings',
    'Infrastructure',
    'Other'
  ];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getMyComplaints();
      if (res.data?.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setAlertMsg({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await complaintAPI.create(formData);
      if (res.data?.success) {
        setAlertMsg({ type: 'success', text: 'Complaint lodged successfully! Mess committee has been notified.' });
        setShowModal(false);
        setFormData({
          category: 'Food Quality',
          subject: '',
          description: '',
          mealType: 'general',
          mealDate: new Date().toISOString().split('T')[0],
          urgency: 'medium'
        });
        fetchComplaints();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit complaint' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>;
      case 'in-progress':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Clock className="w-3.5 h-3.5" /> In Review</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><X className="w-3.5 h-3.5" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white uppercase tracking-wider">Emergency</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">Low</span>;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.subject?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 pb-16 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
                <ShieldAlert className="w-3.5 h-3.5" /> Mess Grievance Redressal
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Student Complaints & Feedback Portal
              </h1>
              <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-2xl">
                Report hygiene issues, food quality concerns, staff behavior, or billing discrepancies. Track resolution progress in real time.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" /> Lodge New Complaint
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertMsg.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            alertMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-medium">{alertMsg.text}</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-400">Total Lodged</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#161b22] border border-amber-500/20 rounded-xl p-4 sm:p-5">
            <span className="text-xs font-medium text-amber-400">Pending Review</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-[#161b22] border border-blue-500/20 rounded-xl p-4 sm:p-5">
            <span className="text-xs font-medium text-blue-400">In Progress</span>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-[#161b22] border border-emerald-500/20 rounded-xl p-4 sm:p-5">
            <span className="text-xs font-medium text-emerald-400">Resolved</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{stats.resolved}</div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject, keywords, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
            <p>Loading complaints records...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No complaints found</h3>
            <p className="text-slate-400 text-sm mt-1">
              {complaints.length === 0 ? "You haven't submitted any complaints yet. Use the button above if you face any issues." : "No complaints match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((item) => (
              <div
                key={item._id}
                className="bg-[#161b22] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition duration-150 space-y-4 shadow-sm"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {item.category}
                    </span>
                    {getUrgencyBadge(item.urgency)}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {item.mealType && item.mealType !== 'general' && (
                      <span className="text-xs text-slate-400 capitalize flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-orange-400" />
                        {item.mealType}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{item.subject}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>

                {/* Admin Official Resolution Box */}
                {item.adminResponse && (
                  <div className="bg-[#0f1d24] border border-cyan-800/40 rounded-lg p-4 mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Administration Resolution & Response:
                      </span>
                      {item.resolvedByName && (
                        <span className="text-[11px] text-slate-400 font-medium">By {item.resolvedByName}</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed whitespace-pre-wrap">{item.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lodge Complaint Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Lodge Official Complaint</h3>
                    <p className="text-xs text-slate-400">Directly routed to the hostel warden and mess supervisor</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Urgency Level</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="low">Low (General Feedback)</option>
                      <option value="medium">Medium (Standard Issue)</option>
                      <option value="high">High (Action Required Today)</option>
                      <option value="emergency">Emergency (Severe Hygiene / Health Risk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Associated Meal (Optional)</label>
                    <select
                      value={formData.mealType}
                      onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="general">General / Non-Meal specific</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date of Incident</label>
                    <input
                      type="date"
                      value={formData.mealDate}
                      onChange={(e) => setFormData({ ...formData, mealDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Undercooked vegetables in Wednesday dinner"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific details about the issue, counter location, or timing to help investigate..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
                  >
                    {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Complaint</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Complaints;
