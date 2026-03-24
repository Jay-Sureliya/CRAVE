import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Package, ChevronRight, 
    Settings, X, Save, User, Mail, Phone, AtSign, MapPin, 
    Navigation, MessageSquare, Star, Power, Map, Navigation2, Store,
    ChefHat, CheckCircle, PhoneCall
} from 'lucide-react';
import api from '../services/api';

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
            } catch (err) {} 
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
            } catch (e) {}
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
                
                // Fetch dynamic coordinates dynamically exactly like the customer app
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
                            
                            try { await api.post(`/api/orders/${activeOrder.id}/location`, { lat: coords[index][1], lng: coords[index][0] }); } catch(e) {}
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
        catch (e) {} finally { setIsProcessing(false); }
    };
    const handlePickup = async () => {
        setIsProcessing(true);
        try { await api.post(`/api/rider/orders/${activeOrder.id}/pickup`); setActiveOrder(prev => ({ ...prev, status: 'out_for_delivery' })); } 
        catch (e) {} finally { setIsProcessing(false); }
    };
    const handleComplete = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/api/rider/orders/${activeOrder.id}/complete`);
            setStats(prev => ({ ...prev, earnings: res.data.total_earnings, trips: prev.trips + 1, message: null }));
            alert(`Job Done! Earned ₹${res.data.earned}`);
            setActiveOrder(null); setIsSimulating(false); setArrived(false);
        } catch (e) {} finally { setIsProcessing(false); }
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

    if (isInitializing) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-slate-200 rounded-full animate-spin border-t-[#E23744]"></div></div>;

    return (
        <div className="h-screen w-full bg-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-red-100">
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isOnline ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                <div className="absolute inset-0 bg-[#f0f3f5]" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                {isOnline && !activeOrder && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="absolute w-64 h-64 bg-[#E23744]/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute w-32 h-32 bg-[#E23744]/20 rounded-full animate-pulse"></div>
                        <div className="relative w-12 h-12 bg-[#E23744] rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white"><Navigation2 size={24} className="fill-white" /></div>
                    </div>
                )}
            </div>

            <div className="relative z-20 bg-white shadow-sm border-b border-slate-200">
                <div className="flex justify-between items-center px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsEditing(true)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 active:scale-95"><User size={20} className="text-slate-600" /></button>
                        <div><h2 className="text-lg font-black text-slate-800 leading-none">{riderProfile.name}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Duty Profile</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p><p className={`text-sm font-black ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</p></div>
                        <div onClick={toggleOnline} className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div></div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/50 border-t border-slate-100">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Earnings</p><h3 className="text-lg font-black text-emerald-500 mt-1">₹{stats.earnings.toFixed(0)}</h3></div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trips</p><h3 className="text-lg font-black text-slate-800 mt-1">{stats.trips}</h3></div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</p><h3 className="text-lg font-black text-amber-500 mt-1 flex items-center gap-1">{stats.rating > 0 ? stats.rating.toFixed(1) : 'New'} <Star size={12} className="fill-amber-500 text-amber-500" /></h3></div>
                </div>
            </div>

            <div className="relative z-20 mt-auto w-full max-w-md mx-auto">
                {!isOnline && (
                    <div className="bg-white rounded-t-3xl p-6 text-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                        <Power size={28} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-black text-slate-800 mb-2">You are offline</h3>
                        <button onClick={toggleOnline} className="w-full py-4 bg-[#E23744] hover:bg-[#c92f3b] text-white font-bold rounded-xl shadow-lg mt-4">Go Online</button>
                    </div>
                )}
                
                {isOnline && !activeOrder && availableOrders.length === 0 && (
                    <div className="bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center relative"><Map className="text-emerald-600" size={24} /></div>
                        <div><h3 className="font-bold text-slate-800">Finding orders near you...</h3></div>
                    </div>
                )}

                {isOnline && !activeOrder && availableOrders.length > 0 && (
                    <div className="px-4 pb-6 space-y-4">
                        {availableOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#E23744] relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4 mt-2">
                                    <div className="bg-red-50 text-[#E23744] px-3 py-1 rounded-md text-xs font-black uppercase">New Request</div>
                                    <div className="text-right"><p className="text-[10px] font-bold text-slate-400">Est. Earning</p><p className="text-2xl font-black text-slate-900">₹{(order.total * 0.10).toFixed(0)}</p></div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-100">
                                    <div className="flex items-start gap-3 mb-3"><div className="mt-0.5"><Store size={16} className="text-slate-400" /></div><div><p className="text-xs font-bold text-slate-400 uppercase">Pickup From</p><p className="font-bold text-slate-800 leading-tight">{order.restaurant_name}</p></div></div>
                                    <div className="flex items-start gap-3"><div className="mt-0.5"><MapPin size={16} className="text-[#E23744]" /></div><div><p className="text-xs font-bold text-slate-400 uppercase">Deliver To</p><p className="font-bold text-slate-800 leading-tight line-clamp-2">{order.delivery_address}</p></div></div>
                                </div>
                                <button onClick={() => handleAccept(order)} disabled={isProcessing} className="w-full py-4 bg-[#E23744] text-white rounded-xl font-bold text-lg">Accept Order</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeOrder && (
                    <div className="bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="px-6 py-6">
                            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-black text-slate-900">{activeOrder.status === 'out_for_delivery' ? 'Drop at Customer' : 'Pickup from Restaurant'}</h2><span className="font-bold text-slate-400">#{activeOrder.id}</span></div>

                            {activeOrder.status === 'out_for_delivery' && (
                                <div className={`w-full mb-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl border transition-all text-center ${arrived ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-lg shadow-amber-500/30'}`}>
                                    {arrived ? '📍 Arrived at Destination' : '🛵 Driving to Customer (20s)...'}
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Order Details to Pickup</h4>
                                <div className="space-y-2">
                                    {activeOrder.items && activeOrder.items.length > 0 ? (
                                        activeOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm items-center"><span className="font-black text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">{item.qty}x</span><span className="font-bold text-slate-700">{item.name}</span></div>
                                        ))
                                    ) : (<p className="text-xs text-slate-400 italic">Accepting items...</p>)}
                                </div>
                            </div>

                            <div className="relative pl-6 mb-6 border-l-2 border-dashed border-slate-200 ml-3 space-y-5">
                                <div className="relative"><div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-blue-500`}></div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pickup</p><h3 className="font-bold text-slate-900">{activeOrder.restaurant_name}</h3><p className="text-xs text-slate-500 line-clamp-2">{activeOrder.restaurant_address}</p></div>
                                <div className="relative"><div className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-[#E23744]`}></div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Delivery</p><h3 className="font-bold text-slate-900">Customer</h3><p className="text-xs text-slate-500 mt-1 line-clamp-2">{activeOrder.delivery_address}</p></div>
                            </div>

                            {activeOrder.status !== 'out_for_delivery' ? (
                                <button onClick={handlePickup} disabled={activeOrder.status !== 'ready' || isProcessing} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${activeOrder.status === 'ready' ? 'bg-[#E23744] text-white active:scale-95 shadow-red-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                    {activeOrder.status === 'ready' ? 'Confirm Pickup' : 'Waiting for Food...'}
                                </button>
                            ) : (
                                <button onClick={handleComplete} disabled={isProcessing} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 shadow-emerald-500/30">Complete Delivery</button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black text-slate-800">Edit Profile</h2><button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20} /></button></div><form onSubmit={handleSaveProfile} className="space-y-4"><div className="relative"><AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" required value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" /></div><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" required value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" /></div><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" /></div><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="tel" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" /></div><button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg mt-4">{isSaving ? 'Saving...' : 'Save'}</button><button type="button" onClick={handleLogout} className="w-full py-4 text-[#E23744] bg-red-50 rounded-xl font-bold text-sm mt-2 flex justify-center gap-2"><LogOut size={16} /> Logout</button></form></div></div>
            )}
        </div>
    );
};
export default RiderDashboard;