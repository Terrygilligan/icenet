import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThermometerSnowflake, ShieldCheck, Truck, Store, LogOut, RefreshCw, UserCheck } from 'lucide-react';

export const Header = () => {
  const { user, loginAsDemoRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = async (role) => {
    const updatedUser = await loginAsDemoRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/provider');
    else navigate('/merchant');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/login')}>
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl shadow-md shadow-sky-500/20">
              <ThermometerSnowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Ice<span className="text-sky-400">Net</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded">
                  Bulgaria BG
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Temperature-Controlled Cold Logistics</p>
            </div>
          </div>

          {/* Role Navigation Badges & Direct Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'admin'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Tier</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('provider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'provider'
                  ? 'bg-indigo-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Transport Provider</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('merchant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'merchant'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Merchant Tier</span>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-sky-400 font-medium capitalize">{user.company} ({user.role})</div>
              </div>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
