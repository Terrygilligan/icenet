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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Merchant / Customer Cold Shipping Portal
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Welcome, <span className="text-emerald-600 font-semibold">{user?.company || user?.name || 'Lacta Dairy Bulgaria'}</span> &bull; Book temperature-controlled freight across Bulgaria
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-[#00A8E8] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Shipments ({orders.filter(o => o.status !== 'Delivered').length})
            </button>
            <button
              onClick={() => setActiveTab('new_wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                activeTab === 'new_wizard' ? 'bg-[#00A8E8] text-white font-black shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Chilled Order</span>
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'billing' ? 'bg-[#00A8E8] text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices & Billing Log
            </button>
          </div>
        </div>

        {/* TAB 1: ORDER CREATION WIZARD */}
        {activeTab === 'new_wizard' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <ThermometerSnowflake className="w-5 h-5 text-emerald-600" />
                  <span>Temperature-Controlled Freight Order Wizard</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select container cooling spec, origin/destination in Bulgaria, and schedule time slot.
                </p>
              </div>

              {/* Wizard Step Indicator */}
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className={`px-2.5 py-1 rounded-lg ${wizardStep === 1 ? 'bg-[#00A8E8] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  1. Temp & Cargo
                </span>
                <span className="text-slate-400">&rarr;</span>
                <span className={`px-2.5 py-1 rounded-lg ${wizardStep === 2 ? 'bg-[#00A8E8] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  2. Route & Time Slots
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6">
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
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
                          ? 'bg-sky-50 border-[#00A8E8] text-sky-800 ring-2 ring-[#00A8E8]/30'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-6 h-6 text-sky-600" />
                        <span className="text-xs font-bold text-sky-600">+2°C to +8°C</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Small Cooler Container</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
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
                          ? 'bg-sky-50 border-[#00A8E8] text-sky-800 ring-2 ring-[#00A8E8]/30'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Layers className="w-6 h-6 text-sky-600" />
                        <span className="text-xs font-bold text-sky-600">+2°C to +4°C</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Large Cooler Pallet</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
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
                          ? 'bg-sky-50 border-[#00A8E8] text-sky-800 ring-2 ring-[#00A8E8]/30'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ThermometerSnowflake className="w-6 h-6 text-[#00A8E8]" />
                        <span className="text-xs font-bold text-[#00A8E8]">-18°C or Colder</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Deep Freezer Vault</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Frozen seafood, ice cream, frozen vegetables, and deep-freeze items.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Container Count</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.containerCount}
                        onChange={(e) => setFormData({ ...formData, containerCount: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Target Temperature Setting (°C)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.targetTempCelsius}
                        onChange={(e) => setFormData({ ...formData, targetTempCelsius: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm flex items-center space-x-2 transition-colors"
                    >
                      <span>Continue to Route Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    Step 2: Pickup, Drop-off Locations & Scheduled Time Slot
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pickup Details */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-sky-600">Pickup Details (Bulgaria)</h4>
                      <div>
                        <label className="block text-slate-500 text-[11px] mb-1">Pickup City / Hub</label>
                        <select
                          value={formData.pickupCity}
                          onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
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
                        <label className="block text-slate-500 text-[11px] mb-1">Exact Pickup Address</label>
                        <input
                          type="text"
                          value={formData.pickupLocation}
                          onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                        />
                      </div>
                    </div>

                    {/* Dropoff Details */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-600">Drop-off Details (Bulgaria)</h4>
                      <div>
                        <label className="block text-slate-500 text-[11px] mb-1">Drop-off City / Hub</label>
                        <select
                          value={formData.dropoffCity}
                          onChange={(e) => setFormData({ ...formData, dropoffCity: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
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
                        <label className="block text-slate-500 text-[11px] mb-1">Exact Drop-off Address</label>
                        <input
                          type="text"
                          value={formData.dropoffLocation}
                          onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Pickup Time Window</label>
                      <input
                        type="text"
                        value={formData.pickupTimeSlot}
                        onChange={(e) => setFormData({ ...formData, pickupTimeSlot: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Time Window</label>
                      <input
                        type="text"
                        value={formData.deliveryTimeSlot}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeSlot: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Summary & Price Quote Bar */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-700 block font-semibold">Automated Freight Rate Calculation:</span>
                      <span className="text-[11px] text-slate-500">
                        {formData.pickupCity} &rarr; {formData.dropoffCity} ({formData.itemType.replace('_', ' ')})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">€{calculateEstimatedPrice()}</span>
                      <span className="text-[10px] text-slate-500 block">incl. Bulgaria road toll & temperature telemetry</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      &larr; Back to Step 1
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#00A8E8] hover:bg-sky-600 text-white font-bold rounded-xl shadow-sm text-xs flex items-center space-x-2 transition-colors"
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
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Live Active Shipments & Telemetry Proofs</span>
            </h3>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-emerald-600">{order.id}</span>
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
                        {order.pickupCity} &rarr; {order.dropoffCity} ({order.itemType.replace('_', ' ')})
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-600">€{order.priceEur}</span>
                      <p className="text-[10px] text-slate-500">Carrier: {order.providerName || 'Pending Dispatch'}</p>
                    </div>
                  </div>

                  {/* Temperature Telemetry Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                      <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg">
                        <ThermometerSnowflake className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Temperature Target / Live</span>
                        <span className="text-xs font-bold text-slate-900">
                          Target: {order.targetTempCelsius}°C | Live: <span className="text-sky-600">{order.currentLiveTempCelsius ?? order.targetTempCelsius}°C</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                      <div className="p-2 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Route Pickup & Drop-off</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] block">
                          {order.pickupLocation} &rarr; {order.dropoffLocation}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Time Slot</span>
                        <span className="text-xs font-bold text-slate-800">{order.deliveryTimeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Proof */}
                  {order.deliveryProof && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Verified & Proof Signature Recorded</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Signed by <span className="font-bold text-slate-900">{order.deliveryProof.signedBy}</span> at {order.deliveryProof.timestamp}. Temp on Arrival: <span className="text-emerald-600 font-bold">{order.deliveryProof.tempOnArrival}</span> ({order.deliveryProof.signatureCode}).
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Bulgaria Logistics Invoices & Billing History</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Order Code</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Item Specification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Invoice Total (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">{order.id}</td>
                      <td className="px-4 py-3">{order.pickupCity} &rarr; {order.dropoffCity}</td>
                      <td className="px-4 py-3 capitalize">{order.itemType.replace('_', ' ')} x {order.containerCount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200 rounded text-slate-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">€{order.priceEur}</td>
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
