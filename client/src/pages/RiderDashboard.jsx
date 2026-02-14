// // // // // import React, { useState } from 'react';
// // // // // import { useNavigate } from 'react-router-dom';
// // // // // import { Bike, MapPin, CheckCircle, LogOut, Bell } from 'lucide-react';

// // // // // const RiderDashboard = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const [isOnline, setIsOnline] = useState(true);
// // // // //   const user = JSON.parse(localStorage.getItem('user') || '{}');

// // // // //   const handleLogout = () => {
// // // // //     localStorage.clear();
// // // // //     navigate('/login');
// // // // //   };

// // // // //   const toggleStatus = () => setIsOnline(!isOnline);

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
// // // // //       {/* HEADER */}
// // // // //       <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
// // // // //         <div className="flex items-center gap-3">
// // // // //           <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
// // // // //             <Bike size={20} />
// // // // //           </div>
// // // // //           <div>
// // // // //             <h1 className="font-bold text-lg">Crave Fleet</h1>
// // // // //             <p className="text-xs text-gray-500">Welcome, {user.username || 'Rider'}</p>
// // // // //           </div>
// // // // //         </div>

// // // // //         <div className="flex items-center gap-4">
// // // // //           <button 
// // // // //             onClick={toggleStatus}
// // // // //             className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
// // // // //           >
// // // // //             {isOnline ? '● Online' : '○ Offline'}
// // // // //           </button>
// // // // //           <button onClick={handleLogout} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
// // // // //             <LogOut size={20} />
// // // // //           </button>
// // // // //         </div>
// // // // //       </header>

// // // // //       {/* MAIN CONTENT */}
// // // // //       <main className="p-6 max-w-lg mx-auto">

// // // // //         {/* STATS */}
// // // // //         <div className="grid grid-cols-2 gap-4 mb-8">
// // // // //           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
// // // // //             <p className="text-gray-400 text-xs font-bold uppercase">Today's Earnings</p>
// // // // //             <h3 className="text-2xl font-bold text-gray-900 mt-1">₹0.00</h3>
// // // // //           </div>
// // // // //           <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
// // // // //             <p className="text-gray-400 text-xs font-bold uppercase">Completed Trips</p>
// // // // //             <h3 className="text-2xl font-bold text-gray-900 mt-1">0</h3>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* ACTIVE ORDER (Placeholder) */}
// // // // //         <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100 relative overflow-hidden">
// // // // //           {isOnline ? (
// // // // //             <div className="text-center py-10">
// // // // //               <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
// // // // //                 <MapPin className="text-blue-500" size={32} />
// // // // //               </div>
// // // // //               <h3 className="text-xl font-bold text-gray-900">Searching for orders...</h3>
// // // // //               <p className="text-gray-500 text-sm mt-2">Stay in high demand areas to get orders faster.</p>
// // // // //             </div>
// // // // //           ) : (
// // // // //             <div className="text-center py-10 opacity-50">
// // // // //               <h3 className="text-xl font-bold text-gray-900">You are Offline</h3>
// // // // //               <p className="text-gray-500 text-sm mt-2">Go online to start receiving orders.</p>
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //         {/* RECENT ACTIVITY */}
// // // // //         <div className="mt-8">
// // // // //           <h4 className="font-bold text-gray-900 mb-4 px-2">Recent Activity</h4>
// // // // //           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center text-gray-400 text-sm">
// // // // //             No recent activity
// // // // //           </div>
// // // // //         </div>

// // // // //       </main>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default RiderDashboard;

// // // // import React, { useState, useEffect } from 'react';
// // // // import { useNavigate } from 'react-router-dom';
// // // // import { 
// // // //     Bike, MapPin, CheckCircle, LogOut, Bell, Navigation, 
// // // //     Clock, DollarSign, Package, ChevronRight 
// // // // } from 'lucide-react';
// // // // import api from '../services/api';

// // // // const RiderDashboard = () => {
// // // //   const navigate = useNavigate();
// // // //   const [isOnline, setIsOnline] = useState(true);
// // // //   const [availableOrders, setAvailableOrders] = useState([]);
// // // //   const [activeOrder, setActiveOrder] = useState(null); // The order currently being delivered
// // // //   const [stats, setStats] = useState({ earnings: 0, trips: 0 });
// // // //   const [loading, setLoading] = useState(false);

// // // //   const user = JSON.parse(localStorage.getItem('user') || '{}');

// // // //   // --- 1. POLL FOR AVAILABLE ORDERS ---
// // // //   const fetchAvailable = async () => {
// // // //     // Only fetch if we are online and don't have an active order
// // // //     if (!isOnline || activeOrder) return; 

// // // //     try {
// // // //         const res = await api.get("/api/rider/orders/available");
// // // //         setAvailableOrders(res.data);
// // // //     } catch (e) { 
// // // //         console.error("Polling error", e); 
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchAvailable();
// // // //     const interval = setInterval(fetchAvailable, 5000); // Poll every 5s
// // // //     return () => clearInterval(interval);
// // // //   }, [isOnline, activeOrder]);

// // // //   // --- 2. ACTIONS ---

// // // //   const handleAccept = async (order) => {
// // // //     setLoading(true);
// // // //     try {
// // // //         await api.post(`/api/rider/orders/${order.id}/accept`);
// // // //         // Move order to active state
// // // //         setActiveOrder({ ...order, status: 'accepted' }); // 'accepted' means 'heading to restaurant'
// // // //         setAvailableOrders([]); // Clear list
// // // //     } catch (e) {
// // // //         alert("Could not accept order. It might be taken.");
// // // //         fetchAvailable();
// // // //     } finally {
// // // //         setLoading(false);
// // // //     }
// // // //   };

// // // //   const handlePickup = async () => {
// // // //     setLoading(true);
// // // //     try {
// // // //         await api.post(`/api/rider/orders/${activeOrder.id}/pickup`);
// // // //         setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' }));
// // // //     } catch (e) {
// // // //         alert("Error updating status");
// // // //     } finally {
// // // //         setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleComplete = async () => {
// // // //     setLoading(true);
// // // //     try {
// // // //         await api.post(`/api/rider/orders/${activeOrder.id}/complete`);

// // // //         // Update Stats
// // // //         setStats(prev => ({
// // // //             earnings: prev.earnings + (activeOrder.total || 0), // Assuming rider gets full amount for demo
// // // //             trips: prev.trips + 1
// // // //         }));

// // // //         alert("Order Delivered! Great Job! 💵");
// // // //         setActiveOrder(null); // Go back to searching
// // // //         fetchAvailable();
// // // //     } catch (e) {
// // // //         alert("Error completing order");
// // // //     } finally {
// // // //         setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleLogout = () => {
// // // //     localStorage.clear();
// // // //     navigate('/login');
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-20">

