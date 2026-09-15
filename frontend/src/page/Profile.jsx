import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  DoorOpen,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  Receipt,
  TrendingDown,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    branch: '',
    phone: '',
    hostel: 'SVBH',
    roomNo: '',
    dietaryPreference: 'Veg',
    allergies: ''
  });

  const loadProfileAndFee = async () => {
    try {
      setLoading(true);
      const [userRes, feeRes] = await Promise.all([
        authAPI.getMe(),
        authAPI.getFeeSummary().catch(() => ({ data: null }))
      ]);

      if (userRes.data?.success) {
        const u = userRes.data.user;
        setUser(u);
        setFormData({
          name: u.name || '',
          regNo: u.regNo || '',
          branch: u.branch || '',
          phone: u.phone || '',
          hostel: u.hostel || 'SVBH',
          roomNo: u.roomNo || '',
          dietaryPreference: u.dietaryPreference || 'Veg',
          allergies: u.allergies || 'None'
        });
      }

      if (feeRes?.data?.success) {
        setFeeSummary(feeRes.data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndFee();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authAPI.updateProfile(formData);
      if (res.data?.success) {
        setUser(res.data.user);
        // update localStorage user data
        localStorage.setItem('messify_user', JSON.stringify(res.data.user));
        setAlertMsg({ type: 'success', text: 'Profile & preferences updated successfully!' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mr-3"></div>
        Loading Student Profile & Mess Ledger...
      </div>
    );
  }

  const baseFee = feeSummary?.summary?.baseFee || 25000;
  const totalRefund = feeSummary?.summary?.totalRefundEarned || 0;
  const netFee = feeSummary?.summary?.netAdjustedFee || baseFee - totalRefund;
  const totalOptOuts = feeSummary?.summary?.totalOptOutMeals || 0;
  const savingsPct = feeSummary?.summary?.savingsPercentage || 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 pb-16 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#161b22] to-slate-900 border border-slate-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-orange-500/20">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                  {user?.verificationStatus === 'approved' || user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-1">{user?.email} • {user?.regNo || 'Reg: N/A'} • {user?.branch || 'MNNIT'}</p>
              </div>
            </div>

            <Link
              to="/optout"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition"
            >
              <UtensilsCrossed className="w-4 h-4" /> Opt Out Meals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {alertMsg.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            alertMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="text-sm font-medium">{alertMsg.text}</span>
          </div>
        )}

        {/* 25K Mess Fee & Opt-out Ledger Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" /> College Mess Fee & Deduction Ledger
            </h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Institutional Scheme: ₹25,000 / Semester (₹50,000 / Year)
            </span>
          </div>

          {/* Fee Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium text-slate-400">Base Semester Mess Fee</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-center">
                <IndianRupee className="w-6 h-6 mr-0.5 text-slate-400" /> {baseFee.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">₹50,000 / academic year</p>
            </div>

            <div className="bg-[#161b22] border border-emerald-500/30 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">Opt-Out Refund Deductions</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {savingsPct}% Saved
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5 flex items-center">
                - <IndianRupee className="w-6 h-6 mr-0.5 text-emerald-400" /> {totalRefund.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{totalOptOuts} meals opted out this term</p>
            </div>

            <div className="bg-[#161b22] border border-amber-500/30 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium text-amber-400">Net Adjusted Mess Fee</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5 flex items-center">
                <IndianRupee className="w-6 h-6 mr-0.5 text-amber-400" /> {netFee.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Current net semester liability</p>
            </div>

            <div className="bg-[#161b22] border border-blue-500/30 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium text-blue-400">Standard Rebate Rates</span>
              <div className="text-xs text-slate-300 mt-2 space-y-1">
                <div className="flex justify-between"><span>Breakfast:</span><span className="font-semibold text-white">₹40 / meal</span></div>
                <div className="flex justify-between"><span>Lunch:</span><span className="font-semibold text-white">₹70 / meal</span></div>
                <div className="flex justify-between"><span>Dinner:</span><span className="font-semibold text-white">₹70 / meal</span></div>
              </div>
            </div>
          </div>

          {/* Recent Opt-Out Deductions Table */}
          {feeSummary?.recentOptOuts && feeSummary.recentOptOuts.length > 0 && (
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" /> Recent Opt-Out Refund Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0d1117] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Meal</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3 text-right">Rebate Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {feeSummary.recentOptOuts.map((opt) => (
                      <tr key={opt._id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-200">
                          {new Date(opt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-3 capitalize font-semibold text-amber-400">{opt.mealType}</td>
                        <td className="py-2.5 px-3 text-slate-400">{opt.reason || 'Attending other commitments'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          + ₹{opt.refundAmount || 50}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Profile Details Edit Form */}
        <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" /> Personal Details & Dietary Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Keep your contact details, hostel room, and food preferences up to date for kitchen planning.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number</label>
                <input
                  type="text"
                  value={formData.regNo}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hostel Name</label>
                <select
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="SVBH">SVBH (Swami Vivekanand Boys Hostel)</option>
                  <option value="KNGH">KNGH (Kalpana Chawla Girls Hostel)</option>
                  <option value="Tandon">Tandon Hostel</option>
                  <option value="Malviya">Malviya Hostel</option>
                  <option value="Tilak">Tilak Hostel</option>
                  <option value="Patel">Patel Hostel</option>
                  <option value="PG Boys">PG Boys Hostel</option>
                  <option value="PG Girls">PG Girls Hostel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. A-214"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dietary Preference</label>
                <select
                  value={formData.dietaryPreference}
                  onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Veg">Vegetarian (Standard)</option>
                  <option value="Non-Veg">Non-Vegetarian (Eggs/Chicken/Fish allowed)</option>
                  <option value="Jain">Jain (No Root Vegetables/Onion/Garlic)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Food Allergies / Dietary Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Lactose intolerant, Gluten sensitive, None"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition"
              >
                {saving ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Profile Preferences</>}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
