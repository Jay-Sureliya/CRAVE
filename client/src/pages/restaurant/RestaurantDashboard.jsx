import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    User, LogOut, LayoutDashboard, UtensilsCrossed, ShoppingBag, ArrowLeft,
    ChevronRight, ShieldCheck, CreditCard, MapPin, X, Save, Lock, Mail,
    Home, Camera, UploadCloud, UserCircle, Edit2
} from "lucide-react";

import api from "../../services/api";
import RestaurantOrders from "../restaurant/RestaurantOrders";
import RestaurantMenu from "../restaurant/RestaurantMenu";

const RestaurantDashboard = () => {
    const navigate = useNavigate();

    // --- THE FIX: Load active tab from localStorage ---
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("restaurantActiveTab") || "profile";
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState(""); // <-- NEW: State for success popup
    const fileInputRef = useRef(null);

    // --- THE FIX: Save active tab on change ---
    useEffect(() => {
        localStorage.setItem("restaurantActiveTab", activeTab);
    }, [activeTab]);

    // --- STATE ---
    const [userData, setUserData] = useState({
        id: null,
        username: "",
        name: "",
        email: "",
        address: "",
        role: "restaurant",
        is_active: true,
        profile_image: null
    });

    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: ""
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState(false);

    // --- HELPER Logic ---
    const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("data:image")) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${new Date().getTime()}`;
    };

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })), "image/jpeg", 0.8);
                };
            };
        });
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/api/restaurant/me");
                const data = response.data;
                if (data.id) sessionStorage.setItem("restaurant_id", data.id);

                setUserData({
                    id: data.id,
                    username: data.username || "",
                    name: data.name || "Restaurant",
                    email: data.email || "",
                    address: data.address || "",
                    role: "restaurant",
                    is_active: data.is_active,
                    profile_image: formatImageUrl(data.profile_image)
                });
            } catch (error) {
                if (error.response?.status === 401) navigate("/login");
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
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
        setSelectedFile(null);
        setIsEditModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file);
            setSelectedFile(compressed);
            setImagePreview(URL.createObjectURL(compressed));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            return alert("Passwords do not match!");
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
            const result = response.data;
            setImageError(false);

            // --- THE FIX: Use formData values directly because backend only returns the image ---
            setUserData(prev => ({
                ...prev,
                username: formData.username,
                name: formData.name,
                email: formData.email,
                address: formData.address,
                profile_image: formatImageUrl(result.profile_image) || prev.profile_image
            }));

            setIsEditModalOpen(false);

            // --- THE FIX: Show success popup ---
            setToastMessage("Profile updated successfully!");
            setTimeout(() => setToastMessage(""), 3500); // Hide after 3.5 seconds

        } catch (error) {
            alert(error.response?.data?.detail || "Failed to update profile.");
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#FCF8F5] text-slate-800 font-sans overflow-hidden relative">

            {/* SUCCESS TOAST POPUP */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[200] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-600/20 font-bold flex items-center gap-3"
                    >
                        <ShieldCheck size={24} className="text-emerald-200" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <aside className="w-[280px] bg-white flex flex-col h-full z-30 border-r border-orange-100/50 shadow-[4px_0_24px_-12px_rgba(234,88,12,0.1)] relative">
                <div className="h-24 flex-none flex items-center px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">C</div>
                        <span className="text-2xl font-black tracking-tight text-slate-900">CRAVE</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 mb-4 text-xs font-bold text-orange-300 uppercase tracking-wider">Dashboard</p>
                    <NavItem icon={User} label="Profile & Settings" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
                    <NavItem icon={LayoutDashboard} label="Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                    <NavItem icon={ShoppingBag} label="Orders" count="Live" isActive={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                    <NavItem icon={UtensilsCrossed} label="Menu Items" isActive={activeTab === "menu"} onClick={() => setActiveTab("menu")} />
                </nav>

                <div className="flex-none p-5 border-t border-orange-50 bg-gradient-to-b from-white to-orange-50/30">
                    <div className="flex items-center gap-3 mb-5 px-2">
                        {userData.profile_image && !imageError ? (
                            <img src={userData.profile_image} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-orange-100 shadow-sm" onError={() => setImageError(true)} />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                                {(userData.name || "C").charAt(0)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{userData.name || "Restaurant"}</p>
                            <p className="text-xs font-medium text-orange-500 truncate capitalize">{userData.role}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate("/")} className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"><ArrowLeft size={14} /> Home</button>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-red-600 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors shadow-sm"><LogOut size={14} /> Logout</button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto w-full p-8 lg:p-10 space-y-8">

                            {/* PROFILE HEADER CARD */}
                            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none -mt-20 -mr-20"></div>

                                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-md bg-orange-50 overflow-hidden shrink-0 relative z-10 flex items-center justify-center">
                                    {userData.profile_image && !imageError ? (
                                        <img src={userData.profile_image} alt="Profile" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                                    ) : (
                                        <span className="text-4xl font-black text-orange-400">{(userData.name || "C").charAt(0)}</span>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left relative z-10 pt-2">
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{userData.name || "My Restaurant"}</h2>
                                    <p className="text-sm font-semibold text-orange-500 mb-4">@{userData.username}</p>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                        <Badge icon={<MapPin size={14} />} label={userData.address || "No address provided"} />
                                        <Badge icon={<ShieldCheck size={14} className="text-emerald-500" />} label="Verified Partner" bg="bg-emerald-50" border="border-emerald-100" />
                                    </div>
                                </div>

                                <div className="relative z-10 pt-2">
                                    <button onClick={openEditModal} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:border-orange-200 hover:text-orange-600 transition-all flex items-center gap-2">
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* DETAILS & ACTIONS GRID */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                                <div className="lg:col-span-3 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                                    <div className="px-8 py-5 border-b border-orange-50 bg-orange-50/30 flex items-center gap-3">
                                        <UserCircle className="text-orange-500" size={20} />
                                        <h3 className="font-bold text-slate-900">Account Details</h3>
                                    </div>
                                    <div className="p-8 space-y-2">
                                        <DetailRow label="Restaurant Name" value={userData.name} />
                                        <DetailRow label="Login Username" value={`@${userData.username}`} />
                                        <DetailRow label="Email Address" value={userData.email} />
                                        <DetailRow label="Business Address" value={userData.address} />
                                        <DetailRow label="Account Status" value={userData.is_active ? "Active & Open" : "Closed"} highlight={userData.is_active} />
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                                    <div className="px-8 py-5 border-b border-orange-50 bg-orange-50/30 flex items-center gap-3">
                                        <LayoutDashboard className="text-orange-500" size={20} />
                                        <h3 className="font-bold text-slate-900">Quick Actions</h3>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <ActionTile icon={UtensilsCrossed} title="Manage Menu" desc="Update your dishes & prices" onClick={() => setActiveTab('menu')} />
                                        <ActionTile icon={ShoppingBag} title="View Orders" desc="Monitor live kitchen requests" onClick={() => setActiveTab('orders')} />
                                        <ActionTile icon={CreditCard} title="Billing Setup" desc="Manage payout preferences" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "orders" && <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><RestaurantOrders /></motion.div>}
                    {activeTab === "menu" && <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><RestaurantMenu /></motion.div>}
                </AnimatePresence>
            </main>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} transition={{ duration: 0.2 }} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-orange-100 flex flex-col max-h-[90vh] overflow-hidden">

                            <div className="flex justify-between items-center px-8 py-6 border-b border-orange-50 bg-orange-50/30">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Edit Settings</h3>
                                    <p className="text-xs font-semibold text-orange-500 mt-1">Update restaurant details</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="flex justify-center mb-2">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 bg-orange-50 shadow-sm p-1">
                                                <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                                                    {imagePreview ? (
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-orange-300"><UploadCloud size={28} /></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <FormInput label="Username" name="username" value={formData.username} onChange={handleInputChange} />
                                        <FormInput label="Restaurant Name" name="name" value={formData.name} onChange={handleInputChange} />
                                    </div>
                                    <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" />

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            Business Address
                                        </label>
                                        <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-semibold text-slate-800 resize-none outline-none" />
                                    </div>

                                    <div className="pt-6 border-t border-dashed border-orange-100 grid grid-cols-2 gap-5">
                                        <FormInput label="New Password" name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Leave blank to keep" />
                                        <FormInput label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" />
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-orange-50 bg-white flex gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">Cancel</button>
                                <button type="submit" form="profileForm" className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- ELEGANT SUB-COMPONENTS ---
const NavItem = ({ icon: Icon, label, isActive, onClick, count }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-orange-50 text-orange-600 font-bold shadow-sm border border-orange-100/50" : "text-slate-500 hover:bg-slate-50 font-medium border border-transparent"}`}>
        {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-orange-500 rounded-r-full" />}
        <div className="flex items-center gap-3 relative z-10 pl-1">
            <Icon size={18} className={isActive ? "text-orange-500" : "text-slate-400 group-hover:text-orange-400 transition-colors"} />
            <span>{label}</span>
        </div>
        {count && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? "bg-orange-200 text-orange-800" : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors"}`}>{count}</span>}
    </button>
);

const DetailRow = ({ label, value, highlight }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-slate-50 last:border-0">
        <span className="text-sm font-medium text-slate-500 mb-1 sm:mb-0">{label}</span>
        <span className={`text-sm font-bold text-right ${highlight ? "text-emerald-600" : "text-slate-900"}`}>{value || "—"}</span>
    </div>
);

const Badge = ({ icon, label, bg = "bg-slate-50", border = "border-slate-200" }) => (
    <span className={`flex items-center gap-1.5 text-xs font-semibold text-slate-600 ${bg} px-3 py-1.5 rounded-lg border ${border}`}>
        {icon} {label}
    </span>
);

const FormInput = ({ label, ...props }) => (
    <div className="space-y-2 w-full">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            {label}
        </label>
        <input {...props} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" />
    </div>
);

const ActionTile = ({ icon: Icon, title, desc, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 rounded-xl transition-all duration-200 text-left group">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200">
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{title}</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
    </button>
);

export default RestaurantDashboard;