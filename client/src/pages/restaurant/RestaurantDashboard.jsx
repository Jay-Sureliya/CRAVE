import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    LogOut,
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingBag,
    ArrowLeft,
    Search,
    Bell,
    ChevronRight,
    ShieldCheck,
    CreditCard,
    MapPin
} from "lucide-react";

// --- SUB-COMPONENTS ---
import RestaurantOrders from "./RestaurantOrders";
import RestaurantMenu from "./RestaurantMenu";

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("profile");

    const [userData, setUserData] = useState({
        username: "",
        role: "",
        email: "fetching...",
    });

    useEffect(() => {
        // CHANGE THIS
        const username = sessionStorage.getItem("username") || "Restaurant Partner";
        const role = sessionStorage.getItem("role") || "restaurant";
        setUserData(prev => ({ ...prev, username, role }));
    }, []);

    const handleLogout = () => {
        sessionStorage.clear(); // CHANGE THIS
        navigate("/login");
    };
    const getPageTitle = () => {
        switch (activeTab) {
            case 'profile': return 'Account Settings';
            case 'overview': return 'Business Overview';
            case 'orders': return 'Order Manager';
            case 'menu': return 'Menu Configuration';
            default: return 'Dashboard';
        }
    }

    return (
        <>
            {/* --- CSS TO HIDE SCROLLBAR BUT ALLOW SCROLLING --- */}
            <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>

            {/* --- ROOT CONTAINER: FIXED HEIGHT, NO WINDOW SCROLL --- */}
            <div className="flex h-screen w-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden">

                {/* --- 1. CLEAN SIDEBAR --- */}
                <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-30">

                    {/* Logo Area */}
                    <div className="h-16 flex-none flex items-center px-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-orange-600">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">CRAVE</span>
                        </div>
                    </div>

                    {/* Navigation (Scrollable but hidden bar) */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-scroll no-scrollbar">
                        <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform</div>

                        <NavItem
                            icon={<User size={18} />}
                            label="Profile & Settings"
                            isActive={activeTab === "profile"}
                            onClick={() => setActiveTab("profile")}
                        />
                        <NavItem
                            icon={<LayoutDashboard size={18} />}
                            label="Overview"
                            isActive={activeTab === "overview"}
                            onClick={() => setActiveTab("overview")}
                        />
                        <NavItem
                            icon={<ShoppingBag size={18} />}
                            label="Orders"
                            count="12"
                            isActive={activeTab === "orders"}
                            onClick={() => setActiveTab("orders")}
                        />
                        <NavItem
                            icon={<UtensilsCrossed size={18} />}
                            label="Menu Items"
                            isActive={activeTab === "menu"}
                            onClick={() => setActiveTab("menu")}
                        />
                    </nav>

                    {/* User Snippet / Logout (Fixed at bottom) */}
                    <div className="flex-none p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-orange-600 font-bold shadow-sm">
                                {userData.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{userData.username}</p>
                                <p className="text-xs text-gray-500 truncate">{userData.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft size={14} /> Home
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </aside>


                {/* --- 2. MAIN LAYOUT --- */}
                <div className="flex-1 flex flex-col h-full min-w-0">

                    {/* Content Area (Scrollable but hidden bar) */}
                    <main className="flex-1 p-8 overflow-y-scroll no-scrollbar">

                        {/* --- 1. PROFILE VIEW --- */}
                        {activeTab === "profile" && (
                            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Header Card */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center gap-6 shadow-sm">
                                    <div className="w-24 h-24 rounded-full bg-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-md ring-4 ring-orange-50">
                                        {userData.username.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-gray-900">{userData.username}</h2>
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">Verified</span>
                                        </div>
                                        <p className="text-gray-500 mt-1">Manage your restaurant identity and security settings.</p>
                                        <div className="flex gap-4 mt-4">
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><MapPin size={12} /> London, UK</span>
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><ShieldCheck size={12} /> Admin Access</span>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors shadow-sm">
                                        Edit Profile
                                    </button>
                                </div>

                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <SimpleStat label="Total Orders" value="1,204" trend="+8%" />
                                    <SimpleStat label="Menu Items" value="48" />
                                    <SimpleStat label="Customer Rating" value="4.9/5.0" trend="Top 5%" />
                                </div>

                                {/* Details Sections */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Personal Info */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-900">Contact Information</h3>
                                            <button className="text-xs font-medium text-orange-600 hover:text-orange-700">Update</button>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <DetailRow label="Display Name" value={userData.username} />
                                            <DetailRow label="Email Address" value="restaurant@crave.com" />
                                            <DetailRow label="Support Phone" value="+1 (555) 000-0000" />
                                            <DetailRow label="Role" value={userData.role} />
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                                        </div>
                                        <div className="p-2">
                                            <ActionTile icon={<UtensilsCrossed size={18} />} title="Add New Dish" desc="Update your menu availability" onClick={() => setActiveTab('menu')} />
                                            <ActionTile icon={<ShoppingBag size={18} />} title="View Live Orders" desc="Check incoming customer requests" onClick={() => setActiveTab('orders')} />
                                            <ActionTile icon={<CreditCard size={18} />} title="Billing Settings" desc="Manage payment methods" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* --- 2. OVERVIEW --- */}
                        {activeTab === "overview" && (
                            <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-full max-w-md text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <LayoutDashboard size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Analytics Module</h3>
                                    <p className="text-gray-500 mt-2 mb-6">Detailed insights about your restaurant performance will appear here.</p>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Development in progress (65%)</p>
                                </div>
                            </div>
                        )}

                        {/* --- 3. ORDERS (Component) --- */}
                        {activeTab === "orders" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <RestaurantOrders />
                            </div>
                        )}

                        {/* --- 4. MENU (Component) --- */}
                        {activeTab === "menu" && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <RestaurantMenu />
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </>
    );
};

// --- SUB COMPONENTS ---

const NavItem = ({ icon, label, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                ? "bg-orange-50 text-orange-700 font-semibold"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"}>
                {icon}
            </div>
            <span>{label}</span>
        </div>

        {count && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white text-orange-700 shadow-sm" : "bg-gray-100 text-gray-600"
                }`}>
                {count}
            </span>
        )}

        {isActive && <div className="absolute left-0 w-1 h-8 bg-orange-600 rounded-r-full" />}
    </button>
);

const SimpleStat = ({ label, value, trend }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="flex items-end justify-between mt-2">
            <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            {trend && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    {trend}
                </span>
            )}
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
);

const ActionTile = ({ icon, title, desc, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left group"
    >
        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400" />
    </button>
);

export default RestaurantDashboard;