// // // //       {/* HEADER */}
// // // //       <header className="bg-stone-900 text-white px-6 py-5 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
// // // //         <div className="flex justify-between items-center mb-4">
// // // //             <div className="flex items-center gap-3">
// // // //                 <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-stone-900 font-bold shadow-lg shadow-green-500/20">
// // // //                     <Bike size={20} />
// // // //                 </div>
// // // //                 <div>
// // // //                     <h1 className="font-bold text-lg leading-tight">Crave Fleet</h1>
// // // //                     <div className="flex items-center gap-2">
// // // //                         <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
// // // //                         <p className="text-xs text-stone-400">{isOnline ? 'Online & Searching' : 'Offline'}</p>
// // // //                     </div>
// // // //                 </div>
// // // //             </div>
// // // //             <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400 transition">
// // // //                 <LogOut size={18} />
// // // //             </button>
// // // //         </div>

// // // //         {/* Quick Stats */}
// // // //         <div className="grid grid-cols-2 gap-3">
// // // //             <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
// // // //                 <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Today's Earnings</p>
// // // //                 <h3 className="text-2xl font-black text-green-400 mt-1">₹{stats.earnings}</h3>
// // // //             </div>
// // // //             <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
// // // //                 <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Trips</p>
// // // //                 <h3 className="text-2xl font-black text-white mt-1">{stats.trips}</h3>
// // // //             </div>
// // // //         </div>
// // // //       </header>

// // // //       {/* MAIN CONTENT */}
// // // //       <main className="p-6 max-w-lg mx-auto space-y-6">

// // // //         {/* ONLINE/OFFLINE TOGGLE */}
// // // //         {!activeOrder && (
// // // //              <button 
// // // //                 onClick={() => setIsOnline(!isOnline)}
// // // //                 className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg transform active:scale-95 ${
// // // //                     isOnline 
// // // //                     ? 'bg-white text-red-500 border border-red-100 hover:bg-red-50' 
// // // //                     : 'bg-green-500 text-white shadow-green-200'
// // // //                 }`}
// // // //             >
// // // //                 {isOnline ? 'Stop Receiving Orders' : 'Go Online'}
// // // //             </button>
// // // //         )}

// // // //         {/* --- VIEW 1: ACTIVE ORDER (IN PROGRESS) --- */}
// // // //         {activeOrder && (
// // // //             <div className="animate-in slide-in-from-bottom-5 duration-500">
// // // //                 <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-500/5 border border-orange-100 relative overflow-hidden">
// // // //                     <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500 animate-loading-bar" />

// // // //                     {/* Status Badge */}
// // // //                     <div className="flex justify-between items-center mb-6">
// // // //                         <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
// // // //                             {activeOrder.status === 'out_for_delivery' ? 'Heading to Customer' : 'Heading to Restaurant'}
// // // //                         </span>
// // // //                         <span className="font-black text-lg">Order #{activeOrder.id}</span>
// // // //                     </div>

// // // //                     {/* Restaurant Info */}
// // // //                     <div className="mb-6 relative pl-4 border-l-2 border-dashed border-stone-200">
// // // //                         <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
// // // //                         <p className="text-xs font-bold text-stone-400 uppercase">Pick Up</p>
// // // //                         <h3 className="font-bold text-lg text-stone-800">{activeOrder.restaurant_name}</h3>
// // // //                         <p className="text-sm text-stone-500">{activeOrder.restaurant_address}</p>
// // // //                     </div>

// // // //                     {/* Customer Info */}
// // // //                     <div className="mb-8 relative pl-4 border-l-2 border-dashed border-stone-200">
// // // //                         <div className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-900 rounded-full border-2 border-white" />
// // // //                         <p className="text-xs font-bold text-stone-400 uppercase">Drop Off</p>
// // // //                         <h3 className="font-bold text-lg text-stone-800">Customer</h3>
// // // //                         <p className="text-sm text-stone-500">{activeOrder.delivery_address}</p>
// // // //                     </div>

// // // //                     {/* Action Button State Machine */}
// // // //                     {activeOrder.status !== 'out_for_delivery' ? (
// // // //                         <button 
// // // //                             onClick={handlePickup}
// // // //                             disabled={loading}
// // // //                             className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center gap-2"
// // // //                         >
// // // //                             <Package size={20} />
// // // //                             {loading ? 'Confirming...' : 'Confirm Pickup'}
// // // //                         </button>
// // // //                     ) : (
// // // //                         <button 
// // // //                             onClick={handleComplete}
// // // //                             disabled={loading}
// // // //                             className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2"
// // // //                         >
// // // //                             <CheckCircle size={20} />
// // // //                             {loading ? 'Processing...' : 'Complete Delivery'}
// // // //                         </button>
// // // //                     )}
// // // //                 </div>
// // // //             </div>
// // // //         )}

// // // //         {/* --- VIEW 2: AVAILABLE ORDERS LIST --- */}
// // // //         {!activeOrder && isOnline && (
// // // //             <div className="space-y-4">
// // // //                 <h3 className="font-bold text-stone-800 px-2 flex items-center justify-between">
// // // //                     New Requests 
// // // //                     {availableOrders.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{availableOrders.length}</span>}
// // // //                 </h3>

// // // //                 {availableOrders.length === 0 ? (
// // // //                     <div className="text-center py-12 opacity-50">
// // // //                         <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
// // // //                             <Navigation className="text-stone-400" size={24} />
// // // //                         </div>
// // // //                         <p className="font-bold text-stone-400">Searching for nearby orders...</p>
// // // //                     </div>
// // // //                 ) : (
// // // //                     availableOrders.map(order => (
// // // //                         <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
// // // //                              <div className="flex justify-between items-start mb-4">
// // // //                                 <div className="flex items-center gap-3">
// // // //                                     <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
// // // //                                         <Clock size={20} />
// // // //                                     </div>
// // // //                                     <div>
// // // //                                         <h4 className="font-bold text-stone-800 text-sm">Ready for Pickup</h4>
// // // //                                         <p className="text-xs text-stone-500">2 mins ago</p>
// // // //                                     </div>
// // // //                                 </div>
// // // //                                 <div className="text-right">
// // // //                                     <span className="block font-black text-lg text-stone-900">₹{order.total}</span>
// // // //                                     <span className="text-[10px] text-stone-400 uppercase font-bold">Earnings</span>
// // // //                                 </div>
// // // //                             </div>

// // // //                             <div className="space-y-3 mb-5">
// // // //                                 <div>
// // // //                                     <p className="text-[10px] text-stone-400 uppercase font-bold">Restaurant</p>
// // // //                                     <p className="text-sm font-bold text-stone-800 truncate">{order.restaurant_name}</p>
// // // //                                     <p className="text-xs text-stone-500 truncate">{order.restaurant_address}</p>
// // // //                                 </div>
// // // //                                 <div>
// // // //                                     <p className="text-[10px] text-stone-400 uppercase font-bold">Deliver To</p>
// // // //                                     <p className="text-xs text-stone-500 line-clamp-2">{order.delivery_address}</p>
// // // //                                 </div>
// // // //                             </div>

// // // //                             <button 
// // // //                                 onClick={() => handleAccept(order)}
// // // //                                 disabled={loading}
// // // //                                 className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-stone-800 transition-all active:scale-95"
// // // //                             >
// // // //                                 {loading ? 'Accepting...' : 'Accept Delivery'}
// // // //                             </button>
// // // //                         </div>
// // // //                     ))
// // // //                 )}
// // // //             </div>
// // // //         )}

