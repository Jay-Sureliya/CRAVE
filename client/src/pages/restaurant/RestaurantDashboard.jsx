import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, LogOut, LayoutDashboard, UtensilsCrossed, ShoppingBag,
    ShieldCheck, X, Save, Edit2, Camera, Home, Bell, Search,
    DollarSign, Star, Activity, ChevronRight, CheckCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import api from "../../services/api";
import RestaurantOrders from "../restaurant/RestaurantOrders";
import RestaurantMenu from "../restaurant/RestaurantMenu";
import { useToast } from "../../context/useToast";

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("restaurantActiveTab") || "overview");
    const [globalSearch, setGlobalSearch] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [showNotifications, setShowNotifications] = useState(false);
    const [pendingOrders, setPendingOrders] = useState([]);
    const knownOrdersRef = useRef(new Set());

    const [userData, setUserData] = useState({
        id: null, username: "", name: "", email: "", address: "",
        role: "restaurant", is_active: true, profile_image: null,
        average_rating: 0, rating_count: 0
    });

    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        rating: "0.0"
    });

    const [chartData, setChartData] = useState([]);

    const [formData, setFormData] = useState({
        username: "", name: "", email: "", address: "",
        password: "", confirmPassword: ""
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        localStorage.setItem("restaurantActiveTab", activeTab);
        setGlobalSearch("");
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            const profileRes = await api.get("/api/restaurant/me");
            const data = profileRes.data;
            if (data.id) sessionStorage.setItem("restaurant_id", data.id);

            setUserData(prev => ({
                ...prev,
                ...data,
                name: data.name || "Restaurant",
                profile_image: data.profile_image
                    ? (data.profile_image.startsWith("data:") ? data.profile_image : `${data.profile_image}?t=${Date.now()}`)
                    : null,
                average_rating: data.average_rating || 0,
                rating_count: data.rating_count || 0
            }));

            const ordersRes = await api.get("/api/restaurant/orders");
            const orders = ordersRes.data || [];

            const currentPending = orders.filter(o => o.status === 'pending');
            const newArrivals = currentPending.filter(o => !knownOrdersRef.current.has(o.id));

            if (newArrivals.length > 0 && knownOrdersRef.current.size > 0) {
                setToastMessage(`🔔 You have ${newArrivals.length} new order(s)!`);
                setTimeout(() => setToastMessage(""), 4000);
            }

            currentPending.forEach(o => knownOrdersRef.current.add(o.id));
            setPendingOrders(currentPending);

            const last30Days = [...Array(30)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }).reverse();

            const aggregatedData = last30Days.map(day => ({ name: day, revenue: 0, orders: 0 }));

            let thirtyDayRevenue = 0;
            let thirtyDayOrders = 0;

            orders.forEach(o => {
                if (o.status === 'cancelled') return;

                const orderDateObj = o.created_at ? new Date(o.created_at) : new Date();
                const orderDay = orderDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const dayIndex = aggregatedData.findIndex(d => d.name === orderDay);
                if (dayIndex !== -1) {
                    aggregatedData[dayIndex].revenue += parseFloat(o.total_amount || 0);
                    aggregatedData[dayIndex].orders += 1;

                    thirtyDayRevenue += parseFloat(o.total_amount || 0);
                    thirtyDayOrders += 1;
                }
            });

            setChartData(aggregatedData);

            // FIX: Safely parse rating so it always shows a number
            const currentRating = data.average_rating !== undefined ? Number(data.average_rating).toFixed(1) : "0.0";

            setStats({
                revenue: thirtyDayRevenue,
                orders: thirtyDayOrders,
                rating: currentRating
            });

        } catch (error) {
            if (error.response?.status === 401) navigate("/login");
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 3000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openEditModal = () => {
        setFormData({
            username: userData.username,
            name: userData.name,
            email: userData.email,
            address: userData.address,
            password: "",
            confirmPassword: ""
        });
        setImagePreview(userData.profile_image);
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return addToast("Passwords do not match!", "error");
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("address", formData.address);
        data.append("username", formData.username);
        if (formData.password) data.append("password", formData.password);
        if (selectedFile) data.append("profile_image", selectedFile);

        try {
            const response = await api.put("/api/restaurant/update", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setUserData(prev => ({
                ...prev,
                ...formData,
                profile_image: response.data.profile_image
            }));

            setIsEditModalOpen(false);
            setToastMessage("Profile updated successfully!");
            setTimeout(() => setToastMessage(""), 3500);
        } catch (error) {
            addToast("Failed to update profile.", "error");
        }
    };

    return (
        <>
            <style>{`
                html, body { scrollbar-width: none; -ms-overflow-style: none; }
                html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 right-8 z-[200] text-white px-6 py-4 rounded-xl shadow-2xl font-medium flex items-center gap-3 ${toastMessage.includes("🔔") ? "bg-orange-600" : "bg-emerald-600"}`}
                        >
                            {toastMessage.includes("🔔") ? <Bell size={20} className="text-white animate-wiggle" /> : <ShieldCheck size={20} className="text-white" />}
                            {toastMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-sm transition-all">
                    <div className="h-24 flex-none flex items-center px-8 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner</span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                        <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Operations</div>
                        <NavItem icon={LayoutDashboard} label="Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                        <NavItem icon={ShoppingBag} label="Live Orders" count={pendingOrders.length > 0 ? pendingOrders.length : null} isActive={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                        <NavItem icon={UtensilsCrossed} label="Menu Catalog" isActive={activeTab === "menu"} onClick={() => setActiveTab("menu")} />

                        <div className="px-4 mt-8 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
                        <NavItem icon={User} label="Profile & Settings" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
                    </nav>

                    <div className="flex-none p-4 bg-gray-50 border-t border-gray-100 space-y-2">
                        <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-black hover:text-black transition-all">
                            <Home size={18} /> Back to Website
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </aside>

                <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12 relative flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'orders' && 'Order Management'}
                                {activeTab === 'menu' && 'Menu Catalog'}
                                {activeTab === 'profile' && 'Restaurant Profile'}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto relative">
                            {(activeTab === 'orders' || activeTab === 'menu') && (
                                <div className="relative group flex-1 md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={globalSearch}
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                        placeholder={activeTab === 'menu' ? "Search dishes..." : "Search Order ID..."}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none shadow-sm transition-all"
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <div
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-3 bg-white rounded-full border ${pendingOrders.length > 0 ? 'border-orange-200 text-orange-500 shadow-md' : 'border-gray-200 text-gray-400 hover:text-black'} cursor-pointer transition-all shadow-sm relative`}
                                >
                                    <Bell size={20} />
                                    {pendingOrders.length > 0 && (
                                        <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                                <span className="font-bold text-sm text-gray-900">New Orders</span>
                                                <span className="text-[10px] bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                                                    {pendingOrders.length} Pending
                                                </span>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto no-scrollbar">
                                                {pendingOrders.length === 0 ? (
                                                    <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                                                        <CheckCircle size={32} className="mb-2 text-gray-200" />
                                                        <p className="text-sm font-bold">All caught up!</p>
                                                        <p className="text-xs mt-1">No new orders waiting.</p>
                                                    </div>
                                                ) : (
                                                    pendingOrders.map(order => (
                                                        <div
                                                            key={order.id}
                                                            onClick={() => { setActiveTab('orders'); setShowNotifications(false); }}
                                                            className="p-5 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                                        >
                                                            <div className="flex justify-between items-start mb-1.5">
                                                                <p className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors">Order #{order.id}</p>
                                                                <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹{order.total_amount}</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 font-medium truncate">
                                                                {order.items ? order.items.map(i => i.name).join(', ') : "View order details"}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                                                Click to process <ChevronRight size={12} />
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard label="30-Day Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-slate-900" />
                                    <StatCard label="30-Day Orders" value={stats.orders} icon={ShoppingBag} color="bg-orange-600" />
                                    {/* FIX: Shows 0.0 ★ if rating is missing */}
                                    <StatCard label="Customer Rating" value={`${stats.rating} ★`} icon={Star} color="bg-amber-500" />
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col h-[420px]">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">Performance Trend (Last 30 Days)</h3>
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                            <Activity size={20} />
                                        </div>
                                    </div>

                                    <div className="flex-1 w-full h-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} minTickGap={25} />
                                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(value) => `₹${value}`} />
                                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value, name) => {
                                                        if (name === "Revenue") return [`₹${Number(value).toFixed(0)}`, "Revenue"];
                                                        return [value, "Orders"];
                                                    }}
                                                />
                                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <RestaurantOrders searchQuery={globalSearch} />
                            </motion.div>
                        )}

                        {activeTab === "menu" && (
                            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <RestaurantMenu searchQuery={globalSearch} />
                            </motion.div>
                        )}

                        {activeTab === "profile" && (
                            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                                    <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shrink-0 relative z-10">
                                        {userData.profile_image ? (
                                            <img src={userData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl font-bold text-gray-300">{(userData.name || "R").charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 relative z-10 w-full">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{userData.name}</h3>
                                                <p className="text-gray-500 font-medium">@{userData.username}</p>
                                            </div>
                                            <button onClick={openEditModal} className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shrink-0">
                                                <Edit2 size={16} /> Edit Profile
                                            </button>
                                        </div>

                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <DetailBox label="Email Address" value={userData.email} />
                                            <DetailBox label="Account Status" value={userData.is_active ? "Active" : "Inactive"} isStatus />
                                            <DetailBox 
                                                label="Overall Rating" 
                                                value={`${userData.average_rating > 0 ? Number(userData.average_rating).toFixed(1) : '0.0'} / 5.0 (${userData.rating_count || 0} Reviews)`} 
                                            />
                                            <DetailBox label="Business Address" value={userData.address || "Not Provided"} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <AnimatePresence>
                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <h3 className="font-bold text-xl text-gray-900">Edit Profile</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                                </div>

                                <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar space-y-6">
                                    <div className="flex justify-center">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 shadow-inner">
                                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Camera size={32} /></div>}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs uppercase tracking-widest">Change</div>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <InputGroup label="Restaurant Name" name="name" value={formData.name} onChange={handleInputChange} />
                                        <InputGroup label="Username" name="username" value={formData.username} onChange={handleInputChange} />
                                    </div>
                                    <InputGroup label="Email" name="email" value={formData.email} onChange={handleInputChange} />
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm font-bold resize-none transition-all focus:bg-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                                        <InputGroup label="New Password" name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Optional" />
                                        <InputGroup label="Confirm" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" placeholder="Optional" />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
                                    <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                                    <button onClick={handleSaveProfile} className="flex-1 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg"><Save size={18} /> Save Changes</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

const NavItem = ({ icon: Icon, label, isActive, onClick, count }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black text-white shadow-xl shadow-black/10" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}>
        <div className="flex items-center gap-3">
            <Icon size={18} className={isActive ? "text-orange-400" : "text-gray-400 group-hover:text-black"} />
            <span className="font-bold text-sm">{label}</span>
        </div>
        {count && <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>{count}</span>}
    </button>
);

const DetailBox = ({ label, value, isStatus, className }) => (
    <div className={`p-5 bg-gray-50 rounded-2xl border border-gray-100 ${className}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
        {isStatus ? (
            <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wide ${value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{value}</span>
        ) : (
            <p className="font-bold text-gray-900 text-sm leading-relaxed">{value}</p>
        )}
    </div>
);

const InputGroup = ({ label, ...props }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        <input {...props} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm font-bold transition-all focus:bg-white" />
    </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
        </div>
    </div>
);

export default RestaurantDashboard;