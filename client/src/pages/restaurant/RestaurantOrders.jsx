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
            // FIX: Added 'rejected' and 'completed' to ensure all past orders show up
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
        <div>
            {/* --- FILTER TABS --- */}
            <div className="flex mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
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
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeFilter === tab 
                                    ? "bg-black text-white shadow-md" 
                                    : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            {tab === "history" ? "History" : tab}
                            {count > 0 && tab !== 'history' && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeFilter === tab ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* --- ORDERS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <div className="col-span-full py-24 text-center opacity-50 flex flex-col items-center">
                            <ShoppingBag size={64} className="mb-4 text-slate-300" />
                            <p className="text-xl font-bold text-slate-400">
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
        if (['delivered', 'completed'].includes(order.status)) return 'emerald'; // Distinct green for delivered
        if (['cancelled', 'rejected'].includes(order.status)) return 'red';
        return 'slate'; // Default for out_for_delivery
    };

    const color = getStatusColor();
    
    // Dynamic Styles based on status
    const borderClass = { 
        orange: 'border-orange-500', 
        blue: 'border-blue-500', 
        green: 'border-green-500', 
        emerald: 'border-emerald-200 bg-emerald-50/10', // Softer for history
        red: 'border-red-200 bg-red-50/10', // Softer for history
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
            className={`bg-white rounded-3xl border-2 shadow-sm relative overflow-hidden flex flex-col ${borderClass}`}
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <div>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider">#{order.id}</span>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400">
                        <Clock size={14} /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    <span className="text-xl font-black text-slate-900">₹{order.total_amount}</span>
                </div>
            </div>

            {/* Items List */}
            <div className="p-6 flex-1">
                <div className="space-y-4 mb-6">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                            <div className="flex gap-3">
                                <span className="font-black text-slate-900 bg-white border border-slate-200 w-6 h-6 flex items-center justify-center rounded-md text-xs shrink-0">
                                    {item.quantity}x
                                </span>
                                <div>
                                    <span className="font-bold text-slate-700 block leading-tight">{item.name}</span>
                                    {parseAddons(item.addons).length > 0 && (
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                            {parseAddons(item.addons).map((addon, aIdx) => (
                                                <span key={aIdx} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
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
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 mb-2 shadow-sm">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{order.delivery_address}</p>
                    </div>
                )}
                
                {/* Rider Info */}
                {order.rider_name && (
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 flex items-center gap-3 text-purple-700 mt-2">
                        <Bike size={16} /> <span className="text-xs font-bold">Rider: {order.rider_name}</span>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                {/* 1. PENDING -> PREPARING */}
                {order.status === 'pending' && (
                    <div className="flex gap-3">
                         {/* Cancel Button */}
                         <button className="px-4 py-3.5 bg-white border border-slate-200 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-colors">
                            <XCircle size={20} />
                        </button>
                        {/* Accept Button */}
                        <button onClick={() => onUpdate(order.id, "preparing")} className="flex-1 py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                            <ChefHat size={18} /> Accept Order
                        </button>
                    </div>
                )}

                {/* 2. PREPARING -> READY */}
                {['accepted', 'preparing'].includes(order.status) && (
                    <button onClick={() => onUpdate(order.id, "ready")} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                        <CheckCircle size={18} /> Mark Ready
                    </button>
                )}

                {/* 3. READY -> WAITING */}
                {order.status === 'ready' && (
                    <div className="w-full py-3.5 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 animate-pulse cursor-default">
                        <Bike size={18} /> Waiting for Rider
                    </div>
                )}

                {/* 4. HISTORY STATUSES (Fixed: Added visual badges for Delivered/Cancelled/Out) */}
                {order.status === 'out_for_delivery' && (
                    <div className="w-full py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <Bike size={16} /> Out For Delivery
                    </div>
                )}

                {['delivered', 'completed'].includes(order.status) && (
                    <div className="w-full py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckSquare size={16} /> Delivered Successfully
                    </div>
                )}

                {['cancelled', 'rejected'].includes(order.status) && (
                    <div className="w-full py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <XCircle size={16} /> Order Cancelled
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default RestaurantOrders;