// // // //       </main>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default RiderDashboard;

// // // import React, { useState, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import {
// // //     Bike, MapPin, CheckCircle, LogOut, Navigation,
// // //     Clock, Package
// // // } from 'lucide-react';
// // // import api from '../services/api';

// // // const RiderDashboard = () => {
// // //     const navigate = useNavigate();

// // //     // Get User Details for the Name
// // //     const user = JSON.parse(localStorage.getItem('user') || '{}');

// // //     // State
// // //     const [isOnline, setIsOnline] = useState(false);
// // //     const [stats, setStats] = useState({ earnings: 0, trips: 0 });
// // //     const [activeOrder, setActiveOrder] = useState(null);
// // //     const [availableOrders, setAvailableOrders] = useState([]);

// // //     // Two Loading States:
// // //     const [isInitializing, setIsInitializing] = useState(true); // For full-screen load
// // //     const [isProcessing, setIsProcessing] = useState(false);    // For button actions

// // //     // --- 1. INITIAL DATA FETCH ---
// // //     useEffect(() => {
// // //         const fetchDashboardData = async () => {
// // //             try {
// // //                 const res = await api.get("/api/rider/stats");

// // //                 setIsOnline(res.data.is_online);
// // //                 setStats({
// // //                     earnings: res.data.total_earnings || 0,
// // //                     trips: res.data.total_trips || 0
// // //                 });

// // //                 if (res.data.active_order) {
// // //                     setActiveOrder(res.data.active_order);
// // //                 }
// // //             } catch (err) {
// // //                 console.error("Failed to load rider stats", err);
// // //             } finally {
// // //                 // Only stop the full-screen loader here
// // //                 setIsInitializing(false);
// // //             }
// // //         };
// // //         fetchDashboardData();
// // //     }, []);

// // //     // --- 2. POLL FOR UPDATES (Available Orders + Active Order Status) ---
// // //     useEffect(() => {
// // //         if (!isOnline) return;

// // //         const syncData = async () => {
// // //             // A. If we have an active order, check its status (Has restaurant marked it ready?)
// // //             if (activeOrder) {
// // //                 try {
// // //                     // We re-use the stats endpoint because it returns the active_order details
// // //                     const res = await api.get("/api/rider/stats");
// // //                     if (res.data.active_order) {
// // //                         // Update local state if status changed (e.g., from 'accepted' to 'ready')
// // //                         if (res.data.active_order.status !== activeOrder.status) {
// // //                             setActiveOrder(res.data.active_order);
// // //                         }
// // //                     }
// // //                 } catch (e) { console.error("Sync error", e); }
// // //             }
// // //             // B. If no active order, look for new ones
// // //             else {
// // //                 try {
// // //                     const res = await api.get("/api/rider/orders/available");
// // //                     setAvailableOrders(res.data);
// // //                 } catch (e) { console.error("Polling error", e); }
// // //             }
// // //         };

// // //         syncData(); // Run immediately
// // //         const interval = setInterval(syncData, 5000); // Run every 5 seconds
// // //         return () => clearInterval(interval);
// // //     }, [isOnline, activeOrder]); // Re-run if activeOrder changes

// // //     // --- 3. ACTIONS ---

// // //     const toggleOnline = async () => {
// // //         const newState = !isOnline;
// // //         setIsOnline(newState);

// // //         try {
// // //             await api.post("/api/rider/status", { is_online: newState });
// // //         } catch (err) {
// // //             console.error("Failed to update status");
// // //             setIsOnline(!newState);
// // //             alert("Connection failed. Could not change status.");
// // //         }
// // //     };

// // //     const handleAccept = async (order) => {
// // //         setIsProcessing(true); // Start button loading
// // //         try {
// // //             await api.post(`/api/rider/orders/${order.id}/accept`);
// // //             setActiveOrder({ ...order, status: 'accepted' });
// // //             setAvailableOrders([]);
// // //         } catch (e) {
// // //             alert(e.response?.data?.detail || "Order already taken.");
// // //             setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
// // //         } finally {
// // //             setIsProcessing(false); // Stop button loading
// // //         }
// // //     };

// // //     const handlePickup = async () => {
// // //         setIsProcessing(true);
// // //         try {
// // //             await api.post(`/api/rider/orders/${activeOrder.id}/pickup`);
// // //             setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' }));
// // //         } catch (e) {
// // //             alert("Error updating status.");
// // //         } finally {
// // //             setIsProcessing(false);
// // //         }
// // //     };

// // //     const handleComplete = async () => {
// // //         setIsProcessing(true);
// // //         try {
// // //             const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);

// // //             setStats(prev => ({
// // //                 earnings: res.data.total_earnings,
// // //                 trips: prev.trips + 1
// // //             }));

// // //             const earned = res.data.earned || 0;

// // //             // --- UPDATED ALERT WITH NAME ---
// // //             alert(`Job Done! ${user.full_name || 'Rider'}, you earned ₹${earned.toFixed(2)}`);

// // //             setActiveOrder(null);
// // //         } catch (e) {
// // //             alert("Error completing order.");
// // //         } finally {
// // //             setIsProcessing(false);
// // //         }
// // //     };

// // //     const handleLogout = () => {
// // //         localStorage.clear();
// // //         sessionStorage.clear();
// // //         navigate('/login');
// // //     };

// // //     // Only show this full screen loader on the FIRST load
// // //     if (isInitializing) return (
// // //         <div className="min-h-screen flex items-center justify-center bg-stone-50">
// // //             <div className="animate-pulse flex flex-col items-center">
// // //                 <Bike size={48} className="text-stone-300 mb-4" />
// // //                 <p className="text-stone-400 font-bold">Loading Rider Profile...</p>
// // //             </div>
// // //         </div>
// // //     );

// // //     return (
// // //         <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-20">

// // //             {/* HEADER */}
// // //             <header className="bg-[#1a1a1a] text-white px-6 py-6 rounded-b-[2.5rem] shadow-xl sticky top-0 z-20">
// // //                 <div className="flex justify-between items-center mb-6">
// // //                     <div className="flex items-center gap-3">
// // //                         <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-stone-900 font-bold shadow-lg shadow-green-500/20">
// // //                             <Bike size={20} />
// // //                         </div>
// // //                         <div>
// // //                             <h1 className="font-bold text-lg leading-tight">Rider App</h1>
// // //                             <div className="flex items-center gap-2">
// // //                                 <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
// // //                                 <p className="text-xs text-stone-400">{isOnline ? 'Online' : 'Offline'}</p>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                     <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400 transition">
// // //                         <LogOut size={18} />
// // //                     </button>
// // //                 </div>

// // //                 {/* DYNAMIC STATS */}
// // //                 <div className="grid grid-cols-2 gap-3">
// // //                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
// // //                         <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Total Earnings</p>
// // //                         <h3 className="text-2xl font-black text-green-400 mt-1">₹{(stats.earnings || 0).toFixed(2)}</h3>
// // //                     </div>
// // //                     <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
// // //                         <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Total Trips</p>
// // //                         <h3 className="text-2xl font-black text-white mt-1">{stats.trips || 0}</h3>
// // //                     </div>
// // //                 </div>
// // //             </header>

