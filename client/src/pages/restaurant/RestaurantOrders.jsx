import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, CheckCircle, Bike, ShoppingBag, MapPin, XCircle, CheckSquare } from "lucide-react";
import api from "../../services/api";

const RestaurantOrders = ({ searchQuery }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("pending");
    const updatingOrders = useRef(new Set());

    // --- FETCH DATA ---
    const fetchOrders = async () => {
        try {
            const res = await api.get("/api/restaurant/orders");
            setOrders(currentOrders => {
                return res.data.map(serverOrder => {
                    // Prevent overwriting orders currently being interacted with (optimistic UI protection)
                    if (updatingOrders.current.has(serverOrder.id)) {
                        const localOrder = currentOrders.find(o => o.id === serverOrder.id);
                        return localOrder || serverOrder;
                    }
                    return serverOrder;
                });
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch orders", err);
            setLoading(false);
        }
    };

    // --- AUTO REFRESH (3 Seconds) ---
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    // --- UPDATE STATUS ---
    const updateStatus = async (orderId, newStatus) => {
        updatingOrders.current.add(orderId);
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        
        try {
            await api.put(`/api/orders/${orderId}/status?status=${newStatus}`, { status: newStatus });
        } catch (err) {
            console.error("Update failed", err);
            fetchOrders(); // Revert on failure
        } finally {
            setTimeout(() => updatingOrders.current.delete(orderId), 3000);
        }
    };

    // --- FILTER LOGIC ---
    const filteredOrders = orders.filter(order => {
        // 1. Status Filter
        let statusMatch = false;
        if (activeFilter === "pending") {
            statusMatch = order.status === "pending";
        } else if (activeFilter === "preparing") {
            statusMatch = ["accepted", "preparing"].includes(order.status);
        } else if (activeFilter === "ready") {
            statusMatch = order.status === "ready";
        } else if (activeFilter === "history") {
            statusMatch = ["out_for_delivery", "delivered", "cancelled", "rejected", "completed"].includes(order.status);
        }
        
        // 2. Search Filter (ID or Customer Name)
        const searchLower = searchQuery?.toLowerCase() || "";
        const searchMatch = 
            order.id.toString().includes(searchLower) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchLower));

        return statusMatch && searchMatch;
    });

    return (
        <div className="w-full">
            {/* --- FILTER TABS --- */}
            {/* Added relative wrapper for mobile scrolling */}
            <div className="relative mb-6 sm:mb-8">
                {/* Horizontal scrolling wrapper, hides scrollbar */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar snap-x">
                    {["pending", "preparing", "ready", "history"].map(tab => {
                        // Count logic for badges
                        const count = orders.filter(o => {
                            if (tab === 'pending') return o.status === 'pending';
                            if (tab === 'preparing') return ['accepted', 'preparing'].includes(o.status);
                            if (tab === 'ready') return o.status === 'ready';
                            return ["out_for_delivery", "delivered", "cancelled", "rejected", "completed"].includes(o.status);
                        }).length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap snap-start flex-1 sm:flex-none ${
                                    activeFilter === tab 
                                        ? "bg-black text-white shadow-md" 
                                        : "text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                                {tab === "history" ? "History" : tab}
                                {count > 0 && tab !== 'history' && (
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] ${activeFilter === tab ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- ORDERS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full py-16 sm:py-24 text-center opacity-50 flex flex-col items-center px-4">
                            <ShoppingBag size={48} className="mb-4 text-slate-300 sm:w-16 sm:h-16" />
                            <p className="text-lg sm:text-xl font-bold text-slate-400">
                                {searchQuery ? `No orders found for "${searchQuery}"` : `No ${activeFilter} orders`}
                            </p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

// --- ORDER CARD COMPONENT ---
const OrderCard = ({ order, onUpdate }) => {
    const items = order.items || [];
    
    // Status Color Helper
    const getStatusColor = () => {
        if (order.status === 'pending') return 'orange';
        if (['accepted', 'preparing'].includes(order.status)) return 'blue';
        if (order.status === 'ready') return 'green';
        if (['delivered', 'completed'].includes(order.status)) return 'emerald'; 
        if (['cancelled', 'rejected'].includes(order.status)) return 'red';
        return 'slate'; 
    };

    const color = getStatusColor();
    
    // Dynamic Styles based on status
    const borderClass = { 
        orange: 'border-orange-500', 
        blue: 'border-blue-500', 
        green: 'border-green-500', 
        emerald: 'border-emerald-200 bg-emerald-50/10', 
        red: 'border-red-200 bg-red-50/10', 
        slate: 'border-slate-300 bg-slate-50/50' 
    }[color];

    // Helper to safely parse JSON addons
    const parseAddons = (data) => {
        if (!data || data === "[]") return [];
        try { 
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch { return [data]; }
    };

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className={`bg-white rounded-[1.5rem] sm:rounded-3xl border-2 shadow-sm relative overflow-hidden flex flex-col ${borderClass}`}
        >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div>
                    <span className="bg-slate-100 text-slate-600 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black tracking-wider">#{order.id}</span>
                    <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-bold text-slate-400">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    <span className="text-lg sm:text-xl font-black text-slate-900">₹{order.total_amount}</span>
                </div>
            </div>

            {/* Items List */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 flex-1">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs sm:text-sm">
                            <div className="flex gap-2 sm:gap-3 w-full">
                                <span className="font-black text-slate-900 bg-white border border-slate-200 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md text-[10px] sm:text-xs shrink-0">
                                    {item.quantity}x
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="font-bold text-slate-700 block leading-tight truncate whitespace-normal">{item.name}</span>
                                    {parseAddons(item.addons).length > 0 && (
                                        <div className="mt-1 sm:mt-1.5 flex flex-wrap gap-1">
                                            {parseAddons(item.addons).map((addon, aIdx) => (
                                                <span key={aIdx} className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                                                    {addon}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Addresses */}
                {order.delivery_address && (
                    <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 flex items-start gap-2.5 sm:gap-3 mb-2 shadow-sm mt-auto">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">{order.delivery_address}</p>
                    </div>
                )}
                
                {/* Rider Info */}
                {order.rider_name && (
                    <div className="bg-purple-50 p-3 sm:p-3.5 rounded-xl border border-purple-100 flex items-center gap-2.5 sm:gap-3 text-purple-700 mt-2">
                        <Bike size={14} className="sm:w-4 sm:h-4" /> <span className="text-[11px] sm:text-xs font-bold truncate">Rider: {order.rider_name}</span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50">
                {/* 1. PENDING -> PREPARING */}
                {order.status === 'pending' && (
                    <div className="flex gap-2 sm:gap-3">
                         {/* Cancel Button */}
                         <button className="px-3 sm:px-4 py-3 sm:py-3.5 bg-white border border-slate-200 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-colors shrink-0">
                            <XCircle size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {/* Accept Button */}
                        <button onClick={() => onUpdate(order.id, "preparing")} className="flex-1 py-3 sm:py-3.5 bg-black text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                            <ChefHat size={16} className="sm:w-4.5 sm:h-4.5" /> Accept Order
                        </button>
                    </div>
                )}

                {/* 2. PREPARING -> READY */}
                {['accepted', 'preparing'].includes(order.status) && (
                    <button onClick={() => onUpdate(order.id, "ready")} className="w-full py-3 sm:py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> Mark Ready
                    </button>
                )}

                {/* 3. READY -> WAITING */}
                {order.status === 'ready' && (
                    <div className="w-full py-3 sm:py-3.5 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 animate-pulse cursor-default">
                        <Bike size={16} className="sm:w-[18px] sm:h-[18px]" /> Waiting for Rider
                    </div>
                )}

                {/* 4. HISTORY STATUSES */}
                {order.status === 'out_for_delivery' && (
                    <div className="w-full py-2.5 sm:py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <Bike size={14} className="sm:w-4 sm:h-4" /> Out For Delivery
                    </div>
                )}

                {['delivered', 'completed'].includes(order.status) && (
                    <div className="w-full py-2.5 sm:py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckSquare size={14} className="sm:w-4 sm:h-4" /> Delivered Successfully
                    </div>
                )}

                {['cancelled', 'rejected'].includes(order.status) && (
                    <div className="w-full py-2.5 sm:py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <XCircle size={14} className="sm:w-4 sm:h-4" /> Order Cancelled
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RestaurantOrders;