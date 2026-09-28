import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  PlusCircle,
  Package,
  ThermometerSnowflake,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  Truck,
  DollarSign,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';

export const MerchantDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'new_wizard' | 'billing'

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    itemType: 'small_cooler', // 'small_cooler' | 'large_cooler' | 'freezer'
    containerCount: 2,
    tempRequirement: '+2°C to +4°C (Cooler)',
    targetTempCelsius: 3.0,
    pickupCity: 'Sofia',
    pickupLocation: 'Sofia Central Cold Depot, Kazichene',
    dropoffCity: 'Plovdiv',
    dropoffLocation: 'Plovdiv Trade Hub 2',
    pickupTimeSlot: '2026-09-29 09:00 - 11:00',
    deliveryTimeSlot: '2026-09-29 14:00 - 16:00',
    notes: 'Keep chilled continuously.'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oRes, zRes] = await Promise.all([
        fetch(`http://localhost:5000/api/orders?merchantId=${user?.id || 'usr_merchant1'}`),
        fetch('http://localhost:5000/api/zones')
      ]);
      const oData = await oRes.json();
      const zData = await zRes.json();

      setOrders(oData);
      setZones(zData);
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Price estimator
  const calculateEstimatedPrice = () => {
    const baseZone = zones.find(z => z.name.toLowerCase().includes(formData.dropoffCity.toLowerCase())) || zones[0];
    const base = baseZone ? baseZone.basePriceEur : 20.0;
    const freezerExtra = formData.itemType === 'freezer' ? (baseZone?.tempSurchargeFreezer || 7.5) : 0;
    const containerMult = formData.containerCount > 1 ? (formData.containerCount * 12) : 0;
    return (base + freezerExtra + containerMult).toFixed(2);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const estimatedPrice = calculateEstimatedPrice();
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          merchantId: user?.id || 'usr_merchant1',
          estimatedPriceEur: estimatedPrice
        })
      });

      if (res.ok) {
        setActiveTab('orders');
        setWizardStep(1);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Merchant / Customer Cold Shipping Portal
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Welcome, <span className="text-emerald-400 font-semibold">{user?.company || user?.name || 'Lacta Dairy Bulgaria'}</span> &bull; Book temperature-controlled freight across Bulgaria
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Shipments ({orders.filter(o => o.status !== 'Delivered').length})
            </button>
            <button
              onClick={() => setActiveTab('new_wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                activeTab === 'new_wizard' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Chilled Order</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'billing' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Invoices & Billing Log
            </button>
          </div>
        </div>

        {/* TAB 1: ORDER CREATION WIZARD */}
        {activeTab === 'new_wizard' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <ThermometerSnowflake className="w-5 h-5 text-emerald-400" />
                  <span>Temperature-Controlled Freight Order Wizard</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select container cooling spec, origin/destination in Bulgaria, and schedule time slot.
                </p>
              </div>

              {/* Wizard Step Indicator */}
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${wizardStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  1. Temp & Cargo
                </span>
                <span className="text-slate-600">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${wizardStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  2. Route & Time Slots
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Step 1: Select Temperature & Container Type
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Small Cooler */}
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        itemType: 'small_cooler',
                        tempRequirement: '+2°C to +8°C (Small Chilled Box)',
                        targetTempCelsius: 4.0
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.itemType === 'small_cooler'
                          ? 'bg-sky-500/10 border-sky-500 text-sky-200 ring-2 ring-sky-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-6 h-6 text-sky-400" />
                        <span className="text-xs font-bold text-sky-400">+2°C to +8°C</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">Small Cooler Container</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ideal for small dairy batches, pharmaceuticals, or lab sample boxes.
                      </p>
                    </div>

                    {/* Large Cooler */}
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        itemType: 'large_cooler',
                        tempRequirement: '+2°C to +4°C (Large Chilled Pallet)',
                        targetTempCelsius: 3.0
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.itemType === 'large_cooler'
                          ? 'bg-sky-500/10 border-sky-500 text-sky-200 ring-2 ring-sky-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Layers className="w-6 h-6 text-sky-400" />
                        <span className="text-xs font-bold text-sky-400">+2°C to +4°C</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">Large Cooler Pallet</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Commercial food crates, fresh meat cuts, and bulk refrigerated produce.
                      </p>
                    </div>

                    {/* Deep Freezer Vault */}
                    <div
                      onClick={() => setFormData({
                        ...formData,
                        itemType: 'freezer',
                        tempRequirement: '-18°C Deep Freezer Vault',
                        targetTempCelsius: -20.0
                      })}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.itemType === 'freezer'
                          ? 'bg-purple-500/10 border-purple-500 text-purple-200 ring-2 ring-purple-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ThermometerSnowflake className="w-6 h-6 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400">-18°C or Colder</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">Deep Freezer Vault</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Frozen seafood, ice cream, frozen vegetables, and deep-freeze items.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Container Count</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.containerCount}
                        onChange={(e) => setFormData({ ...formData, containerCount: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Target Temperature Setting (°C)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.targetTempCelsius}
                        onChange={(e) => setFormData({ ...formData, targetTempCelsius: parseFloat(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
                    >
                      <span>Continue to Route Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Step 2: Pickup, Drop-off Locations & Scheduled Time Slot
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Details */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-sky-400">Pickup Details (Bulgaria)</h4>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Pickup City / Hub</label>
                        <select
                          value={formData.pickupCity}
                          onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="Sofia">Sofia Hub</option>
                          <option value="Plovdiv">Plovdiv Hub</option>
                          <option value="Varna">Varna Hub</option>
                          <option value="Burgas">Burgas Hub</option>
                          <option value="Ruse">Ruse Hub</option>
                          <option value="Stara Zagora">Stara Zagora Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Exact Pickup Address</label>
                        <input
                          type="text"
                          value={formData.pickupLocation}
                          onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Dropoff Details */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">Drop-off Details (Bulgaria)</h4>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Drop-off City / Hub</label>
                        <select
                          value={formData.dropoffCity}
                          onChange={(e) => setFormData({ ...formData, dropoffCity: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="Plovdiv">Plovdiv Hub</option>
                          <option value="Sofia">Sofia Hub</option>
                          <option value="Varna">Varna Hub</option>
                          <option value="Burgas">Burgas Hub</option>
                          <option value="Ruse">Ruse Hub</option>
                          <option value="Stara Zagora">Stara Zagora Hub</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Exact Drop-off Address</label>
                        <input
                          type="text"
                          value={formData.dropoffLocation}
                          onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Pickup Time Window</label>
                      <input
                        type="text"
                        value={formData.pickupTimeSlot}
                        onChange={(e) => setFormData({ ...formData, pickupTimeSlot: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Time Window</label>
                      <input
                        type="text"
                        value={formData.deliveryTimeSlot}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeSlot: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Summary & Price Quote Bar */}
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-300 block font-semibold">Automated Freight Rate Calculation:</span>
                      <span className="text-[11px] text-slate-400">
                        {formData.pickupCity} &rarr; {formData.dropoffCity} ({formData.itemType.replace('_', ' ')})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">€{calculateEstimatedPrice()}</span>
                      <span className="text-[10px] text-slate-400 block">incl. Bulgaria road toll & temperature telemetry</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                    >
                      &larr; Back to Step 1
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Book Cold Order</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: ACTIVE SHIPMENTS & LIVE TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>Live Active Shipments & Telemetry Proofs</span>
            </h3>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{order.id}</span>
                        <span className="text-xs font-bold text-slate-400">&bull; {order.trackingCode}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          order.status.includes('Transit') ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {order.pickupCity} &rarr; {order.dropoffCity} ({order.itemType.replace('_', ' ')})
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400">€{order.priceEur}</span>
                      <p className="text-[10px] text-slate-400">Carrier: {order.providerName || 'Pending Dispatch'}</p>
                    </div>
                  </div>

                  {/* Temperature Telemetry Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                        <ThermometerSnowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Temperature Target / Live</span>
                        <span className="text-xs font-bold text-white">
                          Target: {order.targetTempCelsius}°C | Live: <span className="text-sky-400">{order.currentLiveTempCelsius ?? order.targetTempCelsius}°C</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Route Pickup & Drop-off</span>
                        <span className="text-xs font-bold text-white truncate max-w-[200px] block">
                          {order.pickupLocation} &rarr; {order.dropoffLocation}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Time Slot</span>
                        <span className="text-xs font-bold text-slate-200">{order.deliveryTimeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Proof */}
                  {order.deliveryProof && (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>Delivery Verified & Proof Signature Recorded</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Signed by <span className="font-bold text-white">{order.deliveryProof.signedBy}</span> at {order.deliveryProof.timestamp}. Temp on Arrival: <span className="text-emerald-400 font-bold">{order.deliveryProof.tempOnArrival}</span> ({order.deliveryProof.signatureCode}).
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVOICES & BILLING LOG */}
        {activeTab === 'billing' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Bulgaria Logistics Invoices & Billing History</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Order Code</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Item Specification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Invoice Total (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{order.id}</td>
                      <td className="px-4 py-3">{order.pickupCity} &rarr; {order.dropoffCity}</td>
                      <td className="px-4 py-3 capitalize">{order.itemType.replace('_', ' ')} x {order.containerCount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 rounded text-slate-300">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">€{order.priceEur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