// // //             {/* MAIN CONTENT */}
// // //             <main className="p-6 max-w-lg mx-auto space-y-6">

// // //                 {/* ONLINE/OFFLINE BUTTON */}
// // //                 {!activeOrder && (
// // //                     <button
// // //                         onClick={toggleOnline}
// // //                         className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg transform active:scale-[0.98] ${isOnline
// // //                             ? 'bg-white text-red-500 border border-red-100 hover:bg-red-50'
// // //                             : 'bg-green-500 text-white shadow-green-200 hover:bg-green-600'
// // //                             }`}
// // //                     >
// // //                         {isOnline ? 'Go Offline' : 'Go Online to Start'}
// // //                     </button>
// // //                 )}

// // //                 {/* ACTIVE ORDER CARD */}
// // //                 {activeOrder && (
// // //                     <div className="animate-in slide-in-from-bottom-5 duration-500">
// // //                         <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-500/5 border border-orange-100 relative overflow-hidden">
// // //                             <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500 animate-pulse" />

// // //                             <div className="flex justify-between items-center mb-6">
// // //                                 <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
// // //                                     {activeOrder.status === 'out_for_delivery' ? 'Heading to Customer' : 'Heading to Restaurant'}
// // //                                 </span>
// // //                                 <span className="font-black text-lg">Order #{activeOrder.id}</span>
// // //                             </div>

// // //                             <div className="mb-6 relative pl-4 border-l-2 border-dashed border-stone-200">
// // //                                 <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
// // //                                 <p className="text-xs font-bold text-stone-400 uppercase">Pick Up</p>
// // //                                 <h3 className="font-bold text-lg text-stone-800">{activeOrder.restaurant_name}</h3>
// // //                                 <p className="text-sm text-stone-500">{activeOrder.restaurant_address}</p>
// // //                             </div>

// // //                             <div className="mb-8 relative pl-4 border-l-2 border-dashed border-stone-200">
// // //                                 <div className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-900 rounded-full border-2 border-white" />
// // //                                 <p className="text-xs font-bold text-stone-400 uppercase">Drop Off</p>
// // //                                 <h3 className="font-bold text-lg text-stone-800">Customer</h3>
// // //                                 <p className="text-sm text-stone-500">{activeOrder.delivery_address}</p>
// // //                             </div>

// // //                             {activeOrder.status !== 'out_for_delivery' ? (
// // //                                 <button
// // //                                     onClick={handlePickup}
// // //                                     // DISABLE button if status is NOT ready
// // //                                     disabled={activeOrder.status !== 'ready' || isProcessing}
// // //                                     className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${activeOrder.status === 'ready'
// // //                                             ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]' // Enabled Style
// // //                                             : 'bg-stone-200 text-stone-400 cursor-not-allowed' // Disabled Style
// // //                                         }`}
// // //                                 >
// // //                                     <Package size={20} />
// // //                                     {activeOrder.status === 'ready'
// // //                                         ? (isProcessing ? 'Confirming...' : 'Confirm Pickup')
// // //                                         : 'Waiting for Restaurant...'
// // //                                     }
// // //                                 </button>
// // //                             ) : (
// // //                                 /* STAGE 2: DELIVERY FLOW */
// // //                                 <button
// // //                                     onClick={handleComplete}
// // //                                     disabled={isProcessing}
// // //                                     className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
// // //                                 >
// // //                                     <CheckCircle size={20} />
// // //                                     {isProcessing ? 'Completing...' : 'Complete Delivery'}
// // //                                 </button>
// // //                             )}
// // //                         </div>
// // //                     </div>
// // //                 )}

// // //                 {/* AVAILABLE ORDERS LIST */}
// // //                 {!activeOrder && isOnline && (
// // //                     <div className="space-y-4">
// // //                         <h3 className="font-bold text-stone-800 px-2 flex items-center justify-between">
// // //                             New Requests
// // //                             {availableOrders.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{availableOrders.length}</span>}
// // //                         </h3>

// // //                         {availableOrders.length === 0 ? (
// // //                             <div className="text-center py-12 opacity-50">
// // //                                 <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
// // //                                     <Navigation className="text-stone-400" size={24} />
// // //                                 </div>
// // //                                 <p className="font-bold text-stone-400">Searching nearby...</p>
// // //                             </div>
// // //                         ) : (
// // //                             availableOrders.map(order => (
// // //                                 <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
// // //                                     <div className="flex justify-between items-start mb-4">
// // //                                         <div className="flex items-center gap-3">
// // //                                             <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
// // //                                                 <Clock size={20} />
// // //                                             </div>
// // //                                             <div>
// // //                                                 <h4 className="font-bold text-stone-800 text-sm">Ready for Pickup</h4>
// // //                                                 <p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
// // //                                             </div>
// // //                                         </div>
// // //                                         <div className="text-right">
// // //                                             <span className="block font-black text-lg text-green-600">₹{(order.total * 0.10).toFixed(0)}</span>
// // //                                             <span className="text-[10px] text-stone-400 uppercase font-bold">Your Pay</span>
// // //                                         </div>
// // //                                     </div>

// // //                                     <div className="space-y-3 mb-5">
// // //                                         <div>
// // //                                             <p className="text-[10px] text-stone-400 uppercase font-bold">Restaurant</p>
// // //                                             <p className="text-sm font-bold text-stone-800 truncate">{order.restaurant_name}</p>
// // //                                             <p className="text-xs text-stone-500 truncate">{order.restaurant_address}</p>
// // //                                         </div>
// // //                                         <div>
// // //                                             <p className="text-[10px] text-stone-400 uppercase font-bold">Deliver To</p>
// // //                                             <p className="text-xs text-stone-500 line-clamp-2">{order.delivery_address}</p>
// // //                                         </div>
// // //                                     </div>

// // //                                     <button
// // //                                         onClick={() => handleAccept(order)}
// // //                                         disabled={isProcessing}
// // //                                         className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-stone-800 transition-all active:scale-95"
// // //                                     >
// // //                                         {isProcessing ? 'Accepting...' : 'Accept Delivery'}
// // //                                     </button>
// // //                                 </div>
// // //                             ))
// // //                         )}
// // //                     </div>
// // //                 )}

// // //             </main>
// // //         </div>
// // //     );
// // // };

// // // export default RiderDashboard;

// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { Bike, LogOut, Navigation, Clock, Package, ChevronRight, ChefHat, CheckCircle } from 'lucide-react';
// // import api from '../services/api';

// // const RiderDashboard = () => {
// //     const navigate = useNavigate();
// //     const [isOnline, setIsOnline] = useState(false);
// //     const [stats, setStats] = useState({ earnings: 0, trips: 0 });
// //     const [activeOrder, setActiveOrder] = useState(null);
// //     const [availableOrders, setAvailableOrders] = useState([]);
// //     const [isInitializing, setIsInitializing] = useState(true);
// //     const [isProcessing, setIsProcessing] = useState(false);

