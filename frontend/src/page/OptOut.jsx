import React, { useState, useEffect } from 'react';
import {
  CalendarOff,
  Clock,
  Check,
  X,
  AlertTriangle,
  IndianRupee,
  Receipt,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Calendar
} from 'lucide-react';
import { optoutAPI, menuAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function OptOut() {
  const { user } = useAuth();
  const [todayMenu, setTodayMenu] = useState([]);
  const [myOptOuts, setMyOptOuts] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const MEAL_TIMES = {
    breakfast: 8,
    lunch: 12,
    snacks: 16,
    dinner: 20
  };
  const CUTOFF_HOURS = 2;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, optOutRes, feeRes] = await Promise.all([
        menuAPI.getToday(),
        optoutAPI.getMine(),
        authAPI.getFeeSummary().catch(() => ({ data: null }))
      ]);
      setTodayMenu(menuRes.data?.menus || []);
      setMyOptOuts(optOutRes.data?.optOuts || []);
      if (feeRes?.data?.success) {
        setFeeSummary(feeRes.data);
      }
    } catch (err) {
      console.log('Error fetching data:', err);
    }
    setLoading(false);
  };

  const isOptedOut = (date, mealType) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return myOptOuts.find(opt => {
      const optDate = new Date(opt.date);
      optDate.setHours(0, 0, 0, 0);
      return optDate.getTime() === normalizedDate.getTime() && opt.mealType === mealType;
    });
  };

  const isCutoffPassed = (date, mealType) => {
    const mealDate = new Date(date);
    mealDate.setHours(MEAL_TIMES[mealType] || 12, 0, 0, 0);

    const cutoff = new Date(mealDate);
    cutoff.setHours(cutoff.getHours() - CUTOFF_HOURS);

    return new Date() > cutoff;
  };

  const handleOptOut = async (mealType) => {
    setActionLoading(mealType);
    setMessage({ type: '', text: '' });

    try {
      const existing = isOptedOut(selectedDate, mealType);

      if (existing) {
        await optoutAPI.cancel(existing._id);
        setMessage({ type: 'success', text: `Opted back in for ${mealType}! (₹25k ledger updated)` });
      } else {
        await optoutAPI.create({ date: selectedDate, mealType });
        setMessage({ type: 'success', text: `Opted out of ${mealType} successfully! Refund added to your ₹25k semester fee ledger.` });
      }

      // Refresh opt-outs & fee summary
      const [res, feeRes] = await Promise.all([
        optoutAPI.getMine(),
        authAPI.getFeeSummary().catch(() => ({ data: null }))
      ]);
      setMyOptOuts(res.data?.optOuts || []);
      if (feeRes?.data?.success) {
        setFeeSummary(feeRes.data);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Something went wrong'
      });
    }
    setActionLoading('');
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const getMealEmoji = (type) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'snacks': return '🍪';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTime = (type) => {
    switch (type) {
      case 'breakfast': return '7:30 – 9:30 AM';
      case 'lunch': return '12:00 – 2:00 PM';
      case 'snacks': return '4:00 – 5:30 PM';
      case 'dinner': return '7:30 – 9:30 PM';
      default: return '';
    }
  };

  const totalSavedRefund = feeSummary?.summary?.totalRefundEarned || (myOptOuts.length * 60);
  const netFee = feeSummary?.summary?.netAdjustedFee || (25000 - totalSavedRefund);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-red-600/20 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <IndianRupee className="w-3.5 h-3.5" /> ₹25,000 / Semester Mess Fee Rebate System
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Meal Opt-Out & Rebate System
              </h1>
              <p className="mt-1 text-slate-300 text-sm sm:text-base max-w-2xl">
                Skip meals you won't attend before the 2-hour cutoff. Reduce food wastage and accumulate semester-end fee refunds!
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex-shrink-0"
            >
              <Receipt className="w-4 h-4" /> View ₹25k Ledger <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* 25K Mess Fee Deduction Quick Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400">Total Opt-Outs</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{myOptOuts.length} meals</div>
          </div>
          <div className="bg-[#161b22] border border-emerald-500/30 rounded-xl p-4">
            <span className="text-xs text-emerald-400">Accumulated Refund</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1 flex items-center">
              + <IndianRupee className="w-5 h-5 mr-0.5" />{totalSavedRefund}
            </div>
          </div>
          <div className="bg-[#161b22] border border-amber-500/30 rounded-xl p-4">
            <span className="text-xs text-amber-400">Net Adjusted Fee (₹25k Scheme)</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5" />{netFee}
            </div>
          </div>
          <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400">Choose Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 text-xs sm:text-sm font-bold text-white bg-[#0d1117] border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 w-full"
            />
          </div>
        </div>

        {/* Meal Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            {selectedDate === new Date().toISOString().split('T')[0]
              ? "Today's Meals"
              : `Meals for ${new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`}
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading meals & opt-out status...</div>
          ) : (
            <div className="space-y-3">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => {
                const meal = todayMenu.find(m => m.mealType === mealType);
                const optedOut = isOptedOut(selectedDate, mealType);
                const cutoffPassed = isCutoffPassed(selectedDate, mealType);
                const rebatePrice = mealType === 'breakfast' ? 40 : mealType === 'lunch' || mealType === 'dinner' ? 70 : 20;

                return (
                  <div
                    key={mealType}
                    className={`bg-[#161b22] rounded-xl border p-5 transition-all duration-200 ${
                      optedOut
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                          optedOut ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'
                        }`}>
                          {getMealEmoji(mealType)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base font-bold capitalize ${optedOut ? 'text-rose-400 line-through' : 'text-white'}`}>
                              {mealType}
                            </h3>
                            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              Rebate: ₹{rebatePrice}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> {getMealTime(mealType)}
                            </span>
                            {meal && (
                              <span className="text-slate-300">
                                Menu: <span className="text-slate-400">{meal.items.join(' • ')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {cutoffPassed && !optedOut ? (
                          <span className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Cutoff Passed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOptOut(mealType)}
                            disabled={actionLoading === mealType}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 ${
                              optedOut
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                            } ${actionLoading === mealType ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {actionLoading === mealType ? (
                              'Updating...'
                            ) : optedOut ? (
                              <><Check className="w-4 h-4" /> Opt Back In</>
                            ) : (
                              <><X className="w-4 h-4" /> Opt Out & Save ₹{rebatePrice}</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Policy Info Card */}
        <div className="p-5 bg-[#161b22] border border-slate-800 rounded-xl space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Official MNNIT Mess Opt-Out & Rebate Policy
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
            <li>Opt out at least <strong>2 hours before</strong> the designated meal start time.</li>
            <li>Each opted-out meal automatically credits a standard refund into your ₹25,000/sem ledger.</li>
            <li>Accurate counts are sent directly to the mess head chef to eliminate food wastage.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
