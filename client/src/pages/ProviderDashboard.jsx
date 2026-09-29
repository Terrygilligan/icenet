import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import {
  Truck,
  CheckCircle,
  Clock,
  ThermometerSnowflake,
  ShieldAlert,
  ArrowRight,
  Plus,
  Play,
  CheckCheck,
  UserCheck,
  MapPin,
  Flame,
  FileCheck,
  RotateCcw
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [fleetList, setFleetList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'fleet' | 'active_routes'

  // Modal / Add Vehicle state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    type: 'Sprinter Van (-25°C to +8°C)',
    smallCoolersCapacity: 12,
    largeCoolersCapacity: 4,
    freezersCapacity: 3,
    assignedDriver: '',
    driverPhone: '',
    targetTemp: '+2.0°C'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fRes, oRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fleet`),
        fetch(`${API_BASE_URL}/api/orders`)
      ]);
      const fData = await fRes.json();
      const oData = await oRes.json();

      setFleetList(fData);
      setOrdersList(oData);
    } catch (err) {
      console.error('Error loading provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatchAction = async (orderId, action, vehicleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          providerId: user?.id || 'usr_provider1',
          vehicleId: vehicleId || fleetList[0]?.id
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Dispatch action failed:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, currentTemp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          currentTempCelsius: currentTemp,
          signedBy: 'Stefan Nikolay (Receiver Depot Manager)',
          proofSignature: `SIG-BG-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/fleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVehicle,
          providerId: user?.id || 'usr_provider1'
        })
      });
      if (res.ok) {
        setShowAddVehicleModal(false);
        setNewVehicle({
          plateNumber: '',
          type: 'Sprinter Van (-25°C to +8°C)',
          smallCoolersCapacity: 12,
          largeCoolersCapacity: 4,
          freezersCapacity: 3,
          assignedDriver: '',
          driverPhone: '',
          targetTemp: '+2.0°C'
        });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add vehicle:', err);
    }
  };

  // Pending queue orders
  const pendingOrders = ordersList.filter(o => o.status === 'Pending' || (!o.providerId && o.status !== 'Cancelled'));

  // Assigned to this provider or active routes
  const myOrders = ordersList.filter(o => o.providerId === (user?.id || 'usr_provider1') || o.providerName.includes('FrigoTrans'));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-[#00A8E8]" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Transport Service Provider Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Frigo Fleet Management &bull; Dispatch Queue &bull; Cold Route Telemetry & Driver Tracking
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                activeTab === 'dispatch' ? 'bg-[#00A8E8] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Dispatch Queue</span>
              {pendingOrders.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white font-black rounded-full">
                  {pendingOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('active_routes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'active_routes' ? 'bg-[#00A8E8] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Driver Routes ({myOrders.filter(o => o.status !== 'Delivered').length})
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'fleet' ? 'bg-[#00A8E8] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frigo Fleet ({fleetList.length})
            </button>
          </div>
        </div>

        {/* TAB 1: DISPATCH QUEUE */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#00A8E8]" />
                <span>Available Pickups in Dispatch Queue</span>
              </h3>
              <span className="text-xs text-slate-500">
                Accept pickup jobs to assign to your cold chain fleet across Bulgaria.
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500 space-y-2 shadow-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-900">No pending orders in dispatch queue.</p>
                <p className="text-xs">All incoming pickup requests are currently dispatched.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold text-sky-600">{order.id}</span>
                        <h4 className="font-bold text-slate-900 text-base">{order.merchantName}</h4>
                      </div>
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold">
                        €{order.priceEur}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Item & Temperature Spec</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {order.itemType.replace('_', ' ')} x {order.containerCount}
                        </span>
                        <p className="text-[10px] text-sky-600">{order.tempRequirement}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Route Details</span>
                        <span className="font-semibold text-slate-800">{order.pickupCity} &rarr; {order.dropoffCity}</span>
                        <p className="text-[10px] text-slate-500 truncate">{order.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        Select Vehicle:
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDispatchAction(order.id, 'decline')}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleDispatchAction(order.id, 'accept', fleetList[0]?.id)}
                          className="px-4 py-1.5 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-1.5 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept & Assign Fleet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE DRIVER ROUTES & STATUS UPDATE STEPPER */}
        {activeTab === 'active_routes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#00A8E8]" />
              <span>Active Cold Route Tracking & Status Stepper</span>
            </h3>

            <div className="space-y-4">
              {myOrders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-sky-600">{order.id}</span>
                        <span className="text-xs font-bold text-slate-500">&bull; {order.trackingCode}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status.includes('Transit') ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {order.merchantName}: {order.pickupCity} ({order.pickupLocation}) &rarr; {order.dropoffCity} ({order.dropoffLocation})
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-600">
                        Driver: <span className="text-sky-600">{order.driverName}</span> ({order.driverPhone})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Target Temp: <span className="text-emerald-600 font-bold">{order.targetTempCelsius}°C</span> | Live Probe: <span className="text-sky-600 font-bold">{order.currentLiveTempCelsius ?? order.targetTempCelsius}°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Status Stepper Bar */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      Lifecycle Progress Stepper:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {['Dispatch Accepted', 'Picked Up', 'In Transit - Temp Controlled', 'Delivered'].map((step, idx) => {
                        const stepOrder = ['Dispatch Accepted', 'Picked Up', 'In Transit - Temp Controlled', 'Delivered'];
                        const currentIdx = stepOrder.indexOf(order.status);
                        const isDone = currentIdx >= idx;
                        const isCurrent = order.status === step;

                        return (
                          <button
                            key={step}
                            onClick={() => handleUpdateOrderStatus(order.id, step, order.targetTempCelsius)}
                            className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-sky-50 border-[#00A8E8] text-sky-800 shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                              {isDone && <CheckCheck className="w-4 h-4 text-emerald-500" />}
                            </div>
                            <span>{step}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Latest Telemetry Audit Log:</span>
                    {order.logs?.slice(-2).map((log, i) => (
                      <div key={i} className="text-xs text-slate-600 flex justify-between">
                        <span>&bull; {log.note}</span>
                        <span className="text-[10px] text-slate-400">{new Date(log.time).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FLEET MANAGEMENT (COOLERS vs FREEZERS CAPACITY) */}
        {activeTab === 'fleet' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-[#00A8E8]" />
                  <span>Frigo Fleet & Temperature Container Capacity</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Assign small vs. large coolers and freezer vaults across your transport vehicles.
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="px-3.5 py-2 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle to Fleet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {fleetList.map((veh) => (
                <div key={veh.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sky-600 uppercase">{veh.plateNumber}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{veh.type}</h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      veh.status === 'In Transit' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {veh.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-2 rounded-lg border border-slate-200">
                    <div className="p-1">
                      <span className="text-[10px] text-slate-500 block">Small Cooler</span>
                      <span className="font-bold text-sky-600">{veh.smallCoolersCapacity} units</span>
                    </div>
                    <div className="p-1 border-x border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Large Cooler</span>
                      <span className="font-bold text-sky-600">{veh.largeCoolersCapacity} units</span>
                    </div>
                    <div className="p-1">
                      <span className="text-[10px] text-slate-500 block">Freezer Vault</span>
                      <span className="font-bold text-indigo-600">{veh.freezersCapacity} units</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 border-t border-slate-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Driver:</span>
                      <span className="font-bold text-slate-900">{veh.assignedDriver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Sensor Temp:</span>
                      <span className="font-bold text-sky-600">{veh.currentTemp}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Location:</span>
                      <span>{veh.currentLocation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add Vehicle */}
        {showAddVehicleModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Add Frigo Transport Vehicle</h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">License Plate Number (Bulgaria)</label>
                  <input
                    type="text"
                    placeholder="e.g. CB 4410 BK"
                    value={newVehicle.plateNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Vehicle Specifications</label>
                  <input
                    type="text"
                    placeholder="e.g. Mercedes Sprinter (-25°C Isothermal)"
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Small Coolers</label>
                    <input
                      type="number"
                      value={newVehicle.smallCoolersCapacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, smallCoolersCapacity: parseInt(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Large Coolers</label>
                    <input
                      type="number"
                      value={newVehicle.largeCoolersCapacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, largeCoolersCapacity: parseInt(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Freezer Vaults</label>
                    <input
                      type="number"
                      value={newVehicle.freezersCapacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, freezersCapacity: parseInt(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Todor Bakalov"
                      value={newVehicle.assignedDriver}
                      onChange={(e) => setNewVehicle({ ...newVehicle, assignedDriver: e.target.value })}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Driver Phone</label>
                    <input
                      type="text"
                      placeholder="+359 88 ..."
                      value={newVehicle.driverPhone}
                      onChange={(e) => setNewVehicle({ ...newVehicle, driverPhone: e.target.value })}
                      required
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Save Vehicle
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