// //     useEffect(() => {
// //         const fetchDashboardData = async () => {
// //             try {
// //                 const res = await api.get("/api/rider/stats");
// //                 setIsOnline(res.data.is_online);
// //                 setStats({ earnings: res.data.total_earnings || 0, trips: res.data.total_trips || 0 });
// //                 if (res.data.active_order) setActiveOrder(res.data.active_order);
// //             } catch (err) { console.error(err); } finally { setIsInitializing(false); }
// //         };
// //         fetchDashboardData();
// //     }, []);

// //     useEffect(() => {
// //         if (!isOnline) return;
// //         const syncData = async () => {
// //             try {
// //                 const res = await api.get("/api/rider/stats");
// //                 const backendOrder = res.data.active_order;
// //                 if (backendOrder) {
// //                     if (!activeOrder || backendOrder.status !== activeOrder.status || backendOrder.id !== activeOrder.id) {
// //                         setActiveOrder(backendOrder);
// //                     }
// //                 } else {
// //                     setActiveOrder(null);
// //                     const avRes = await api.get("/api/rider/orders/available");
// //                     setAvailableOrders(avRes.data);
// //                 }
// //             } catch (e) { console.error(e); }
// //         };
// //         syncData();
// //         const interval = setInterval(syncData, 4000);
// //         return () => clearInterval(interval);
// //     }, [isOnline, activeOrder?.status]);

// //     const toggleOnline = async () => {
// //         const newState = !isOnline; setIsOnline(newState);
// //         try { await api.post("/api/rider/status", { is_online: newState }); }
// //         catch (err) { setIsOnline(!newState); }
// //     };

// //     const handleAccept = async (order) => {
// //         setIsProcessing(true);
// //         try {
// //             await api.post(`/api/rider/orders/${order.id}/accept`);
// //             setActiveOrder({ ...order, status: 'accepted' });
// //             setAvailableOrders([]);
// //         } catch (e) { alert("Taken by another rider"); } finally { setIsProcessing(false); }
// //     };

// //     const handlePickup = async () => {
// //         setIsProcessing(true);
// //         try {
// //             await api.post(`/api/rider/orders/${activeOrder.id}/pickup`);
// //             setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' }));
// //         } catch (e) { alert("Update failed"); } finally { setIsProcessing(false); }
// //     };

// //     const handleComplete = async () => {
// //         setIsProcessing(true);
// //         try {
// //             const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);
// //             setStats({ earnings: res.data.total_earnings, trips: stats.trips + 1 });
// //             setActiveOrder(null);
// //         } catch (e) { alert("Error completing order"); } finally { setIsProcessing(false); }
// //     };

// //     if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Bike className="animate-pulse text-stone-300" size={48} /></div>;

// //     return (
// //         <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-20">
// //             <header className="bg-stone-900 text-white px-6 py-5 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
// //                 <div className="flex justify-between items-center mb-6">
// //                     <div className="flex items-center gap-3">
// //                         <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-stone-900 font-bold"><Bike size={20} /></div>
// //                         <div><h1 className="font-bold text-lg leading-tight">Crave Fleet</h1><p className="text-xs text-stone-400">{isOnline ? 'Searching' : 'Offline'}</p></div>
// //                     </div>
// //                     <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-2 bg-white/10 rounded-full"><LogOut size={18} /></button>
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-3">
// //                     <div className="bg-white/10 p-3 rounded-2xl border border-white/5"><p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Earnings</p><h3 className="text-2xl font-black text-green-400 mt-1">₹{stats.earnings.toFixed(2)}</h3></div>
// //                     <div className="bg-white/10 p-3 rounded-2xl border border-white/5"><p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Trips</p><h3 className="text-2xl font-black text-white mt-1">{stats.trips}</h3></div>
// //                 </div>
// //             </header>

// //             <main className="p-6 max-w-lg mx-auto space-y-6">
// //                 {!activeOrder && <button onClick={toggleOnline} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transform active:scale-95 ${isOnline ? 'bg-white text-red-500 border border-red-100' : 'bg-green-500 text-white'}`}>{isOnline ? 'Stop Receiving' : 'Go Online'}</button>}

// //                 {activeOrder && (
// //                     <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 relative overflow-hidden">
// //                         <div className={`absolute top-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000 ${activeOrder.status === 'out_for_delivery' ? 'w-full' : 'w-1/2'}`} />
// //                         <div className="flex justify-between items-center mb-6">
// //                             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeOrder.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{activeOrder.status === 'out_for_delivery' ? 'Delivering' : activeOrder.status === 'ready' ? 'Food Ready!' : 'Cooking...'}</span>
// //                             <span className="font-black text-lg text-stone-300">#{activeOrder.id}</span>
// //                         </div>
// //                         <div className="mb-6 relative pl-4 border-l-2 border-orange-500">
// //                             <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
// //                             <p className="text-xs font-bold text-stone-400 uppercase">Restaurant</p>
// //                             <h3 className="font-bold text-lg text-stone-800">{activeOrder.restaurant_name}</h3>
// //                             <p className="text-sm text-stone-500">{activeOrder.restaurant_address}</p>
// //                         </div>
// //                         <div className="mb-8 relative pl-4 border-l-2 border-stone-200">
// //                             <div className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-300 rounded-full border-2 border-white" />
// //                             <p className="text-xs font-bold text-stone-400 uppercase">Customer Address</p>
// //                             <p className="text-sm text-stone-500">{activeOrder.delivery_address}</p>
// //                         </div>
// //                         {activeOrder.status !== 'out_for_delivery' ? (
// //                             <button onClick={handlePickup} disabled={activeOrder.status !== 'ready' || isProcessing} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${activeOrder.status === 'ready' ? 'bg-stone-900 text-white active:scale-95' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
// //                                 <Package size={20} /> {activeOrder.status === 'ready' ? (isProcessing ? 'Checking...' : 'Confirm Pickup') : 'Waiting for Restaurant...'}
// //                             </button>
// //                         ) : (
// //                             <button onClick={handleComplete} disabled={isProcessing} className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"><CheckCircle size={20} /> {isProcessing ? 'Completing...' : 'Complete Delivery'}</button>
// //                         )}
// //                     </div>
// //                 )}

// //                 {!activeOrder && isOnline && availableOrders.map(order => (
// //                     <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
// //                         <div className="flex justify-between items-start mb-4">
// //                             <div className="flex items-center gap-3">
// //                                 <div className={`p-2.5 rounded-xl ${order.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
// //                                     {order.status === 'ready' ? <Package size={20} /> : <ChefHat size={20} />}
// //                                 </div>
// //                                 <div><h4 className="font-bold text-sm">{order.status === 'ready' ? "Ready" : "Cooking"}</h4><p className="text-xs text-stone-500">Earn ₹{(order.total * 0.10).toFixed(0)}</p></div>
// //                             </div>
// //                         </div>
// //                         <div className="space-y-3 mb-5">
// //                             <p className="text-sm font-bold text-stone-800">{order.restaurant_name}</p>
// //                             <p className="text-xs text-stone-500 line-clamp-2">{order.delivery_address}</p>
// //                         </div>
// //                         <button onClick={() => handleAccept(order)} disabled={isProcessing} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">Accept Request <ChevronRight size={16} /></button>
// //                     </div>
// //                 ))}
// //             </main>
// //         </div>
// //     );
// // };

