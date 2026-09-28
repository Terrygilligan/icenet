import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import {
  ShieldCheck,
  Users,
  MapPin,
  TrendingUp,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Activity,
  Euro,
  Thermometer,
  Clock,
  Search
} from 'lucide-react';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [zonesList, setZonesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'providers' | 'zones'

  // Modal / Form state for adding new Zone
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    name: '',
    code: '',
    basePriceEur: 20.0,
    tempSurchargeFreezer: 7.5,
    estimatedHours: 3
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, zRes] = await Promise.all([
        fetch('http://localhost:5000/api/metrics'),
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/zones')
      ]);
      const mData = await mRes.json();
      const uData = await uRes.json();
      const zData = await zRes.json();

      setMetrics(mData);
      setUsersList(uData);
      setZonesList(zData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZoneData)
      });
      if (res.ok) {
        setShowAddZoneModal(false);
        setNewZoneData({ name: '', code: '', basePriceEur: 20.0, tempSurchargeFreezer: 7.5, estimatedHours: 3 });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add zone:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-sky-900/40 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                App Owner & Admin Control Center
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Global system health, transport provider approval workflows, and Bulgarian zone pricing control.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                activeTab === 'providers' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>User Approval</span>
              {metrics?.pendingProvidersCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-black rounded-full">
                  {metrics.pendingProvidersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'zones' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Zones & Pricing
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Active Cold Orders</p>
                <h3 className="text-2xl font-black text-white mt-1">{metrics?.activeOrders ?? 0}</h3>
              </div>
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Total volume: <span className="text-slate-300 font-semibold">{metrics?.totalOrders ?? 0} orders</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Active Fleet Drivers</p>
                <h3 className="text-2xl font-black text-indigo-400 mt-1">{metrics?.activeDrivers ?? 0}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Total vehicles registered: <span className="text-slate-300 font-semibold">{metrics?.totalVehicles ?? 0}</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Network Revenue (€)</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">€{metrics?.totalRevenueEur ?? 0}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Euro className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Deliveries completed: <span className="text-emerald-400 font-semibold">{metrics?.deliveredOrders ?? 0}</span>
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase">Telemetry Gateway</p>
                <h3 className="text-lg font-bold text-emerald-400 mt-1">{metrics?.systemHealth?.status || 'Operational'}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 animate-pulse">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Sensor precision: <span className="text-sky-400 font-semibold">{metrics?.systemHealth?.iotSensorAccuracy || '99.8%'}</span>
            </p>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <span>Bulgaria Temperature Telemetry & System Node Status</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">IoT Cold Sensor Precision</span>
                    <span className="text-emerald-400 font-bold">99.8%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[99.8%]"></div>
                  </div>
                  <p className="text-[11px] text-slate-500">Dual-redundant probes active on freezer & cooler vans.</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Regional Coverage (Bulgaria)</span>
                    <span className="text-sky-400 font-bold">6 Key Zones</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                  <p className="text-[11px] text-slate-500">Sofia, Plovdiv, Varna, Burgas, Ruse, Stara Zagora hubs.</p>
                </div>
              </div>

              {/* Provider Approval Quick Status Alert */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200">
                      {usersList.filter(u => u.role === 'provider' && u.status === 'pending').length} Provider Approval Pending
                    </h4>
                    <p className="text-xs text-amber-300/70">
                      Balkan Cold Express Ltd requested frigo carrier onboarding verification.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('providers')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Review Application
                </button>
              </div>
            </div>

            {/* Quick Summary Sidebar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-md font-bold text-white flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-indigo-400" />
                <span>Cold Storage Tiers</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Small Cooler Container</span>
                    <p className="text-[10px] text-slate-400">+2°C to +8°C (Dairy, Samples)</p>
                  </div>
                  <span className="text-xs font-bold text-sky-400">Standard Rate</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Large Cooler Pallet</span>
                    <p className="text-[10px] text-slate-400">+2°C to +4°C (Produce, Meat)</p>
                  </div>
                  <span className="text-xs font-bold text-sky-400">+15% Volume</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Deep Freezer Vault</span>
                    <p className="text-[10px] text-slate-400">-18°C or lower (Seafood, Ice Cream)</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-400">+€7.50 Surcharge</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER & PROVIDER APPROVAL WORKFLOW */}
        {activeTab === 'providers' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-sky-400" />
                  <span>Transport Service Provider Approval & Account Management</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Verify frigorific transport providers before allowing dispatch queue access across Bulgaria.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Company / Provider</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Base Hub City</th>
                    <th className="px-4 py-3">Frigo Fleet</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email} &bull; {user.phone}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          user.role === 'provider' ? 'bg-indigo-500/20 text-indigo-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.baseCity || 'Sofia'}</td>
                      <td className="px-4 py-3">{user.fleetCount ? `${user.fleetCount} vehicles` : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          user.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          user.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {user.role !== 'admin' && (
                          <>
                            {user.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateUserStatus(user.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md transition-colors text-[11px] inline-flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            {user.status !== 'suspended' && (
                              <button
                                onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                                className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white font-bold rounded-md transition-colors text-[11px] inline-flex items-center space-x-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ZONES & PRICING CONFIGURATION */}
        {activeTab === 'zones' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-sky-400" />
                  <span>Bulgaria Logistics Zones & Temperature Pricing Rates</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure base regional delivery prices and freezer surcharges across Bulgaria.
                </p>
              </div>
              <button
                onClick={() => setShowAddZoneModal(true)}
                className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Logistics Zone</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {zonesList.map((zone) => (
                <div key={zone.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{zone.name}</h4>
                      <span className="text-[10px] text-sky-400 font-mono font-bold uppercase">{zone.code} HUB</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-semibold">
                      ~{zone.estimatedHours}h ETA
                    </span>
                  </div>

                  <div className="space-y-1 text-xs border-t border-slate-800 pt-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Regional Rate:</span>
                      <span className="font-bold text-emerald-400">€{zone.basePriceEur.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Freezer Deep Cold Surcharge:</span>
                      <span className="font-bold text-indigo-400">+€{zone.tempSurchargeFreezer.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Active Hub Drivers:</span>
                      <span>{zone.activeDrivers} drivers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for adding Zone */}
        {showAddZoneModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Add New Bulgarian Logistics Zone</h3>
              <form onSubmit={handleAddZone} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Zone Region Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pleven & Central North"
                    value={newZoneData.name}
                    onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Hub Code (3 Letters)</label>
                  <input
                    type="text"
                    placeholder="e.g. PLN"
                    value={newZoneData.code}
                    onChange={(e) => setNewZoneData({ ...newZoneData, code: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Base Price (€)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newZoneData.basePriceEur}
                      onChange={(e) => setNewZoneData({ ...newZoneData, basePriceEur: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Freezer Surcharge (€)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newZoneData.tempSurchargeFreezer}
                      onChange={(e) => setNewZoneData({ ...newZoneData, tempSurchargeFreezer: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Estimated Travel Time (Hours)</label>
                  <input
                    type="number"
                    value={newZoneData.estimatedHours}
                    onChange={(e) => setNewZoneData({ ...newZoneData, estimatedHours: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddZoneModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20"
                  >
                    Save Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
