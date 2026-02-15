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