// // export default RiderDashboard;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//     Bike, LogOut, Package, ChevronRight, ChefHat, 
//     CheckCircle, Settings, X, Save, User, Mail, Phone, MapPin, AtSign 
// } from 'lucide-react';
// import api from '../services/api';

// const RiderDashboard = () => {
//     const navigate = useNavigate();

//     // --- 1. Original Logic State ---
//     const [isOnline, setIsOnline] = useState(false);
//     const [stats, setStats] = useState({ earnings: 0, trips: 0 });
//     const [activeOrder, setActiveOrder] = useState(null);
//     const [availableOrders, setAvailableOrders] = useState([]);
//     const [isInitializing, setIsInitializing] = useState(true);
//     const [isProcessing, setIsProcessing] = useState(false);

//     // --- 2. New Profile State (Only added for the UI) ---
//     const [riderProfile, setRiderProfile] = useState({ 
//         username: '', name: '', email: '', phone: '' 
//     });
//     const [isEditing, setIsEditing] = useState(false);
//     const [editForm, setEditForm] = useState({ 
//         username: '', full_name: '', email: '', phone: '' 
//     });
//     const [isSaving, setIsSaving] = useState(false);

//     // --- 3. LOGIC: Initial Fetch ---
//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             try {
//                 const res = await api.get("/api/rider/stats");

//                 // Set Data
//                 setIsOnline(res.data.is_online);
//                 setStats({ earnings: res.data.total_earnings || 0, trips: res.data.total_trips || 0 });
//                 if (res.data.active_order) setActiveOrder(res.data.active_order);

//                 // Set Profile (New UI part)
//                 const profile = {
//                     username: res.data.username || '',
//                     name: res.data.name || 'Rider',
//                     email: res.data.email || '',
//                     phone: res.data.phone || ''
//                 };
//                 setRiderProfile(profile);
//                 setEditForm({ 
//                     username: profile.username, 
//                     full_name: profile.name, 
//                     email: profile.email, 
//                     phone: profile.phone 
//                 });

//             } catch (err) { console.error(err); } finally { setIsInitializing(false); }
//         };
//         fetchDashboardData();
//     }, []);

//     // --- 4. LOGIC: Polling Sync (Exact match to your provided code) ---
//     useEffect(() => {
//         if (!isOnline) return;
//         const syncData = async () => {
//             try {
//                 const res = await api.get("/api/rider/stats");
//                 const backendOrder = res.data.active_order;

//                 // Update Stats Live
//                 setStats({ earnings: res.data.total_earnings || 0, trips: res.data.total_trips || 0 });

//                 if (backendOrder) {
//                     if (!activeOrder || backendOrder.status !== activeOrder.status || backendOrder.id !== activeOrder.id) {
//                         setActiveOrder(backendOrder);
//                     }
//                 } else {
//                     setActiveOrder(null);
//                     const avRes = await api.get("/api/rider/orders/available");
//                     setAvailableOrders(avRes.data);
//                 }
//             } catch (e) { console.error(e); }
//         };
//         syncData();
//         const interval = setInterval(syncData, 4000);
//         return () => clearInterval(interval);
//     }, [isOnline, activeOrder?.status, activeOrder?.id]); // Added .id to be safe, but logic remains same

//     // --- 5. LOGIC: Handlers (Exact match) ---

//     const toggleOnline = async () => {
//         const newState = !isOnline; setIsOnline(newState);
//         try { await api.post("/api/rider/status", { is_online: newState }); }
//         catch (err) { setIsOnline(!newState); }
//     };

//     const handleAccept = async (order) => {
//         setIsProcessing(true);
//         try {
//             await api.post(`/api/rider/orders/${order.id}/accept`);
//             setActiveOrder({ ...order, status: 'accepted' });
//             setAvailableOrders([]);
//         } catch (e) { alert("Taken by another rider"); } finally { setIsProcessing(false); }
//     };

//     const handlePickup = async () => {
//         setIsProcessing(true);
//         try {
//             await api.post(`/api/rider/orders/${activeOrder.id}/pickup`);
//             setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' }));
//         } catch (e) { alert("Update failed"); } finally { setIsProcessing(false); }
//     };

//     const handleComplete = async () => {
//         setIsProcessing(true);
//         try {
//             const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);
//             setStats({ earnings: res.data.total_earnings, trips: stats.trips + 1 });
//             setActiveOrder(null);
//         } catch (e) { alert("Error completing order"); } finally { setIsProcessing(false); }
//     };

//     // --- 6. NEW HANDLER: Profile Save ---
//     const handleSaveProfile = async (e) => {
//         e.preventDefault();
//         setIsSaving(true);
//         try {
//             const res = await api.put("/api/rider/profile", editForm);
//             setRiderProfile({ 
//                 username: res.data.username, name: res.data.name, 
//                 email: res.data.email, phone: res.data.phone 
//             });
//             setIsEditing(false);
//             alert("Profile Updated!");
//         } catch (err) {
//             alert(err.response?.data?.detail || "Update failed");
//         } finally { setIsSaving(false); }
//     };

//     const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'RI';

//     if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Bike className="animate-bounce text-stone-300" size={48} /></div>;

//     return (
//         <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-20 relative">

//             {/* HEADER (New UI) */}
//             <header className="bg-stone-900 text-white px-6 py-5 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
//                 <div className="flex justify-between items-center mb-6">
//                     <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-stone-900 font-bold text-lg border-2 border-stone-800 shadow-lg shadow-emerald-900/20">
//                             {getInitials(riderProfile.name)}
//                         </div>
//                         <div>
//                             <h1 className="font-bold text-lg leading-tight">{riderProfile.name}</h1>
//                             <p className="text-xs text-stone-400">@{riderProfile.username}</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-2">
//                         <button onClick={() => setIsEditing(true)} className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
//                             <Settings size={20} />
//                         </button>
//                         <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="p-2.5 bg-stone-800 rounded-full text-red-400 hover:bg-red-900/30 transition-colors">
//                             <LogOut size={20} />
//                         </button>
//                     </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                     <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
//                         <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Earnings</p>
//                         <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{stats.earnings.toFixed(2)}</h3>
//                     </div>
//                     <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
//                         <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Trips</p>
//                         <h3 className="text-2xl font-black text-white mt-1">{stats.trips}</h3>
//                     </div>
//                 </div>
//             </header>

//             {/* MAIN CONTENT */}
//             <main className="p-6 max-w-lg mx-auto space-y-6">

//                 {/* Online Toggle */}
//                 {!activeOrder && (
//                     <button onClick={toggleOnline} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transform active:scale-95 transition-all ${isOnline ? 'bg-white text-rose-500 border border-rose-100' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'}`}>
//                         {isOnline ? 'Stop Receiving' : 'Go Online'}
//                     </button>
//                 )}

