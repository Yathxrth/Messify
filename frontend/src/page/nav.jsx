import React, { useState } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, MessageSquareWarning, User } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isWorker, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  // Build nav links based on auth state and role
  const getNavLinks = () => {
    const links = [
      { name: 'Home', path: '/' },
      { name: 'Menu', path: '/menu' },
    ];

    if (isAuthenticated) {
      if (!isWorker && !isAdmin) {
        links.push({ name: 'Opt-Out & Rebate', path: '/optout' });
        links.push({ name: 'Complaints', path: '/complaints' });
        links.push({ name: 'Profile & Ledger', path: '/profile' });
      }

      links.push({ name: 'Feedback', path: '/feedback' });
      links.push({ name: 'Notifications', path: '/notification' });
      links.push({ name: 'Members', path: '/members' });

      if (isWorker || isAdmin) {
        links.push({ name: 'Admin Dashboard', path: '/worker-dashboard' });
      }
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3.5">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
            🍽️
          </div>
          <span>Messify<span className="text-amber-400">.</span></span>
        </NavLink>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-5">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `text-xs uppercase tracking-wider font-semibold transition-all duration-200 px-2.5 py-1.5 rounded-lg ${isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <li className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-800">
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                isWorker ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="ml-2">
              <NavLink
                to="/login"
                className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-4 py-2 rounded-lg font-bold shadow-md transition"
              >
                Sign In
              </NavLink>
            </li>
          )}
        </ul>

        {/* Mobile Menu Icon */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-slate-300 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 bg-slate-300 transform transition duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-slate-300 transition duration-300 ${menuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-slate-300 transform transition duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </div>
        </button>
      </div>

      {/* Mobile Overlay Menu */}
      <div
        className={`fixed inset-0 bg-[#0d1117] flex flex-col justify-center items-center transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:hidden z-40 p-6`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-5 right-6 text-slate-400 hover:text-white text-2xl font-bold"
          aria-label="Close menu"
        >
          ✕
        </button>

        <ul className="space-y-4 text-center w-full max-w-xs">
          {navLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={toggleMenu}
                className={({ isActive }) =>
                  `block text-base uppercase font-bold py-2 tracking-wider transition ${isActive
                    ? 'text-amber-400'
                    : 'text-slate-300 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}

          <li className="pt-6 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">{user?.name} ({user?.role})</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-sm bg-rose-500/20 text-rose-300 border border-rose-500/30 py-2.5 rounded-xl font-bold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={toggleMenu}
                className="block text-center text-sm bg-amber-500 text-slate-950 py-3 rounded-xl font-bold"
              >
                Sign In
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
