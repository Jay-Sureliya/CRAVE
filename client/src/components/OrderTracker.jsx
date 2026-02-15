import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Truck, Package, ChevronRight } from 'lucide-react';

const OrderTracker = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserOrders = async () => {
    const userId = sessionStorage.getItem("user_id");

    if (!userId || userId === "undefined" || userId === "null") {
      setLoading(false);
      return;
    }

    try {
      // 1. DYNAMIC API CALL
      const res = await api.get(`/api/orders/customer/${userId}`);

      if (res.data && res.data.length > 0) {
        const ongoing = res.data.filter(order =>
          order.status !== 'delivered' && order.status !== 'cancelled'
        );
        setActiveOrders(ongoing);
      } else {
        setActiveOrders([]);
      }
    } catch (err) {
      console.warn("Backend Error. Showing Static Mock Data for testing.");

      // 2. STATIC FALLBACK (Testing only)
      setActiveOrders([
        {
          _id: "ORD-9921",
          id: 9921,
          status: "Out for Delivery",
          location: { lat: 22.3039, lng: 70.8022 },
          restaurant_name: "The Pizza Hub"
        },
        {
          _id: "ORD-8845",
          id: 8845,
          status: "Preparing",
          location: { lat: 22.3149, lng: 70.7922 },
          restaurant_name: "Burger King"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading || activeOrders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 w-[340px] pointer-events-none">
      {activeOrders.map((order) => {
        // Safe Location Access
        const lat = order?.location?.lat || 0;
        const lng = order?.location?.lng || 0;

        // --- THE FIX IS HERE ---
        // We convert the ID to a String() before slicing it.
        // We also check for both '_id' and 'id' to be safe.
        const displayId = String(order._id || order.id || "UNKNOWN");

        return (
          <div
            key={displayId}
            className="pointer-events-auto bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden transform transition-all hover:translate-y-[-5px] animate-in slide-in-from-right-10 duration-500"
          >
            {/* Status Header */}
            <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Live Tracker</span>
              </div>

              {/* FIXED LINE BELOW: No more crash */}
              <span className="text-[9px] text-slate-400 font-mono">
                ID: {displayId.slice(0, 8)}
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                  <Truck size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Status</h4>
                  <p className="text-sm font-black text-slate-800 uppercase leading-none mt-1">
                    {order.status}
                  </p>
                </div>
              </div>

              {/* Progress Visualizer */}
              <div className="flex items-center gap-1 mb-4">
                <div className="h-1.5 flex-1 bg-orange-500 rounded-full"></div>
                <div className={`h-1.5 flex-1 rounded-full ${order.status !== 'Preparing' ? 'bg-orange-500' : 'bg-slate-100'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${order.status === 'Out for Delivery' ? 'bg-orange-500' : 'bg-slate-100'}`}></div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-50 mb-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <MapPin size={12} />
                  <span>Lat: {lat.toFixed(3)} | Lng: {lng.toFixed(3)}</span>
                </div>
              </div>

              <button
                onClick={() => window.location.href = `/track-order/${order._id || order.id}`}
                className="w-full bg-[#FF8A00] hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all group"
              >
                VIEW LIVE MAP
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTracker;