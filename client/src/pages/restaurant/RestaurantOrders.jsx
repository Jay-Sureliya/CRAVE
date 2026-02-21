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