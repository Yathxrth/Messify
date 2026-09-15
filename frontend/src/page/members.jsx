import React, { useState, useEffect } from 'react';
import { Users, Shield, Briefcase, ArrowBigRightDashIcon } from 'lucide-react';
import { authAPI } from '../services/api';

export default function MessMembersDirectory() {
  const [filter, setFilter] = useState('all');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await authAPI.getUsers();
        setMembers(res.data.users || []);
      } catch (err) {
        console.log('Error fetching members:', err);
        // Fallback to static data if API fails
        setMembers([
          { _id: '1', name: 'Narendra Prajapat', regNo: '20244110', branch: 'ECE', role: 'worker' },
          { _id: '2', name: 'Prav Kalyani', regNo: '20244511', branch: 'ECE', role: 'worker' },
          { _id: '3', name: 'Arun Patel', regNo: '20246087', branch: 'ME', role: 'student' },
          { _id: '4', name: 'Kapish Gupta', regNo: '20245056', branch: 'Civil', role: 'student' },
          { _id: '5', name: 'Yatharth Singh', regNo: '20244180', branch: 'ECE', role: 'worker' },
          { _id: '6', name: 'Anjani Verma', regNo: '20243012', branch: 'CSE', role: 'student' },
          { _id: '7', name: 'Parth Kishan', regNo: '20244123', branch: 'ME', role: 'worker' },
          { _id: '8', name: 'Vansh Pandey', regNo: '20244121', branch: 'ECE', role: 'student' },
        ]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = filter === 'all' ? members : members.filter(m => m.role === filter);

  const getRoleColor = (role) => {
    switch (role) {
      case 'worker':
        return { bg: '#10b981', light: '#d1fae5', text: '#065f46' };
      case 'admin':
        return { bg: '#f59e0b', light: '#fef3c7', text: '#78350f' };
      case 'student':
        return { bg: '#3b82f6', light: '#dbeafe', text: '#1e3a8a' };
      default:
        return { bg: '#6b7280', light: '#f3f4f6', text: '#111827' };
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'worker':
        return <Briefcase size={14} />;
      case 'admin':
        return <Shield size={14} />;
      case 'student':
        return <Users size={14} />;
      default:
        return <ArrowBigRightDashIcon size={14} />;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Members Directory</h1>
          <p className="text-gray-500 text-lg">Meet our team members and staff</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setFilter('worker')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${filter === 'worker'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <Briefcase size={16} /> Workers
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${filter === 'admin'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <Shield size={16} /> Admins
          </button>
          <button
            onClick={() => setFilter('student')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${filter === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <Users size={16} /> Students
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((member) => {
              const colors = getRoleColor(member.role);
              return (
                <div
                  key={member._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105 transform"
                >
                  {/* Avatar Section */}
                  <div className="pt-6 pb-4 px-4 flex justify-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {getInitials(member.name)}
                    </div>
                  </div>

                  {/* Name Section */}
                  <div className="text-center px-4 pb-2">
                    <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  </div>

                  {/* Role Badge */}
                  <div className="flex justify-center pb-4 px-4">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold uppercase flex items-center gap-1 inline-flex"
                      style={{
                        backgroundColor: colors.light,
                        color: colors.text
                      }}
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div
                    className="px-4 py-3"
                    style={{ backgroundColor: colors.light }}
                  >
                    {member.regNo && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Reg. No.</p>
                        <p className="text-sm font-bold text-gray-800">{member.regNo}</p>
                      </div>
                    )}
                    {member.branch && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Branch</p>
                        <p className="text-sm font-bold text-gray-800">{member.branch}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No members found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}