//                 {/* Empty State */}
//                 {isOnline && !activeOrder && availableOrders.length === 0 && (
//                     <div className="text-center py-10 opacity-50">
//                         <div className="animate-pulse mb-3 flex justify-center"><Package size={40} className="text-stone-300"/></div>
//                         <p className="text-sm font-bold text-stone-400">Scanning area...</p>
//                     </div>
//                 )}

//                 {/* ACTIVE ORDER CARD */}
//                 {activeOrder && (
//                     <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-orange-100 relative overflow-hidden">
//                         <div className={`absolute top-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000 ${activeOrder.status === 'out_for_delivery' ? 'w-full' : 'w-1/2'}`} />

//                         <div className="flex justify-between items-center mb-6 mt-1">
//                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
//                                 activeOrder.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 
//                                 activeOrder.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
//                             }`}>
//                                 {activeOrder.status === 'out_for_delivery' ? 'On The Way' : activeOrder.status === 'ready' ? 'Pickup Ready' : 'Accepted'}
//                             </span>
//                             <span className="font-black text-lg text-stone-300">#{activeOrder.id}</span>
//                         </div>

//                         <div className="space-y-6 mb-8">
//                             <div className="relative pl-5 border-l-2 border-orange-500">
//                                 <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
//                                 <h3 className="font-bold text-lg text-stone-800">{activeOrder.restaurant_name}</h3>
//                                 <p className="text-xs text-stone-500">{activeOrder.restaurant_address}</p>
//                             </div>
//                             <div className="relative pl-5 border-l-2 border-stone-200">
//                                 <div className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-300 rounded-full border-2 border-white" />
//                                 <p className="text-sm font-medium text-stone-600">{activeOrder.delivery_address}</p>
//                             </div>
//                         </div>

//                         {activeOrder.status !== 'out_for_delivery' ? (
//                             <button onClick={handlePickup} disabled={activeOrder.status !== 'ready' || isProcessing} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${activeOrder.status === 'ready' ? 'bg-stone-900 text-white active:scale-95' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}>
//                                 <Package size={20} /> {activeOrder.status === 'ready' ? (isProcessing ? 'Verifying...' : 'Confirm Pickup') : 'Waiting for Food...'}
//                             </button>
//                         ) : (
//                             <button onClick={handleComplete} disabled={isProcessing} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-600">
//                                 {isProcessing ? 'Completing...' : <><CheckCircle size={20} /> Complete Delivery</>}
//                             </button>
//                         )}
//                     </div>
//                 )}

//                 {/* AVAILABLE ORDERS LIST */}
//                 {!activeOrder && isOnline && availableOrders.map(order => (
//                     <div key={order.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-stone-100 hover:shadow-md transition-all transform hover:-translate-y-1">
//                         <div className="flex justify-between items-start mb-4">
//                             <div className="flex items-center gap-3">
//                                 <div className={`p-2.5 rounded-xl ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
//                                     {order.status === 'ready' ? <Package size={20} /> : <ChefHat size={20} />}
//                                 </div>
//                                 <div>
//                                     <h4 className="font-bold text-sm text-stone-800">{order.restaurant_name}</h4>
//                                     <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
//                                         <MapPin size={10} /> 
//                                         <span>2.5km • </span>
//                                         <span className="uppercase font-bold">{order.status === 'ready' ? "Ready" : "Preparing"}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="text-right">
//                                 <span className="block font-black text-lg text-emerald-600">₹{(order.total * 0.10).toFixed(0)}</span>
//                             </div>
//                         </div>

//                         <div className="bg-stone-50 p-3 rounded-xl mb-4 border border-stone-100">
//                             <p className="text-xs font-bold text-stone-400 uppercase mb-1">Deliver To</p>
//                             <p className="text-xs text-stone-600 line-clamp-1">{order.delivery_address}</p>
//                         </div>

//                         <button onClick={() => handleAccept(order)} disabled={isProcessing} className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors">
//                             Accept Order <ChevronRight size={16} />
//                         </button>
//                     </div>
//                 ))}
//             </main>

//             {/* --- EDIT MODAL --- */}
//             {isEditing && (
//                 <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//                     <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-xl font-bold text-stone-800">Edit Profile</h2>
//                             <button onClick={() => setIsEditing(false)} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"><X size={20} /></button>
//                         </div>
//                         <form onSubmit={handleSaveProfile} className="space-y-4">
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-stone-400 ml-1">Username</label>
//                                 <div className="relative">
//                                     <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
//                                     <input type="text" required value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="username" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-stone-400 ml-1">Full Name</label>
//                                 <div className="relative">
//                                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
//                                     <input type="text" required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="Full Name" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-stone-400 ml-1">Email</label>
//                                 <div className="relative">
//                                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
//                                     <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="email" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-xs font-bold text-stone-400 ml-1">Phone</label>
//                                 <div className="relative">
//                                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
//                                     <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="Phone" />
//                                 </div>
//                             </div>
//                             <button type="submit" disabled={isSaving} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all hover:bg-black">
//                                 {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RiderDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bike, LogOut, Package, ChevronRight, ChefHat,
    CheckCircle, Settings, X, Save, User, Mail, Phone, AtSign, MapPin, Navigation
} from 'lucide-react';
import api from '../services/api';

