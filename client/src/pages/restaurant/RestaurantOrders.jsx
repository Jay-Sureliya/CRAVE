// // // import { useState } from "react";
// // // import RestaurantSidebar from "../../components/RestaurantSidebar";

// // // const RestaurantOrders = () => {
// // //     const [activeTab, setActiveTab] = useState("pending");

// // //     // Dummy data for now (we will connect API later)
// // //     const orders = [
// // //         { id: 101, item: "Spicy Burger", status: "pending", total: "$15" },
// // //         { id: 102, item: "Cheese Pizza", status: "completed", total: "$22" },
// // //         { id: 103, item: "Coke & Fries", status: "pending", total: "$8" },
// // //     ];

// // //     const filteredOrders = orders.filter(order => order.status === activeTab);

// // //     return (
// // //         <div className="min-h-screen bg-gray-50 flex font-sans">

// // //             <main className="flex-1 p-8">
// // //                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders Manager</h2>

// // //                 {/* Tabs */}
// // //                 <div className="flex gap-4 border-b border-gray-200 mb-6">
// // //                     <button 
// // //                         className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-500'}`}
// // //                         onClick={() => setActiveTab("pending")}
// // //                     >
// // //                         Pending Orders
// // //                     </button>
// // //                     <button 
// // //                         className={`pb-2 px-1 ${activeTab === 'completed' ? 'border-b-2 border-green-500 text-green-600 font-bold' : 'text-gray-500'}`}
// // //                         onClick={() => setActiveTab("completed")}
// // //                     >
// // //                         Completed Orders
// // //                     </button>
// // //                 </div>

// // //                 {/* Orders List */}
// // //                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
// // //                     {filteredOrders.length === 0 ? (
// // //                         <p className="p-6 text-gray-400">No {activeTab} orders found.</p>
// // //                     ) : (
// // //                         filteredOrders.map(order => (
// // //                             <div key={order.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
// // //                                 <div>
// // //                                     <p className="font-bold text-gray-800">Order #{order.id}</p>
// // //                                     <p className="text-sm text-gray-500">{order.item}</p>
// // //                                 </div>
// // //                                 <div className="text-right">
// // //                                     <p className="font-bold">{order.total}</p>
// // //                                     <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
// // //                                         {order.status.toUpperCase()}
// // //                                     </span>
// // //                                 </div>
// // //                             </div>
// // //                         ))
// // //                     )}
// // //                 </div>
// // //             </main>
// // //         </div>
// // //     );
// // // };

// // // export default RestaurantOrders;


// // import React, { useState, useEffect } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //     ChefHat, Clock, CheckCircle, Bike, ShoppingBag
// // } from "lucide-react";
// // import api from "../../services/api"; // Uses your centralized API service

// // const RestaurantOrders = () => {
// //     const [orders, setOrders] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [activeFilter, setActiveFilter] = useState("pending"); // pending, preparing, ready, history

// //     // --- 1. FETCH ORDERS FROM API ---
// //     const fetchOrders = async () => {
// //         try {
// //             // api.get uses the interceptor to attach the token automatically
// //             const res = await api.get("/api/restaurant/orders");
// //             setOrders(res.data);
// //             setLoading(false);
// //         } catch (err) {
// //             console.error("Failed to fetch orders", err);
// //             setLoading(false);
// //         }
// //     };

// //     // --- 2. AUTO-POLLING (Real-time update) ---
// //     useEffect(() => {
// //         fetchOrders();
// //         // Check for new orders every 10 seconds
// //         const interval = setInterval(fetchOrders, 10000);
// //         return () => clearInterval(interval);
// //     }, []);

// //     // --- 3. HANDLE STATUS UPDATES ---
// //     const updateStatus = async (orderId, newStatus) => {
// //         // Optimistic UI Update (Change visually first)
// //         const prevOrders = [...orders];
// //         setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

// //         try {
// //             await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
// //             fetchOrders(); // Sync with backend to be sure
// //         } catch (err) {
// //             alert("Failed to update status");
// //             setOrders(prevOrders); // Revert if API fails
// //         }
// //     };

// //     // --- 4. FILTERING LOGIC ---
// //     const filteredOrders = orders.filter(order => {
// //         if (activeFilter === "pending") return order.status === "pending";
// //         // 'preparing' tab shows both accepted and preparing orders
// //         if (activeFilter === "preparing") return order.status === "accepted" || order.status === "preparing";
// //         if (activeFilter === "ready") return order.status === "ready";
// //         if (activeFilter === "history") return ["out_for_delivery", "delivered", "cancelled"].includes(order.status);
// //         return true;
// //     });

