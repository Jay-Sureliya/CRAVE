import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Package, X, User, Mail, Phone, AtSign, MapPin,
    Navigation2, Store, CheckCircle, PhoneCall, Wallet,
    ShieldCheck, CheckSquare, Zap, Clock, Route, Star,
    Power, ArrowRight, Activity
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/useToast';

// --- SMART GEOCODER ---
const geocodeAddress = async (address) => {
    if (!address) return [22.3039, 70.8022];
    try {
        let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        let data = await res.json();
        if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];

        const cleaned = address.replace(/[0-9]/g, '').trim();
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&limit=1`);
        data = await res.json();
        if (data && data.length > 0) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (e) { }

    let hash = 0;
    for (let i = 0; i < address.length; i++) hash = address.charCodeAt(i) + ((hash << 5) - hash);
    return [22.3039 + ((hash % 100) / 2500), 70.8022 + (((hash >> 2) % 100) / 2500)];
};

const RiderDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isOnline, setIsOnline] = useState(false);
    const [stats, setStats] = useState({ earnings: 0, trips: 0, message: null, rating: 0 });
    const [activeOrder, setActiveOrder] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [arrived, setArrived] = useState(false);

    const [riderProfile, setRiderProfile] = useState({ username: '', name: '', email: '', phone: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', full_name: '', email: '', phone: '' });
    const [isSaving, setIsSaving] = useState(false);

    const watchIdRef = useRef(null);
    const simulationIntervalRef = useRef(null);

    const canTrackLocation = activeOrder && activeOrder.status === 'out_for_delivery';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get("/api/rider/stats");
                setIsOnline(res.data.is_online);
                setStats({
                    earnings: res.data.total_earnings || 0, trips: res.data.total_trips || 0,
                    message: res.data.message || null, rating: res.data.rating || 0
                });
                if (res.data.active_order) setActiveOrder(res.data.active_order);
                setRiderProfile({
                    username: res.data.username || 'rider', name: res.data.name || 'Rider Profile',
                    email: res.data.email || 'rider@example.com', phone: res.data.phone || ''
                });
            } catch (err) { }
            finally { setIsInitializing(false); }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (!isOnline) return;
        const syncData = async () => {
            try {
                const res = await api.get("/api/rider/stats");
                const backendOrder = res.data.active_order;
                setStats(prev => ({ ...prev, message: res.data.message || null, rating: res.data.rating || prev.rating }));

                if (backendOrder) {
                    if (!activeOrder || backendOrder.status !== activeOrder.status || backendOrder.id !== activeOrder.id) {
                        setActiveOrder(backendOrder);
                    }
                } else {
                    setActiveOrder(null); setArrived(false); setIsSimulating(false);
                    const availableRes = await api.get("/api/rider/orders/available");
                    setAvailableOrders(availableRes.data);
                }
            } catch (e) { }
        };
        syncData();
        const interval = setInterval(syncData, 4000);
        return () => clearInterval(interval);
    }, [isOnline, activeOrder?.status]);

    /* ================= AUTOMATIC DYNAMIC SIMULATOR ================= */
    useEffect(() => {
        if (canTrackLocation && !isSimulating && !arrived) {
            const startAutoDrive = async () => {
                setIsSimulating(true);
                setArrived(false);

                const startLoc = await geocodeAddress(activeOrder.restaurant_address);
                const endLoc = await geocodeAddress(activeOrder.delivery_address);

                try {
                    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLoc[1]},${startLoc[0]};${endLoc[1]},${endLoc[0]}?overview=full&geometries=geojson`);
                    const data = await response.json();

                    if (data.routes && data.routes.length > 0) {
                        const coords = data.routes[0].geometry.coordinates;
                        const totalDuration = 20000;
                        const intervalTime = 500;
                        const totalSteps = totalDuration / intervalTime;
                        let currentStep = 0;

                        simulationIntervalRef.current = setInterval(async () => {
                            if (currentStep >= totalSteps) {
                                clearInterval(simulationIntervalRef.current);
                                setArrived(true);
                                setIsSimulating(false);
                                return;
                            }

                            const progress = currentStep / totalSteps;
                            const index = Math.floor(progress * (coords.length - 1));

                            try { await api.post(`/api/orders/${activeOrder.id}/location`, { lat: coords[index][1], lng: coords[index][0] }); } catch (e) { }
                            currentStep++;
                        }, intervalTime);
                    }
                } catch (err) {
                    setIsSimulating(false);
                }
            };

            startAutoDrive();
        }

        return () => {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        };
    }, [activeOrder?.status]);

    // --- Handlers ---
    const toggleOnline = async () => {
        const newState = !isOnline; setIsOnline(newState);
        try { await api.post("/api/rider/status", { is_online: newState }); } catch (err) { setIsOnline(!newState); }
    };
    const handleAccept = async (order) => {
        setIsProcessing(true);
        try { await api.post(`/api/rider/orders/${order.id}/accept`); setActiveOrder({ ...order, status: 'accepted' }); setAvailableOrders([]); }
        catch (e) { } finally { setIsProcessing(false); }
    };
    const handlePickup = async () => {
        setIsProcessing(true);
        try { await api.post(`/api/rider/orders/${activeOrder.id}/pickup`); setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' })); }
        catch (e) { } finally { setIsProcessing(false); }
    };
    const handleComplete = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);
            setStats(prev => ({ ...prev, earnings: res.data.total_earnings, trips: prev.trips + 1, message: null }));
            addToast(`Job Done! Earned ₹${res.data.earned}`, "success");
            setActiveOrder(null); setIsSimulating(false); setArrived(false);
        } catch (e) { } finally { setIsProcessing(false); }
    };
    const handleSaveProfile = async (e) => {
        e.preventDefault(); setIsSaving(true);
        try {
            const res = await api.put("/api/rider/profile", editForm);
            setRiderProfile({ username: res.data.username, name: res.data.name, email: res.data.email, phone: res.data.phone });
            setIsEditing(false);
        } catch (err) {
            setRiderProfile({ username: editForm.username, name: editForm.full_name, email: editForm.email, phone: editForm.phone });
            setIsEditing(false);
        } finally { setIsSaving(false); }
    };
    const handleLogout = () => {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        localStorage.clear(); sessionStorage.clear(); navigate('/login');
    };

    if (isInitializing) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
        </div>
    );

    return (
        <div className="h-[100dvh] w-full bg-[#F3F4F6] flex flex-col relative overflow-hidden font-sans text-gray-900 pb-24">
            
            {/* ================= FLOATING HEADER ================= */}
            <header className="px-4 pt-6 shrink-0 relative z-20 max-w-xl mx-auto w-full">
                <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer pl-1 group" onClick={() => setIsEditing(true)}>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xl group-active:scale-95 transition-transform">
                            {riderProfile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-base font-black leading-tight text-gray-900">{riderProfile.name}</h2>
                            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Manage Profile</p>
                        </div>
                    </div>

                    <button 
                        onClick={toggleOnline}
                        className={`relative w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 mr-1 ${isOnline ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <motion.div 
                            layout 
                            className="bg-white w-6 h-6 rounded-full shadow-md"
                            animate={{ x: isOnline ? 32 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </header>

            {/* ================= UNIFIED STATS BLOCK ================= */}
            <div className="max-w-xl mx-auto w-full px-4 pt-4 shrink-0 relative z-10">
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex justify-between items-center divide-x divide-gray-100">
                    <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Wallet size={12}/> Earned</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{stats.earnings.toFixed(0)}</h3>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Route size={12}/> Trips</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.trips}</h3>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Star size={12}/> Rating</p>
                        <h3 className="text-2xl font-black text-blue-600">
                            {stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* ================= MAIN SCROLLABLE AREA ================= */}
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full max-w-xl mx-auto px-4 pt-4 flex flex-col">
                
                {/* --- OFFLINE STATE --- */}
                {!isOnline && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6 border-8 border-gray-100">
                            <Power size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Currently Offline</h3>
                        <p className="text-gray-500 text-sm font-medium mb-10 max-w-[260px]">
                            You are not visible to restaurants. Go online to start making deliveries.
                        </p>
                        <button onClick={toggleOnline} className="w-full max-w-[280px] py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-lg tracking-wide">
                            START SHIFT
                        </button>
                    </motion.div>
                )}

                {/* --- ONLINE, SEARCHING STATE --- */}
                {isOnline && !activeOrder && availableOrders.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                            <div className="absolute inset-0 border-[4px] border-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                            <div className="absolute inset-6 border-[4px] border-blue-500/40 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
                            <div className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/40">
                                <Activity size={28} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Finding Orders</h3>
                        <p className="text-gray-500 text-sm font-medium max-w-[250px]">Waiting for restaurants to prepare nearby orders...</p>
                    </motion.div>
                )}

                {/* --- AVAILABLE ORDERS (CARD VIEW) --- */}
                {isOnline && !activeOrder && availableOrders.length > 0 && (
                    <div className="space-y-4 pb-6">
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                            <h3 className="font-bold text-gray-500 text-sm">New Requests Nearby</h3>
                        </div>

                        {availableOrders.map(order => {
                            const payout = ((order.total || order.total_amount || 0) * 0.10).toFixed(0);

                            return (
                                <motion.div 
                                    key={order.id} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2rem] p-5 shadow-sm border-l-[6px] border-blue-600 flex flex-col relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order ID</p>
                                            <p className="font-black text-gray-800">#{order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Est. Payout</p>
                                            <h2 className="text-3xl font-black text-gray-900">₹{payout}</h2>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5"><Store size={18} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup From</p>
                                                <h3 className="font-bold text-gray-900">{order.restaurant_name}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1">{order.restaurant_address}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="mt-0.5"><MapPin size={18} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver To</p>
                                                <h3 className="font-bold text-gray-900">Customer</h3>
                                                <p className="text-xs text-gray-500 line-clamp-1">{order.delivery_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleAccept(order)} 
                                        disabled={isProcessing} 
                                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg active:scale-95 transition-all shadow-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        Accept Delivery <ArrowRight size={20} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* --- ACTIVE ORDER VIEW (Bottom Sheet Style) --- */}
                {activeOrder && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-end relative h-full">
                        
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col mb-4">
                            
                            {/* Payout Banner */}
                            <div className="bg-gray-900 px-6 py-5 flex justify-between items-center border-b border-gray-800">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Order #{activeOrder.id}</p>
                                    <h3 className="font-black text-white text-lg">Expected Payout</h3>
                                </div>
                                <h2 className="text-3xl font-black text-lime-400">₹{((activeOrder.total || activeOrder.total_amount || 0) * 0.10).toFixed(0)}</h2>
                            </div>

                            {/* Status Alert */}
                            {activeOrder.status === 'out_for_delivery' && (
                                <div className={`mx-5 mt-5 p-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all text-center ${arrived ? 'bg-green-50 text-green-600 border-green-200' : 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'}`}>
                                    {arrived ? '📍 Arrived at Destination' : '🚗 Navigating to Customer...'}
                                </div>
                            )}

                            {/* Scrollable Details */}
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                {/* Route */}
                                <div className="relative pl-3">
                                    <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gray-200 border-dashed border-l-2"></div>
                                    
                                    <div className="flex items-start gap-4 mb-6 relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-[3px] border-white ${activeOrder.status !== 'out_for_delivery' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                                            <Store size={16} />
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</p>
                                            <h3 className={`font-black leading-tight ${activeOrder.status !== 'out_for_delivery' ? 'text-gray-900 text-lg' : 'text-gray-400 line-through'}`}>{activeOrder.restaurant_name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activeOrder.restaurant_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 relative">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-[3px] border-white ${activeOrder.status === 'out_for_delivery' ? 'bg-lime-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                                            <MapPin size={16} />
                                        </div>
                                        <div className="pt-0.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Dropoff</p>
                                            <h3 className={`font-black leading-tight ${activeOrder.status === 'out_for_delivery' ? 'text-gray-900 text-lg' : 'text-gray-400'}`}>Customer</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activeOrder.delivery_address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Checklist */}
                                <div className="mt-6 border-t border-gray-100 pt-5">
                                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={14}/> Items to Deliver</h4>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        {activeOrder.items && activeOrder.items.length > 0 ? (
                                            activeOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-3 text-sm items-start">
                                                    <span className="font-black text-gray-900">{item.qty}x</span>
                                                    <span className="font-bold text-gray-600">{item.name}</span>
                                                </div>
                                            ))
                                        ) : (<p className="text-xs text-gray-500 italic">Syncing items...</p>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ================= STICKY ACTION BAR FOR ACTIVE ORDER ================= */}
            <AnimatePresence>
                {activeOrder && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 max-w-xl mx-auto"
                    >
                        {/* Customer Contact Icons (Only show if driving to customer) */}
                        {activeOrder.status === 'out_for_delivery' && activeOrder.rider_info && (
                             <div className="flex gap-3 mb-3">
                                <button className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-[1.2rem] flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all"><MessageSquare size={18} /> Chat</button>
                                <a href={`tel:${activeOrder.rider_info.phone}`} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-[1.2rem] flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all"><PhoneCall size={18} /> Call</a>
                             </div>
                        )}

                        {activeOrder.status !== 'out_for_delivery' ? (
                            <button 
                                onClick={handlePickup} 
                                disabled={activeOrder.status !== 'ready' || isProcessing} 
                                className={`w-full py-4.5 rounded-[1.2rem] font-black text-lg tracking-wide transition-all shadow-md flex justify-center items-center gap-2 ${activeOrder.status === 'ready' ? 'bg-blue-600 text-white active:scale-95 py-4' : 'bg-gray-100 text-gray-400 py-4 cursor-not-allowed'}`}
                            >
                                {activeOrder.status === 'ready' ? <><CheckCircle size={22}/> Confirm Pickup</> : 'Waiting for Restaurant...'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleComplete} 
                                disabled={isProcessing} 
                                className="w-full py-4 bg-gray-900 text-white rounded-[1.2rem] font-black text-lg tracking-wide shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2"
                            >
                                <ShieldCheck size={22} className="text-lime-400" /> Complete Delivery
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= PROFILE SETTINGS MODAL ================= */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-black text-gray-900">Settings</h2>
                                <button onClick={() => setIsEditing(false)} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm transition-colors"><X size={18} /></button>
                            </div>
                            
                            <div className="p-6">
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400" placeholder="Username" />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" required value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400" placeholder="Full Name" />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400" placeholder="Email Address" />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all placeholder-gray-400" placeholder="Phone Number" />
                                    </div>
                                    
                                    <div className="pt-4 mt-2">
                                        <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-600/30 active:scale-95 transition-all">
                                            {isSaving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                        <button type="button" onClick={handleLogout} className="w-full py-4 text-red-500 bg-white border border-red-100 hover:bg-red-50 rounded-2xl font-bold mt-3 flex justify-center items-center gap-2 active:scale-95 transition-all">
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RiderDashboard;