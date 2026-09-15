import { useState, useEffect } from 'react';
import { UtensilsCrossed, Clock, IndianRupee } from 'lucide-react';
import { menuAPI } from '../services/api';

export default function Menu() {
  const [menus, setMenus] = useState({});
  const [activeDay, setActiveDay] = useState('');
  const [loading, setLoading] = useState(true);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
  };
  const dayFullLabels = {
    monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
    friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
  };

  const mealConfig = {
    breakfast: { emoji: '🌅', time: '7:30 – 9:30 AM', gradient: 'from-amber-400 to-orange-500' },
    lunch: { emoji: '☀️', time: '12:00 – 2:00 PM', gradient: 'from-blue-500 to-cyan-500' },
    snacks: { emoji: '🍪', time: '4:00 – 5:30 PM', gradient: 'from-green-400 to-emerald-500' },
    dinner: { emoji: '🌙', time: '7:30 – 9:30 PM', gradient: 'from-indigo-500 to-purple-600' }
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await menuAPI.getAll();
        setMenus(res.data.organized || {});
      } catch (err) {
        console.log('Menu fetch error:', err);
      }
      setLoading(false);
    };
    fetchMenus();

    // Set today as active day
    const jsDay = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    setActiveDay(dayMap[jsDay]);
  }, []);

  const getTodayTag = (day) => {
    const jsDay = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[jsDay] === day;
  };

  // Calculate total daily cost
  const getDailyTotal = (dayMenus) => {
    if (!dayMenus) return 0;
    return Object.values(dayMenus).reduce((sum, meal) => sum + (meal?.price || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-4xl font-extrabold mb-2">Weekly Menu</h1>
          <p className="text-blue-200 text-lg">View daily meals, items, and pricing for the entire week</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Day Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`relative px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex-shrink-0 ${
                activeDay === day
                  ? 'bg-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <span className="hidden md:inline">{dayFullLabels[day]}</span>
              <span className="md:hidden">{dayLabels[day]}</span>
              {getTodayTag(day) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              )}
            </button>
          ))}
        </div>

        {/* Menu Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-100">
                <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{dayFullLabels[activeDay]}'s Menu</h2>
              {menus[activeDay] && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">
                  <IndianRupee className="w-4 h-4" />
                  Daily Total: ₹{getDailyTotal(menus[activeDay])}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map((mealType) => {
                const meal = menus[activeDay]?.[mealType];
                const config = mealConfig[mealType];

                return (
                  <div
                    key={mealType}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4 flex items-center justify-between`}>
                      <div>
                        <h3 className="text-white font-bold text-lg capitalize flex items-center gap-2">
                          {config.emoji} {mealType}
                        </h3>
                        <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                          <Clock className="w-3 h-3" />
                          {config.time}
                        </div>
                      </div>
                      {meal && (
                        <span className="bg-white/25 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-lg font-extrabold">
                          ₹{meal.price}
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      {meal ? (
                        <ul className="space-y-2">
                          {meal.items.map((item, idx) => (
                            <li key={idx} className="text-gray-700 flex items-center gap-3">
                              <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                              <span className="text-sm font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-6">
                          <UtensilsCrossed className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Menu not available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Info Footer */}
        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> Menu items and prices may change. Real-time updates are posted via notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