// //     return (
// //         <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">

// //             {/* --- HEADER & TABS --- */}
// //             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //                 <div>
// //                     <h2 className="text-2xl font-black text-slate-800">Live Orders</h2>
// //                     <p className="text-slate-400 text-sm font-medium">Manage your kitchen flow</p>
// //                 </div>

// //                 {/* Status Tabs */}
// //                 <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm overflow-x-auto">
// //                     {["pending", "preparing", "ready", "history"].map(tab => {
// //                         // Calculate count for badges
// //                         const count = orders.filter(o => {
// //                             if (tab === 'pending') return o.status === 'pending';
// //                             if (tab === 'preparing') return ['accepted', 'preparing'].includes(o.status);
// //                             if (tab === 'ready') return o.status === 'ready';
// //                             return ['out_for_delivery', 'delivered', 'cancelled'].includes(o.status);
// //                         }).length;

// //                         return (
// //                             <button
// //                                 key={tab}
// //                                 onClick={() => setActiveFilter(tab)}
// //                                 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === tab
// //                                     ? "bg-stone-900 text-white shadow-md"
// //                                     : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
// //                                     }`}
// //                             >
// //                                 {tab === "history" ? "Past Orders" : tab}
// //                                 {count > 0 && (
// //                                     <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === tab ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
// //                                         }`}>
// //                                         {count}
// //                                     </span>
// //                                 )}
// //                             </button>
// //                         );
// //                     })}
// //                 </div>
// //             </div>

// //             {/* --- ORDERS GRID --- */}
// //             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
// //                 <AnimatePresence mode="popLayout">
// //                     {filteredOrders.length === 0 ? (
// //                         <div className="col-span-full py-20 text-center opacity-50 flex flex-col items-center">
// //                             <ShoppingBag size={48} className="mb-4 text-stone-300" />
// //                             <p className="text-xl font-bold text-stone-400">No orders in {activeFilter}</p>
// //                         </div>
// //                     ) : (
// //                         filteredOrders.map((order) => (
// //                             <OrderCard
// //                                 key={order.id}
// //                                 order={order}
// //                                 onUpdate={updateStatus}
// //                             />
// //                         ))
// //                     )}
// //                 </AnimatePresence>
// //             </div>
// //         </div>
// //     );
// // };

// // // --- SUB-COMPONENT: ORDER CARD ---
// // const OrderCard = ({ order, onUpdate }) => {
// //     // Safely handle items array
// //     const items = order.items || [];

// //     return (
// //         <motion.div
// //             layout
// //             initial={{ opacity: 0, scale: 0.95 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             exit={{ opacity: 0, scale: 0.9 }}
// //             className={`bg-white rounded-3xl p-6 border-2 shadow-sm relative overflow-hidden flex flex-col h-full ${order.status === 'pending' ? 'border-orange-100 shadow-orange-100' : 'border-stone-100'
// //                 }`}
// //         >
// //             {/* Colored Top Stripe */}
// //             <div className={`absolute top-0 left-0 w-full h-1.5 ${order.status === 'pending' ? 'bg-orange-500' :
// //                 order.status === 'preparing' || order.status === 'accepted' ? 'bg-blue-500' :
// //                     order.status === 'ready' ? 'bg-green-500' : 'bg-stone-300'
// //                 }`} />

// //             {/* Card Header */}
// //             <div className="flex justify-between items-start mb-4">
// //                 <div>
// //                     <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Order #{order.id}</span>
// //                     <h3 className="text-lg font-black text-stone-800 flex items-center gap-2 capitalize">
// //                         {order.status.replace(/_/g, " ")}
// //                     </h3>
// //                     <p className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-1">
// //                         <Clock size={12} /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                     </p>
// //                 </div>
// //                 <div className="bg-stone-50 p-2 rounded-xl text-stone-600 font-bold">
// //                     ₹{order.total_amount}
// //                 </div>
// //             </div>

// //             {/* Items List (Scrollable if too long) */}
// //             <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
// //                 {items.map((item, idx) => (
// //                     <div key={idx} className="flex justify-between items-start text-sm">
// //                         <div className="flex gap-3">
// //                             <span className="bg-stone-100 text-stone-600 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold shrink-0">
// //                                 {item.quantity}x
// //                             </span>
// //                             <div>
// //                                 <p className="font-bold text-stone-700 leading-tight">{item.name}</p>
// //                                 {item.addons && item.addons !== "[]" && (
// //                                     <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
// //                                         {/* Handle addon display safely */}
// //                                         {typeof item.addons === 'string' ? JSON.parse(item.addons).map(a => a.name).join(", ") : item.addons}
// //                                     </p>
// //                                 )}
// //                             </div>
// //                         </div>
// //                         <span className="font-medium text-stone-500">₹{item.price * item.quantity}</span>
// //                     </div>
// //                 ))}
// //             </div>

// //             {/* Action Buttons */}
// //             <div className="mt-auto pt-4 border-t border-dashed border-stone-200">

// //                 {/* Rider Info (If assigned) */}
// //                 {order.rider_name && (
// //                     <div className="mb-4 bg-purple-50 p-3 rounded-xl flex items-center gap-3">
// //                         <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Bike size={16} /></div>
// //                         <div>
// //                             <p className="text-[10px] uppercase font-bold text-purple-400">Delivery Partner</p>
// //                             <p className="text-xs font-bold text-purple-900">{order.rider_name}</p>
// //                         </div>
// //                     </div>
// //                 )}

// //                 {/* --- STATE MACHINE BUTTONS --- */}

// //                 {/* 1. PENDING -> ACCEPT */}
// //                 {order.status === 'pending' && (
// //                     <button
// //                         onClick={() => onUpdate(order.id, "accepted")}
// //                         className="w-full py-3 bg-stone-900 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
// //                     >
// //                         <ChefHat size={18} /> Accept Order
// //                     </button>
// //                 )}

// //                 {/* 2. ACCEPTED -> READY (Triggers Rider Search) */}
// //                 {(order.status === 'accepted' || order.status === 'preparing') && (
// //                     <button
// //                         onClick={() => onUpdate(order.id, "ready")}
// //                         className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
// //                     >
// //                         <CheckCircle size={18} /> Mark Ready
// //                     </button>
// //                 )}

// //                 {/* 3. READY -> WAITING (Read-only) */}
// //                 {order.status === 'ready' && (
// //                     <div className="w-full py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse">
// //                         <Bike size={18} /> Waiting for Rider...
// //                     </div>
// //                 )}

// //                 {/* 4. OUT FOR DELIVERY (Read-only) */}
// //                 {order.status === 'out_for_delivery' && (
// //                     <div className="w-full py-3 bg-stone-50 text-stone-400 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
// //                         Picked up by Rider
// //                     </div>
// //                 )}
// //                 {order.status === 'delivered' && (
// //                     <div className="w-full py-3 bg-stone-50 text-green-600 rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
// //                         Delivered Successfully
// //                     </div>
// //                 )}
// //             </div>
// //         </motion.div>
// //     );
// // };

// // export default RestaurantOrders;





// import React, { useState, useEffect } from "react";
// import {
//     ChefHat, Clock, CheckCircle, MapPin, User, Bike, Package, ClipboardList
// } from "lucide-react";
// import api from "../../services/api";

// const RestaurantOrders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchOrders = async () => {
//         try {
//             const res = await api.get("/api/restaurant/orders");
//             setOrders(res.data);
//             setLoading(false);
//         } catch (err) {
//             console.error(err);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchOrders();
//         const interval = setInterval(fetchOrders, 10000);
//         return () => clearInterval(interval);
//     }, []);

//     const updateStatus = async (orderId, newStatus) => {
//         const prevOrders = [...orders];
//         setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
//         try {
//             await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
//             fetchOrders();
//         } catch (err) {
//             alert("Update failed");
//             setOrders(prevOrders);
//         }
//     };

//     // Filter active orders
//     const activeOrders = orders.filter(o =>
//         ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)
//     );

//     return (
//         <div className="max-w-7xl mx-auto p-6 font-sans bg-slate-50 min-h-screen">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6 gap-4">
//                 <div>
//                     <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
//                         <ClipboardList className="text-orange-500" size={32} />
//                         Kitchen Display
//                     </h1>
//                     <p className="text-slate-500 font-medium mt-1 ml-11">
//                         {activeOrders.length} Active Orders
//                     </p>
//                 </div>
//             </div>