const RiderDashboard = () => {
    const navigate = useNavigate();

    // --- 1. Logic State (From Workable Code) ---
    const [isOnline, setIsOnline] = useState(false);
    const [stats, setStats] = useState({ earnings: 0, trips: 0 });
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- 2. UI/Profile State (From New UI Code) ---
    const [riderProfile, setRiderProfile] = useState({
        username: '', name: '', email: '', phone: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '', full_name: '', email: '', phone: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // --- 3. Initial Fetch (Combines both logic & profile load) ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get Stats & Status (Logic)
                const res = await api.get("/api/rider/stats");
                setIsOnline(res.data.is_online);
                setStats({
                    earnings: res.data.total_earnings || 0,
                    trips: res.data.total_trips || 0
                });

                if (res.data.active_order) {
                    setActiveOrder(res.data.active_order);
                }

                // 2. Get Profile Data (For UI)
                // Note: Ensure your backend sends these fields, or fallback to defaults
                const profile = {
                    username: res.data.username || 'rider',
                    name: res.data.name || 'Rider Profile',
                    email: res.data.email || 'rider@example.com',
                    phone: res.data.phone || ''
                };
                setRiderProfile(profile);
                setEditForm({
                    username: profile.username,
                    full_name: profile.name,
                    email: profile.email,
                    phone: profile.phone
                });

            } catch (err) {
                console.error("Failed to load rider stats", err);
            } finally {
                setIsInitializing(false);
            }
        };
        fetchDashboardData();
    }, []);

    // --- 4. THE SERIOUS LOGIC FIX: SYNC STATUS (From Workable Code) ---
    useEffect(() => {
        if (!isOnline) return;

        const syncData = async () => {
            try {
                // Fetch latest state from backend
                const res = await api.get("/api/rider/stats");
                const backendOrder = res.data.active_order;

                if (backendOrder) {
                    // Update frontend if status changed (e.g., 'accepted' -> 'ready')
                    // This is what fixes the "stuck" problem
                    if (!activeOrder || backendOrder.status !== activeOrder.status || backendOrder.id !== activeOrder.id) {
                        setActiveOrder(backendOrder);
                    }
                } else {
                    // No active order? Clear the state and look for new ones
                    setActiveOrder(null);
                    const availableRes = await api.get("/api/rider/orders/available");
                    setAvailableOrders(availableRes.data);
                }
            } catch (e) {
                console.error("Sync error", e);
            }
        };

        syncData();
        const interval = setInterval(syncData, 4000); // Check every 4 seconds
        return () => clearInterval(interval);
    }, [isOnline, activeOrder?.status]); // Dependency array matching workable logic

    // --- 5. Handlers ---

    const toggleOnline = async () => {
        const newState = !isOnline;
        setIsOnline(newState);
        try {
            await api.post("/api/rider/status", { is_online: newState });
        } catch (err) {
            setIsOnline(!newState);
            alert("Connection failed.");
        }
    };

    const handleAccept = async (order) => {
        setIsProcessing(true);
        try {
            await api.post(`/api/rider/orders/${order.id}/accept`);
            setActiveOrder({ ...order, status: 'accepted' });
            setAvailableOrders([]);
        } catch (e) {
            alert("Order taken by someone else.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePickup = async () => {
        setIsProcessing(true);
        try {
            await api.post(`/api/rider/orders/${activeOrder.id}/pickup`);
            setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' }));
        } catch (e) {
            alert("Update failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleComplete = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);
            setStats(prev => ({
                earnings: res.data.total_earnings,
                trips: prev.trips + 1
            }));
            alert(`Job Done! Earned ₹${res.data.earned}`);
            setActiveOrder(null);
        } catch (e) {
            alert("Error completing order.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Ensure you have this endpoint in main.py, or update purely locally for now
            const res = await api.put("/api/rider/profile", editForm);
            setRiderProfile({
                username: res.data.username, name: res.data.name,
                email: res.data.email, phone: res.data.phone
            });
            setIsEditing(false);
            alert("Profile Updated!");
        } catch (err) {
            // Fallback for UI demo if endpoint doesn't exist yet
            console.warn("Backend profile update failed/missing, updating UI only");
            setRiderProfile({
                username: editForm.username, name: editForm.full_name,
                email: editForm.email, phone: editForm.phone
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'RI';

    if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Bike className="animate-bounce text-stone-300" size={48} /></div>;

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-20 relative">

            {/* HEADER (New UI) */}
            <header className="bg-stone-900 text-white px-6 py-5 rounded-b-[2rem] shadow-xl sticky top-0 z-20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-stone-900 font-bold text-lg border-2 border-stone-800 shadow-lg shadow-emerald-900/20">
                            {getInitials(riderProfile.name)}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{riderProfile.name}</h1>
                            <p className="text-xs text-stone-400">@{riderProfile.username}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
                            <Settings size={20} />
                        </button>
                        <button onClick={handleLogout} className="p-2.5 bg-stone-800 rounded-full text-red-400 hover:bg-red-900/30 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Earnings</p>
                        <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{stats.earnings.toFixed(2)}</h3>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Trips</p>
                        <h3 className="text-2xl font-black text-white mt-1">{stats.trips}</h3>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="p-6 max-w-lg mx-auto space-y-6">

                {/* Online Toggle */}
                {!activeOrder && (
                    <button onClick={toggleOnline} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transform active:scale-95 transition-all ${isOnline ? 'bg-white text-rose-500 border border-rose-100' : 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'}`}>
                        {isOnline ? 'Stop Receiving' : 'Go Online'}
                    </button>
                )}

                {/* Empty State */}
                {isOnline && !activeOrder && availableOrders.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <div className="animate-pulse mb-3 flex justify-center"><Navigation size={40} className="text-stone-300" /></div>
                        <p className="text-sm font-bold text-stone-400">Scanning area...</p>
                    </div>
                )}

                {/* ACTIVE ORDER CARD */}
                {activeOrder && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-orange-100 relative overflow-hidden animate-in slide-in-from-bottom duration-500">
                        <div className={`absolute top-0 left-0 h-1.5 bg-orange-500 transition-all duration-1000 ${activeOrder.status === 'out_for_delivery' ? 'w-full' : 'w-1/2'}`} />

                        <div className="flex justify-between items-center mb-6 mt-1">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${activeOrder.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                    activeOrder.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {activeOrder.status === 'out_for_delivery' ? 'On The Way' : activeOrder.status === 'ready' ? 'Pickup Ready' : 'Accepted'}
                            </span>
                            <span className="font-black text-lg text-stone-300">#{activeOrder.id}</span>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="relative pl-5 border-l-2 border-orange-500">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" />
                                <h3 className="font-bold text-lg text-stone-800">{activeOrder.restaurant_name}</h3>
                                <p className="text-xs text-stone-500">{activeOrder.restaurant_address}</p>
                            </div>
                            <div className="relative pl-5 border-l-2 border-stone-200">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-stone-300 rounded-full border-2 border-white" />
                                <p className="text-sm font-medium text-stone-600">{activeOrder.delivery_address}</p>
                            </div>
                        </div>

                        {activeOrder.status !== 'out_for_delivery' ? (
                            <button onClick={handlePickup} disabled={activeOrder.status !== 'ready' || isProcessing} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${activeOrder.status === 'ready' ? 'bg-stone-900 text-white active:scale-95' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}>
                                <Package size={20} /> {activeOrder.status === 'ready' ? (isProcessing ? 'Verifying...' : 'Confirm Pickup') : 'Waiting for Food...'}
                            </button>
                        ) : (
                            <button onClick={handleComplete} disabled={isProcessing} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-600">
                                {isProcessing ? 'Completing...' : <><CheckCircle size={20} /> Complete Delivery</>}
                            </button>
                        )}
                    </div>
                )}

                {/* AVAILABLE ORDERS LIST */}
                {!activeOrder && isOnline && availableOrders.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-stone-100 hover:shadow-md transition-all transform hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {order.status === 'ready' ? <Package size={20} /> : <ChefHat size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-stone-800">{order.restaurant_name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                                        <MapPin size={10} />
                                        <span>2.5km • </span>
                                        <span className="uppercase font-bold">{order.status === 'ready' ? "Ready" : "Preparing"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-lg text-emerald-600">₹{(order.total * 0.10).toFixed(0)}</span>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-3 rounded-xl mb-4 border border-stone-100">
                            <p className="text-xs font-bold text-stone-400 uppercase mb-1">Deliver To</p>
                            <p className="text-xs text-stone-600 line-clamp-1">{order.delivery_address}</p>
                        </div>

                        <button onClick={() => handleAccept(order)} disabled={isProcessing} className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors">
                            Accept Order <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
            </main>

            {/* --- EDIT MODAL --- */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-stone-800">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-400 ml-1">Username</label>
                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input type="text" required value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="username" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-400 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input type="text" required value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="Full Name" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="email" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-400 ml-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-stone-900 font-medium text-stone-800" placeholder="Phone" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all hover:bg-black">
                                {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderDashboard;