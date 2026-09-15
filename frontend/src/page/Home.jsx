import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Bell, MessageSquare, CalendarOff, ChevronRight, Clock, Users } from 'lucide-react';
import { menuAPI, notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [todayMenu, setTodayMenu] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuRes = await menuAPI.getToday();
        setTodayMenu(menuRes.data.menus || []);
      } catch (err) {
        console.log('Menu fetch error:', err);
      }

      if (isAuthenticated) {
        try {
          const notifRes = await notificationAPI.getAll({ limit: 3 });
          setNotifications(notifRes.data.notifications || []);
        } catch (err) {
          console.log('Notification fetch error:', err);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [isAuthenticated]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
              Welcome to <span className="text-blue-300">Messify</span>
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              MNNIT Allahabad Mess Management System
            </p>
            <p className="text-blue-300 text-lg">
              {isAuthenticated
                ? `Hey ${user.name}! Here's what's cooking today — ${today}`
                : `Track menus, manage meals, and give feedback — all in one place`
              }
            </p>
          </div>

          {!isAuthenticated && (
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
              <Link
                to="/menu"
                className="px-8 py-3 border-2 border-blue-300 text-blue-100 font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300"
              >
                View Menu
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Today's Menu Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="w-7 h-7 text-blue-700" />
              <h2 className="text-3xl font-bold text-gray-800">Today's Menu</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">{today}</span>
            </div>
            <Link to="/menu" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Full Week <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : todayMenu.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {todayMenu.map((meal) => (
                <div
                  key={meal._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
                    <span className="text-white font-bold capitalize flex items-center gap-2">
                      {getMealEmoji(meal.mealType)} {meal.mealType}
                    </span>
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded text-sm font-bold">
                      ₹{meal.price}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3" />
                      {getMealTime(meal.mealType)}
                    </div>
                    <ul className="space-y-1.5">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No menu available for today yet.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {isAuthenticated && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/menu"
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <UtensilsCrossed className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Weekly Menu</h3>
                <p className="text-gray-500 text-sm">View the full week's menu & prices</p>
              </Link>

              <Link
                to="/optout"
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                  <CalendarOff className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Opt-Out Meals</h3>
                <p className="text-gray-500 text-sm">Skip meals & get semester refunds</p>
              </Link>

              <Link
                to="/feedback"
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Give Feedback</h3>
                <p className="text-gray-500 text-sm">Anonymous feedback about food</p>
              </Link>

              <Link
                to="/notification"
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                  <Bell className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Notifications</h3>
                <p className="text-gray-500 text-sm">Stay updated with announcements</p>
              </Link>
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        {isAuthenticated && notifications.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-700" />
                <h2 className="text-2xl font-bold text-gray-800">Recent Updates</h2>
              </div>
              <Link to="/notification" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif._id} className="bg-white rounded-lg p-5 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notif.type === 'alert' ? 'bg-red-500' :
                      notif.type === 'menu' ? 'bg-blue-500' :
                      notif.type === 'announcement' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">MNNIT Allahabad Mess Services</h3>
          </div>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Messify streamlines your daily mess operations — view menus, opt-out of meals, submit anonymous feedback, and stay updated with the latest announcements.
          </p>
        </div>
      </div>
    </div>
  );
}