//             {/* Orders List */}
//             <div className="space-y-4">
//                 {activeOrders.map((order) => (
//                     <div
//                         key={order.id}
//                         className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-md ${order.status === 'pending' ? 'border-l-8 border-l-orange-500' :
//                                 order.status === 'ready' ? 'border-l-8 border-l-green-500' : 'border-l-8 border-l-blue-500'
//                             }`}
//                     >
//                         {/* 1. ORDER META (Left) */}
//                         <div className="p-5 lg:w-[220px] bg-slate-50/50 border-r border-slate-100 flex flex-col justify-between shrink-0">
//                             <div>
//                                 <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
//                                     ID #{order.id}
//                                 </span>
//                                 <div className="flex items-center gap-2 mb-1">
//                                     <Clock size={14} className="text-slate-400" />
//                                     <span className="text-sm font-bold text-slate-700">
//                                         {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 mb-4">
//                                     <User size={14} className="text-slate-400" />
//                                     <span className="text-sm font-bold text-slate-700 truncate">
//                                         {order.customer_name}
//                                     </span>
//                                 </div>
//                             </div>

//                             <div>
//                                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Status</p>
//                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
//                                         order.status === 'ready' ? 'bg-green-100 text-green-700' :
//                                             'bg-blue-100 text-blue-700'
//                                     }`}>
//                                     {order.status.replace("_", " ")}
//                                 </span>
//                             </div>
//                         </div>

//                         {/* 2. ITEMS & ADDRESS (Middle - Expands) */}
//                         <div className="p-5 flex-1 flex flex-col lg:flex-row gap-6">

//                             {/* Items List */}
//                             <div className="flex-1">
//                                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
//                                     Order Items <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{order.items.length}</span>
//                                 </h3>
//                                 <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
//                                     {order.items.map((item, idx) => {
//                                         // Parse addons safely
//                                         let addons = [];
//                                         try { addons = typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons; } catch (e) { }

//                                         return (
//                                             <div key={idx} className="flex items-start gap-3 text-sm border-b border-dashed border-slate-100 last:border-0 pb-2 last:pb-0">
//                                                 <span className="font-bold text-slate-900 bg-slate-100 px-2 rounded min-w-[2rem] text-center">
//                                                     {item.quantity}x
//                                                 </span>
//                                                 <div>
//                                                     <p className="font-bold text-slate-700 leading-tight">{item.name}</p>
//                                                     {addons && addons.length > 0 && (
//                                                         <div className="flex flex-wrap gap-1 mt-1">
//                                                             {addons.map((addon, aIdx) => (
//                                                                 <span key={aIdx} className="text-[10px] text-slate-500 bg-slate-50 px-1.5 rounded border border-slate-100">
//                                                                     + {addon.name}
//                                                                 </span>
//                                                             ))}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>

//                             {/* Address Section */}
//                             <div className="lg:w-[280px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
//                                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
//                                     Delivery Details
//                                 </h3>
//                                 <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
//                                     <div className="flex items-start gap-2">
//                                         <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
//                                         <div>
//                                             <p className="text-xs font-bold text-slate-800 leading-relaxed">
//                                                 {order.delivery_address || "No address provided"}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 {order.rider_name && (
//                                     <div className="mt-3 flex items-center gap-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
//                                         <Bike size={14} className="text-purple-600" />
//                                         <span className="text-xs font-bold text-purple-900">
//                                             Rider: {order.rider_name}
//                                         </span>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* 3. ACTIONS (Right) */}
//                         <div className="p-5 lg:w-[200px] bg-slate-50/50 border-l border-slate-100 flex flex-col justify-center items-center gap-3">
//                             <div className="text-center w-full border-b border-slate-200 pb-3 mb-1">
//                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bill</p>
//                                 <p className="text-2xl font-black text-slate-900">₹{order.total_amount}</p>
//                             </div>

//                             {/* Buttons */}
//                             {order.status === 'pending' && (
//                                 <button
//                                     onClick={() => updateStatus(order.id, "accepted")}
//                                     className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
//                                 >
//                                     <ChefHat size={16} /> Accept
//                                 </button>
//                             )}

//                             {(order.status === 'accepted' || order.status === 'preparing') && (
//                                 <button
//                                     onClick={() => updateStatus(order.id, "ready")}
//                                     className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
//                                 >
//                                     <CheckCircle size={16} /> Mark Ready
//                                 </button>
//                             )}

//                             {order.status === 'ready' && (
//                                 <div className="w-full py-3 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200 flex items-center justify-center gap-2 animate-pulse">
//                                     <Bike size={16} /> Waiting
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 ))}

