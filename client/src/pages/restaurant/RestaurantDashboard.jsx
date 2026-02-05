import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, LogOut, LayoutDashboard, UtensilsCrossed, ShoppingBag, ArrowLeft,
    ChevronRight, ShieldCheck, CreditCard, MapPin, X, Save, Lock, Mail,
    Home, Sparkles, Camera, UploadCloud, UserCircle
} from "lucide-react";

// --- SUB-COMPONENTS ---
import RestaurantOrders from "./RestaurantOrders";
import RestaurantMenu from "./RestaurantMenu";

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const fileInputRef = useRef(null);

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

    // Form State
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

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("http://localhost:8000/api/restaurant/me", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.id) sessionStorage.setItem("restaurant_id", data.id);

                    setUserData({
                        id: data.id,
                        username: data.username || "",
                        name: data.name || "Restaurant",
                        email: data.email || "",
                        address: data.address || "",
                        role: "restaurant",
                        is_active: data.is_active,
                        profile_image: data.profile_image
                    });
                }
            } catch (error) {
                console.error("Connection error:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/login");
    };

    // --- MODAL LOGIC ---
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- SAVE PROFILE ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("email", formData.email);
        data.append("address", formData.address);
        // Only append if changed/exists
        if (formData.username && formData.username !== userData.username) data.append("username", formData.username);
        if (formData.password) data.append("password", formData.password);
        if (selectedFile) data.append("profile_image", selectedFile);

        try {
            const token = sessionStorage.getItem("token") || localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/restaurant/update", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (response.ok) {
                const updatedUser = await response.json();

                // 1. Reset error state so new image can load
                setImageError(false);

                // 2. Update State IMMEDIATELY with data from Backend
                setUserData(prev => ({
                    ...prev, // Keep ID, role, etc.
                    username: updatedUser.username,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    address: updatedUser.address,
                    profile_image: updatedUser.profile_image // This forces the image to update in UI
                }));

                alert("Profile updated successfully!");
                setIsEditModalOpen(false);
            } else {
                const err = await response.json();
                alert(err.detail || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Something went wrong");
        }
    };

    return (
        <>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <div className="flex h-screen w-screen bg-orange-50/30 text-slate-800 font-sans overflow-hidden relative selection:bg-orange-200">

                {/* SIDEBAR */}
                <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-orange-100/50 flex flex-col h-full z-30 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
                    <div className="h-20 flex-none flex items-center px-8 border-b border-orange-50">
                        <div className="flex items-center gap-3 text-orange-600">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">C</div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">CRAVE</span>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-scroll no-scrollbar">
                        <div className="px-4 mb-3 text-xs font-bold text-orange-300 uppercase tracking-widest">Platform</div>
                        <NavItem icon={<User size={20} />} label="Profile & Settings" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
                        <NavItem icon={<LayoutDashboard size={20} />} label="Overview" isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
                        <NavItem icon={<ShoppingBag size={20} />} label="Orders" count="12" isActive={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
                        <NavItem icon={<UtensilsCrossed size={20} />} label="Menu Items" isActive={activeTab === "menu"} onClick={() => setActiveTab("menu")} />
                    </nav>
                    <div className="flex-none p-6 border-t border-orange-50 bg-gradient-to-b from-white to-orange-50/50">
                        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                            {userData.profile_image && !imageError ? (
                                <img
                                    src={userData.profile_image}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover border border-orange-200"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                                    {(userData.name || "C").charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{userData.name || "Restaurant"}</p>
                                <p className="text-xs text-orange-400 font-medium truncate">{userData.role}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate("/")} className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all duration-200"><ArrowLeft size={14} /> Home</button>
                            <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all duration-200"><LogOut size={14} /> Logout</button>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col h-full min-w-0 bg-[#FFFBF7]">
                    <main className="flex-1 p-8 overflow-y-scroll no-scrollbar">
                        {activeTab === "profile" && (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                                {/* HERO CARD */}
                                <div className="relative overflow-hidden bg-white rounded-3xl border border-orange-100 p-8 flex items-center gap-8 shadow-xl shadow-orange-500/5">
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                                    <div className="relative w-28 h-28 rounded-full p-1 shadow-lg shadow-orange-200 bg-white">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-orange-50 flex items-center justify-center">
                                            {userData.profile_image && !imageError ? (
                                                <img
                                                    src={userData.profile_image}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <span className="text-4xl font-black text-orange-600">
                                                    {(userData.name || "C").charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{userData.name || "My Restaurant"}</h2>
                                        <p className="text-sm font-bold text-orange-600 mb-1">@{userData.username}</p>
                                        <p className="text-gray-500 font-medium">{userData.address}</p>
                                        <div className="flex gap-6 mt-6">
                                            <Badge icon={<MapPin size={14} />} label={userData.address || "No address"} />
                                            <Badge icon={<ShieldCheck size={14} />} label="Owner Access" />
                                        </div>
                                    </div>
                                    <button onClick={openEditModal} className="relative z-10 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                                        Edit Profile
                                    </button>
                                </div>

                                {/* DETAILS GRID */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/5 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-orange-50 bg-gradient-to-r from-white to-orange-50/30">
                                            <h3 className="font-bold text-lg text-gray-900">Account Details</h3>
                                        </div>
                                        <div className="p-8 space-y-5">
                                            <DetailRow label="Login Username" value={`@${userData.username}`} highlight />
                                            <DetailRow label="Restaurant Name" value={userData.name} />
                                            <DetailRow label="Email Address" value={userData.email} />
                                            <DetailRow label="Address" value={userData.address} />
                                            <DetailRow label="Status" value={userData.is_active ? "Open for Business" : "Closed"} />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-500/5 overflow-hidden">
                                        <div className="px-8 py-6 border-b border-orange-50 bg-gradient-to-r from-white to-orange-50/30">
                                            <h3 className="font-bold text-lg text-gray-900">Quick Actions</h3>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <ActionTile icon={<UtensilsCrossed size={20} />} title="Add New Dish" desc="Update your menu availability" onClick={() => setActiveTab('menu')} />
                                            <ActionTile icon={<ShoppingBag size={20} />} title="View Live Orders" desc="Check incoming customer requests" onClick={() => setActiveTab('orders')} />
                                            <ActionTile icon={<CreditCard size={20} />} title="Billing Settings" desc="Manage payment methods" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === "orders" && <RestaurantOrders />}
                        {activeTab === "menu" && <RestaurantMenu />}
                    </main>
                </div>

                {/* --- EDIT MODAL --- */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl shadow-orange-900/20 border border-white/50 flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

                            {/* Header */}
                            <div className="flex-none flex justify-between items-center px-8 py-5 border-b border-orange-50 bg-gradient-to-r from-orange-50/50 to-white backdrop-blur-md rounded-t-3xl">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                                    <p className="text-xs text-orange-500 font-medium mt-0.5">Update restaurant details</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-5">
                                    {/* Image Upload */}
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-orange-50">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-orange-300"><UploadCloud size={32} /></div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>

                                    {/* Inputs */}
                                    <FormInput icon={UserCircle} label="Login Username" name="username" value={formData.username} onChange={handleInputChange} type="text" />
                                    <FormInput icon={Home} label="Restaurant Name" name="name" value={formData.name} onChange={handleInputChange} type="text" />
                                    <FormInput icon={Mail} label="Email Address" name="email" value={formData.email} onChange={handleInputChange} type="email" />

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <MapPin size={14} className="text-orange-500" /> Business Address
                                        </label>
                                        <textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium resize-none text-gray-700" />
                                    </div>

                                    <div className="border-t border-dashed border-gray-200 my-2"></div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput icon={Lock} label="New Password" name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Optional" />
                                        <FormInput label="Confirm" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} type="password" placeholder="Confirm" />
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex-none p-6 border-t border-gray-100 bg-white rounded-b-3xl">
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm">Cancel</button>
                                    <button type="submit" form="profileForm" className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"><Save size={18} /> Save Changes</button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// --- HELPERS ---
const NavItem = ({ icon, label, isActive, onClick, count }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive ? "bg-orange-50 text-orange-700 font-bold shadow-sm" : "text-gray-500 hover:bg-white hover:text-orange-600 hover:shadow-sm font-medium"}`}>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`transition-colors duration-200 ${isActive ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"}`}>{icon}</div>
            <span>{label}</span>
        </div>
        {count && <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isActive ? "bg-orange-200 text-orange-800" : "bg-gray-100 text-gray-500 group-hover:bg-orange-100"}`}>{count}</span>}
    </button>
);
const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={`text-sm font-bold ${highlight ? "text-green-600" : "text-gray-800"}`}>{value}</span>
    </div>
);
const Badge = ({ icon, label }) => (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
        {icon} {label}
    </span>
);
const FormInput = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            {Icon && <Icon size={14} className="text-orange-500" />} {label}
        </label>
        <input {...props} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium text-gray-700 placeholder-gray-400" />
    </div>
);
const ActionTile = ({ icon, title, desc, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-5 p-4 hover:bg-orange-50/50 rounded-2xl transition-all duration-200 text-left group border border-transparent hover:border-orange-100">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-100 group-hover:shadow-md transition-all duration-200">
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-700 transition-colors">{title}</h4>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{desc}</p>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
    </button>
);

export default RestaurantDashboard;