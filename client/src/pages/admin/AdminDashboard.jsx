import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  DollarSign, 
  LogOut, 
  ArrowLeft, 
  Search, 
  Bell, 
  CheckCircle, 
  MapPin, 
  Mail, 
  Phone,
  ShieldCheck
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, requestsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/requests")
        ]);
        setData(dashboardRes.data);
        setRequests(requestsRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
        if(err.response?.status === 401 || err.response?.status === 403) {
            // Optional: Redirect or alert
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    // --- FIX: Use sessionStorage to allow multiple account logins in different tabs ---
    sessionStorage.clear(); 
    navigate("/login");
  };

  const handleApprove = (id) => {
    if(!window.confirm("Approve this restaurant?")) return;
    api.post(`/admin/approve/${id}`)
      .then(res => {
        alert(res.data.message); 
        setRequests(requests.filter(req => req.id !== id));
      })
      .catch(err => alert("Error approving request."));
  };

  // Safe check for stats
  const stats = data?.stats || data || {};

  // Dynamic Header Title
  const getPageTitle = () => {
    switch(activeTab) {
        case 'dashboard': return 'System Overview';
        case 'users': return 'User Management';
        case 'restaurants': return 'Partner Requests';
        case 'financials': return 'Financial Reports';
        default: return 'Admin Panel';
    }
  }

  return (
    <>
      {/* --- CSS TO HIDE SCROLLBAR --- */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex h-screen w-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden">

        {/* --- 1. CLEAN SIDEBAR --- */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-30">
          
          {/* Logo Area */}
          <div className="h-16 flex-none flex items-center px-6 border-b border-gray-100">
             <div className="flex items-center gap-2 text-orange-600">
               {/* FIX: Changed bg-slate-900 to bg-orange-600 to match Restaurant Panel */}
               <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
               <span className="text-lg font-bold tracking-tight text-slate-900">ADMIN<span className="text-gray-400 font-normal">panel</span></span>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-scroll no-scrollbar">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</div>
            
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              isActive={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")} 
            />
            <NavItem 
              icon={<Users size={18} />} 
              label="Users" 
              isActive={activeTab === "users"} 
              onClick={() => setActiveTab("users")} 
            />
            <NavItem 
              icon={<Store size={18} />} 
              label="Restaurants" 
              count={requests.length > 0 ? requests.length : null}
              isActive={activeTab === "restaurants"} 
              onClick={() => setActiveTab("restaurants")} 
            />
            <NavItem 
              icon={<DollarSign size={18} />} 
              label="Financials" 
              isActive={activeTab === "financials"} 
              onClick={() => setActiveTab("financials")} 
            />
          </nav>

          {/* User/Logout Footer */}
          <div className="flex-none p-4 border-t border-gray-100 bg-gray-50/50">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
                   AD
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-gray-900 truncate">Super Admin</p>
                   <p className="text-xs text-gray-500 truncate">admin@crave.com</p>
                </div>
             </div>
             
             <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
             >
                <LogOut size={14} /> Secure Logout
             </button>
          </div>
        </aside>


        {/* --- 2. MAIN LAYOUT --- */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          
          {/* Top Header */}
          <header className="flex-none bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-20 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
             <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
             
             <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search system..." 
                      className="pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all w-64 outline-none"
                   />
                </div>
                <button className="relative p-2 text-gray-500 hover:text-slate-800 transition-colors">
                   <Bell size={20} />
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
             </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-8 overflow-y-scroll no-scrollbar">
             
             {isLoading ? (
                 <div className="flex items-center justify-center h-64">
                    <p className="text-gray-400 animate-pulse">Loading data...</p>
                 </div>
             ) : (
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SimpleStat 
                            label="Total Revenue" 
                            value={stats.revenue || "₹0"} 
                            trend="+12.5%" 
                            icon={<DollarSign className="text-emerald-500" size={20} />}
                        />
                        <SimpleStat 
                            label="Total Orders" 
                            value={stats.total_orders || "0"} 
                            trend="+5%" 
                            icon={<DollarSign className="text-blue-500" size={20} />} 
                        />
                        <SimpleStat 
                            label="Active Drivers" 
                            value={stats.active_drivers || "0"} 
                            trend="Stable" 
                            icon={<Users className="text-orange-500" size={20} />}
                        />
                    </div>

                    {/* MAIN SECTION: Pending Requests */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Store size={18} className="text-orange-600"/>
                                    Restaurant Approvals
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Validate new partner applications.</p>
                            </div>
                            <span className="bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-orange-200">
                                {requests.length} Pending
                            </span>
                        </div>

                        {requests.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="text-gray-300" size={24} />
                                </div>
                                <h4 className="text-gray-900 font-medium">All caught up!</h4>
                                <p className="text-gray-400 text-sm">No pending restaurant applications.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                        <tr>
                                            <th className="px-6 py-3">Restaurant Details</th>
                                            <th className="px-6 py-3">Owner</th>
                                            <th className="px-6 py-3">Contact</th>
                                            <th className="px-6 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                                            {req.restaurant_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{req.restaurant_name}</p>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <MapPin size={10} /> {req.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900">{req.owner_name}</p>
                                                    <p className="text-xs text-gray-500">ID: #{req.id}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Mail size={12} className="text-gray-400"/> {req.email}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                            <Phone size={12} className="text-gray-400"/> {req.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-transform active:scale-95"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
             )}

          </main>
        </div>
      </div>
    </>
  );
};

// --- SUB COMPONENTS (Exactly matching Restaurant Panel Style) ---

const NavItem = ({ icon, label, isActive, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
      isActive 
        // FIX: Changed from Slate to Orange to match Restaurant Panel
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
      <span className={`text-xs px-2 py-0.5 rounded-full ${
         isActive ? "bg-white text-orange-700 shadow-sm" : "bg-gray-100 text-gray-600"
      }`}>
        {count}
      </span>
    )}
    
    {/* FIX: Changed sidebar active marker to Orange */}
    {isActive && <div className="absolute left-0 w-1 h-8 bg-orange-600 rounded-r-full" />} 
  </button>
);

const SimpleStat = ({ label, value, trend, icon }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          {icon}
      </div>
      <div className="flex items-end justify-between mt-2">
         <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
         {trend && (
            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
               {trend}
            </span>
         )}
      </div>
  </div>
);

export default AdminDashboard;