//                 {activeOrders.length === 0 && (
//                     <div className="text-center py-20 opacity-40">
//                         <Package size={48} className="mx-auto mb-4 text-slate-300" />
//                         <p className="text-lg font-bold text-slate-400">Kitchen is clear</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RestaurantOrders;


import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChefHat, Clock, CheckCircle, Bike, ShoppingBag,
    MapPin, ClipboardList
} from "lucide-react";
import api from "../../services/api";

const RestaurantOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("pending");

    const fetchOrders = async () => {
        try {
            const res = await api.get("/api/restaurant/orders");
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch orders", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        const prevOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            alert("Update failed");
            setOrders(prevOrders);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeFilter === "pending") return order.status === "pending";
        if (activeFilter === "preparing") return ["accepted", "preparing"].includes(order.status);
        if (activeFilter === "ready") return order.status === "ready";
        if (activeFilter === "history") return ["out_for_delivery", "delivered", "cancelled"].includes(order.status);
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="text-orange-500" size={32} />
                        Kitchen Display
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 ml-11">Manage incoming orders flow</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    {["pending", "preparing", "ready", "history"].map(tab => {
                        const count = orders.filter(o => {
                            if (tab === 'pending') return o.status === 'pending';
                            if (tab === 'preparing') return ['accepted', 'preparing'].includes(o.status);
                            if (tab === 'ready') return o.status === 'ready';
                            return ['out_for_delivery', 'delivered', 'cancelled'].includes(o.status);
                        }).length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${activeFilter === tab ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {tab === "history" ? "Past Orders" : tab}
                                {count > 0 && tab !== 'history' && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeFilter === tab ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full py-24 text-center opacity-50 flex flex-col items-center">
                            <ShoppingBag size={64} className="mb-4 text-slate-300" />
                            <p className="text-xl font-bold text-slate-400">No {activeFilter} orders</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const OrderCard = ({ order, onUpdate }) => {
    const items = order.items || [];
    const getStatusColor = () => {
        if (order.status === 'pending') return 'orange';
        if (['accepted', 'preparing'].includes(order.status)) return 'blue';
        if (order.status === 'ready') return 'green';
        return 'slate';
    };

    const color = getStatusColor();
    const borderClass = { orange: 'border-orange-100', blue: 'border-blue-100', green: 'border-green-100', slate: 'border-slate-200' }[color];
    const bgClass = { orange: 'bg-orange-500', blue: 'bg-blue-600', green: 'bg-green-500', slate: 'bg-slate-300' }[color];

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-2xl p-0 border-2 shadow-sm relative overflow-hidden flex flex-col h-full ${borderClass}`}>
            <div className={`w-full h-1.5 ${bgClass}`} />
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{order.id}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <span className="font-black text-slate-700">₹{order.total_amount}</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm group">
                            <div className="flex gap-3">
                                <span className="bg-slate-100 text-slate-600 w-6 h-6 flex items-center justify-center rounded text-xs font-bold shrink-0">{item.quantity}x</span>
                                <p className="font-bold text-slate-700 leading-tight">{item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 pt-4 border-t border-dashed border-slate-100">
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500 line-clamp-2">{order.delivery_address || "No address provided"}</p>
                    </div>
                </div>

                <div className="mt-auto">
                    {order.rider_name && (
                        <div className="mb-3 bg-purple-50 p-2.5 rounded-lg flex items-center gap-3 border border-purple-100">
                            <Bike size={14} className="text-purple-600" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-purple-400 leading-none mb-0.5">Rider Assigned</p>
                                <p className="text-xs font-bold text-purple-900 leading-none">{order.rider_name}</p>
                            </div>
                        </div>
                    )}

                    {/* --- THE FIX IS HERE --- */}
                    {order.status === 'pending' && (
                        <button
                            onClick={() => onUpdate(order.id, "preparing")}
                            className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ChefHat size={18} /> Accept Order
                        </button>
                    )}

                    {['accepted', 'preparing'].includes(order.status) && (
                        <button
                            onClick={() => onUpdate(order.id, "ready")}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} /> Mark Ready
                        </button>
                    )}

                    {order.status === 'ready' && (
                        <div className="w-full py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center justify-center gap-2 animate-pulse">
                            <Bike size={18} /> Waiting for Rider
                        </div>
                    )}
                    {/* ... other states (out_for_delivery, delivered) ... */}
                </div>
            </div>
        </motion.div>
    );
};

export default RestaurantOrders;