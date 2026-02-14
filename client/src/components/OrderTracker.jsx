// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Bike, Phone, Clock, MapPin, X, ChevronRight } from 'lucide-react';
// import L from 'leaflet';
// import api from '../services/api';
// import 'leaflet/dist/leaflet.css';

// // Custom Marker Icons
// const riderIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/3195/3195884.png', iconSize: [35, 35] });
// const userIcon = new L.Icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1275/1275502.png', iconSize: [35, 35] });

// const OrderTracker = () => {
//   const [order, setOrder] = useState(null);
//   const [isExpanded, setIsExpanded] = useState(false);

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await api.get("/api/orders/track");
//         if (res.data.active) setOrder(res.data);
//         else setOrder(null);
//       } catch (e) { console.error(e); }
//     };
//     checkStatus();
//     const interval = setInterval(checkStatus, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   if (!order) return null;

//   // Simple Distance Calculation (Euclidean for demo)
//   const calculateETAs = () => {
//     if (!order.rider_location) return { dist: "1.2 km", time: "8 mins" };
//     return { dist: "0.8 km", time: "5 mins" };
//   };

//   const { dist, time } = calculateETAs();

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ y: 200 }} animate={{ y: isExpanded ? 0 : 20 }}
//         className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${isExpanded ? 'h-[90vh]' : 'h-24'}`}
//       >
//         <div className="max-w-xl mx-auto h-full bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">

//           {/* --- MINIMIZED VIEW --- */}
//           {!isExpanded && (
//             <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(true)}>
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 animate-bounce">
//                   <Bike size={24} />
//                 </div>
//                 <div>
//                   <h4 className="font-black text-stone-800 text-sm italic">Arriving in {time}</h4>
//                   <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{dist} away • {order.status.replace(/_/g, ' ')}</p>
//                 </div>
//               </div>
//               <ChevronRight className="text-stone-300" />
//             </div>
//           )}

//           {/* --- EXPANDED LIVE TRACKING VIEW --- */}
//           {isExpanded && (
//             <>
//               <div className="p-6 flex justify-between items-center border-b border-stone-50">
//                 <h3 className="font-black text-xl text-stone-800 tracking-tight">Track Order</h3>
//                 <button onClick={() => setIsExpanded(false)} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
//               </div>

//               {/* LIVE MAP */}
//               <div className="flex-1 relative bg-stone-100">
//                 <MapContainer center={[order.user_location.lat, order.user_location.lng]} zoom={15} className="h-full w-full">
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   <Marker position={[order.user_location.lat, order.user_location.lng]} icon={userIcon} />
//                   {order.rider_location && (
//                     <>
//                       <Marker position={[order.rider_location.lat, order.rider_location.lng]} icon={riderIcon} />
//                       <Polyline positions={[
//                         [order.rider_location.lat, order.rider_location.lng],
//                         [order.user_location.lat, order.user_location.lng]
//                       ]} color="#F97316" dashArray="10, 10" />
//                     </>
//                   )}
//                 </MapContainer>

//                 {/* Floating Time Badge */}
//                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white">
//                   <div className="bg-orange-500 text-white p-2 rounded-lg"><Clock size={16} /></div>
//                   <div>
//                     <p className="text-[10px] font-black text-stone-400 uppercase">Est. Delivery</p>
//                     <p className="font-black text-stone-800">{time}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* RIDER INFO CARD */}
//               <div className="p-6 bg-white rounded-t-[2.5rem] -mt-8 relative z-10 shadow-negative-xl">
//                 <div className="flex justify-between items-center mb-6">
//                   <div className="flex items-center gap-4">
//                     <div className="w-14 h-14 bg-stone-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
//                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Rider" />
//                     </div>
//                     <div>
//                       <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Your Delivery Hero</p>
//                       <h4 className="text-lg font-black text-stone-800">{order.rider_name || "Assigning Rider..."}</h4>
//                     </div>
//                   </div>
//                   <a href={`tel:${order.rider_phone}`} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 active:scale-90 transition-transform">
//                     <Phone size={20} />
//                   </a>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
//                     <p className="text-[10px] font-bold text-stone-400 uppercase">Distance</p>
//                     <p className="font-black text-stone-800">{dist}</p>
//                   </div>
//                   <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
//                     <p className="text-[10px] font-bold text-stone-400 uppercase">Order Mode</p>
//                     <p className="font-black text-stone-800">Contactless</p>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default OrderTracker;

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