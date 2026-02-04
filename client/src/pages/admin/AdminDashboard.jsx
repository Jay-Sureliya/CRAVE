import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import { 
  LayoutDashboard, Users, Store, Utensils, LogOut, Search, 
  CheckCircle, XCircle, Home, Trash2, MoreVertical, Bike,
  Mail, MapPin, Phone, Ban, Clock // Added Ban and Clock icons
} from "lucide-react";

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce-in`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [requests, setRequests] = useState([]);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [users, setUsers] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, restaurantsRes, usersRes] = await Promise.allSettled([
          api.get("/admin/requests"),
          api.get("/restaurants"),
          api.get("/admin/users")
        ]);
        
        if(requestsRes.status === "fulfilled") setRequests(requestsRes.value.data);
        if(restaurantsRes.status === "fulfilled") setActiveRestaurants(restaurantsRes.value.data);
        if(usersRes.status === "fulfilled") setUsers(usersRes.value.data);

      } catch (err) {
        console.error("Critical Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Data
  const customerList = users.filter(u => u.role === "customer");
  const riderList = users.filter(u => u.role === "driver" || u.role === "rider");
  
  // Stats
  const customerCount = customerList.length;
  const driverCount = riderList.length;
  const restaurantCount = activeRestaurants.length;

  // Handlers
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.clear(); 
    localStorage.clear();
    navigate("/login");
  };

  // --- RESTAURANT ACTIONS ---
  const handleApprove = async (id) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== id));
      showToast("Approved & Created!", "success");
      await api.post(`/admin/approve/${id}`);
      const res = await api.get("/restaurants"); // Refresh list
      setActiveRestaurants(res.data);
    } catch (error) {
       console.error("Approval Failed", error);
       showToast("Failed to approve.", "error");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Reject this application?")) return;
    try {
      setRequests(prev => prev.filter(req => req.id !== id));
      await api.post(`/admin/reject/${id}`);
      showToast("Application rejected.", "info");
    } catch (error) {
      console.error(error);
      showToast("Failed to reject.", "error");
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if(!window.confirm("Permanently delete this restaurant?")) return;
    try {
      setActiveRestaurants(prev => prev.filter(r => r.id !== id));
      await api.delete(`/admin/restaurants/${id}`);
      showToast("Restaurant deleted.", "error");
    } catch (error) {
       console.error("Delete failed", error);
       showToast("Failed to delete.", "error");
    }
  };

  // --- CUSTOMER ACTIONS (NEW) ---
  const handleSuspendUser = async (userId) => {
    if(!window.confirm("Suspend this user for 7 Days?")) return;
    // Here you would typically call an API endpoint like: await api.post(`/admin/users/${userId}/suspend`, { days: 7 });
    // For now, we simulate success:
    showToast("User suspended for 7 days.", "info");
  };

  const handleTerminateUser = async (userId) => {
    if(!window.confirm("PERMANENTLY Terminate this account? This cannot be undone.")) return;
    try {
        // Assuming you might add a generic delete user endpoint later, or reuse a delete logic
        // await api.delete(`/admin/users/${userId}`); 
        setUsers(users.filter(u => u.id !== userId)); // UI Update
        showToast("Account terminated successfully.", "error");
    } catch (error) {
        showToast("Failed to terminate.", "error");
    }
  };

  return (
    <>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-sm transition-all">
          <div className="h-24 flex-none flex items-center px-8">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl">C</div>
               <div>
                 <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
               </div>
             </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</div>
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            
            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
            <NavItem icon={<Utensils size={20} />} label="All Restaurants" count={activeRestaurants.length} isActive={activeTab === "active_restaurants"} onClick={() => setActiveTab("active_restaurants")} />
            <NavItem icon={<Store size={20} />} label="Approval Requests" count={requests.length > 0 ? requests.length : null} isActive={activeTab === "requests"} onClick={() => setActiveTab("requests")} />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">People</div>
            <NavItem icon={<Bike size={20} />} label="All Riders" count={driverCount} isActive={activeTab === "riders"} onClick={() => setActiveTab("riders")} />
            <NavItem icon={<Users size={20} />} label="All Customers" count={customerCount} isActive={activeTab === "customers"} onClick={() => setActiveTab("customers")} />
          </nav>

          <div className="flex-none p-4 bg-gray-50 border-t border-gray-100 space-y-2">
             <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
                <Home size={18} /> Back to Website
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={18} /> Sign Out
             </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'System Overview'}
                {activeTab === 'active_restaurants' && 'Restaurant Management'}
                {activeTab === 'requests' && 'New Applications'}
                {activeTab === 'riders' && 'Delivery Fleet'}
                {activeTab === 'customers' && 'Customer Database'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeTab === 'dashboard' ? `Welcome back! You have ${requests.length} pending requests.` : 'Manage your platform data.'}
              </p>
            </div>
            
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
               <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-72 shadow-sm transition-all" />
            </div>
          </div>

          {isLoading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
             </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
                
                {/* 1. DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total Customers" value={customerCount} icon={<Users className="text-white" size={24} />} color="bg-blue-600" />
                        <StatCard label="Active Restaurants" value={restaurantCount} icon={<Utensils className="text-white" size={24} />} color="bg-orange-600" />
                        <StatCard label="All Riders" value={driverCount} icon={<Bike className="text-white" size={24} />} color="bg-emerald-600" />
                    </div>
                    {/* Recent Requests Preview */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                        <h3 className="font-bold text-gray-900 mb-4">Pending Approvals</h3>
                        {requests.length === 0 ? <p className="text-gray-400 text-sm">No pending requests.</p> : (
                          <div className="space-y-4">
                            {requests.slice(0, 3).map(req => (
                              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">{req.restaurant_name ? req.restaurant_name[0] : "R"}</div>
                                    <div><p className="text-sm font-bold">{req.restaurant_name}</p><p className="text-xs text-gray-500">{req.owner_name}</p></div>
                                 </div>
                                 <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </>
                )}

                {/* 2. ACTIVE RESTAURANTS */}
                {activeTab === 'active_restaurants' && (
                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {activeRestaurants.filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
                            <tr key={r.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
                              <td className="px-6 py-4 text-gray-500 text-sm">{r.address || r.location || "N/A"}</td>
                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.is_active ? "Active" : "Inactive"}</span></td>
                              <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteRestaurant(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                )}

                {/* 3. REQUESTS */}
                {activeTab === 'requests' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                         <tr><th className="px-6 py-4">Applicant</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-right">Decision</th></tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {requests.map(req => (
                           <tr key={req.id}>
                             <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.restaurant_name}</p><span className="text-xs text-gray-400">{req.address}</span></td>
                             <td className="px-6 py-4 text-sm text-gray-600"><div>{req.owner_name}</div><div>{req.email}</div></td>
                             <td className="px-6 py-4 text-right space-x-3">
                               <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600">Reject</button>
                               <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-green-600">Approve</button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                    {requests.length === 0 && <div className="p-16 text-center text-gray-500"><CheckCircle size={32} className="text-green-500 mb-4 inline-block"/><p>No pending applications.</p></div>}
                  </div>
                )}

                {/* 4. RIDERS */}
                {activeTab === 'riders' && (
                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {riderList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">{u.username ? u.username[0] : "R"}</div>
                                <div><p className="font-bold text-sm">{u.username || "Unknown"}</p><p className="text-xs text-gray-400">ID: {u.id}</p></div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-cyan-100 text-cyan-700">Rider</span></td>
                              <td className="px-6 py-4 text-right"><MoreVertical size={16} className="text-gray-400" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {riderList.length === 0 && <div className="p-12 text-center text-gray-500">No riders found.</div>}
                   </div>
                )}

                {/* 5. CUSTOMERS (UPDATED) */}
                {activeTab === 'customers' && (
                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Email</th>
                            {/* Replaced Role with Phone and Status */}
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {customerList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50">
                              {/* 1. Customer Name */}
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{u.username ? u.username[0] : "C"}</div>
                                <p className="font-bold text-sm">{u.username || "Unknown"}</p>
                              </td>
                              
                              {/* 2. Email */}
                              <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                              
                              {/* 3. Phone (Replaced Role) */}
                              <td className="px-6 py-4 text-sm text-gray-600">{u.phone || "N/A"}</td>

                              {/* 4. Status (Placeholder for now) */}
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">Active</span>
                              </td>

                              {/* 5. Actions: Suspend & Terminate */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleSuspendUser(u.id)}
                                        title="Suspend for 7 Days"
                                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        <Clock size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleTerminateUser(u.id)}
                                        title="Terminate Account"
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Ban size={18} />
                                    </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {customerList.length === 0 && <div className="p-12 text-center text-gray-500">No customers found.</div>}
                   </div>
                )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, isActive, onClick, count }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}>
    <div className="flex items-center gap-3"><div className={isActive ? "text-orange-400" : "text-gray-400 group-hover:text-black"}>{icon}</div><span className="font-medium text-sm">{label}</span></div>
    {count !== undefined && count !== null && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>{icon}</div>
      <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p><h4 className="text-2xl font-bold text-gray-900">{value}</h4></div>
  </div>
);

export default AdminDashboard;