import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Snowflake, ShieldCheck, Truck, Store, ArrowRight, AlertCircle, ThermometerSnowflake } from 'lucide-react';

export const Login = () => {
  const { login, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@icenet.bg');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password, selectedRole);
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setError('');
    setSubmitting(true);
    try {
      const user = await loginAsDemoRole(role);
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const redirectToDashboard = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'provider') navigate('/provider');
    else navigate('/merchant');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Cold Chain Grid Overlay Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00A8E8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#00A8E8] rounded-2xl shadow-lg shadow-sky-500/25">
            <ThermometerSnowflake className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Ice<span className="text-[#00A8E8]">Net</span> Bulgaria
          </h1>
          <p className="text-sm text-slate-500">
            Temperature-Controlled (Cooler & Freezer) Logistics Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Selector */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Instant Demo Access (Select Role):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setEmail('admin@icenet.bg');
                  handleQuickDemo('admin');
                }}
                className="p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl flex flex-col items-center justify-center transition-all group text-center"
              >
                <ShieldCheck className="w-5 h-5 text-[#00A8E8] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">App Admin</span>
                <span className="text-[10px] text-slate-500">HQ Owner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('provider');
                  setEmail('provider@frigotrans.bg');
                  handleQuickDemo('provider');
                }}
                className="p-3 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl flex flex-col items-center justify-center transition-all group text-center"
              >
                <Truck className="w-5 h-5 text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Transport</span>
                <span className="text-[10px] text-slate-500">Frigo Provider</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('merchant');
                  setEmail('merchant@lacta.bg');
                  handleQuickDemo('merchant');
                }}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl flex flex-col items-center justify-center transition-all group text-center"
              >
                <Store className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-800">Merchant</span>
                <span className="text-[10px] text-slate-500">End-User</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase">or standard login</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          IceNet Bulgaria Cold Chain Telemetry System &bull; Active Coverage: Sofia, Plovdiv, Varna, Burgas, Ruse
        </p>
      </div>
    </div>
  );
};
