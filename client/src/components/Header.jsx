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
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/login')}>
            <div className="p-2 bg-[#00A8E8] rounded-xl shadow-sm">
              <ThermometerSnowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Ice<span className="text-[#00A8E8]">Net</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded">
                  Bulgaria BG
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Temperature-Controlled Cold Logistics</p>
            </div>
          </div>

          {/* Role Navigation Badges & Direct Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'admin'
                  ? 'bg-[#00A8E8] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Tier</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('provider')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'provider'
                  ? 'bg-[#00A8E8] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Transport Provider</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('merchant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                user?.role === 'merchant'
                  ? 'bg-[#00A8E8] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
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
                <div className="text-xs font-bold text-slate-900">{user.name}</div>
                <div className="text-[10px] text-sky-600 font-medium capitalize">{user.company} ({user.role})</div>
              </div>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-2 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
