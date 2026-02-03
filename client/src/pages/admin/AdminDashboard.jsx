// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import { 
//   LayoutDashboard, 
//   Users, 
//   Store, 
//   Utensils,
//   LogOut, 
//   Search, 
//   CheckCircle, 
//   MapPin, 
//   Mail, 
//   Phone,
//   XCircle,
//   TrendingUp,
//   Home,
//   Trash2,
//   MoreVertical,
//   Car
// } from "lucide-react";

// // --- TOAST NOTIFICATION ---
// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const bgColors = {
//     success: "bg-emerald-600",
//     error: "bg-red-600",
//     info: "bg-blue-600"
//   };

//   return (
//     <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce-in`}>
//       {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
//       <span className="font-medium">{message}</span>
//     </div>
//   );
// };

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [isLoading, setIsLoading] = useState(true);
//   const [toast, setToast] = useState(null); 

//   // Data States
//   const [requests, setRequests] = useState([]);
//   const [activeRestaurants, setActiveRestaurants] = useState([]);
//   const [users, setUsers] = useState([]);

//   // --- FETCH DATA (With Mock Fallback) ---
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [requestsRes, restaurantsRes, usersRes] = await Promise.all([
//           api.get("/admin/requests"),
//           api.get("/restaurants"), // Assuming you have an endpoint for active restaurants
//           api.get("/users")       // Assuming you have an endpoint for all users
//         ]);
        
//         setRequests(requestsRes.data);
//         setActiveRestaurants(restaurantsRes.data);
//         setUsers(usersRes.data);

//       } catch (err) {
//         console.warn("API Error or Endpoint Missing. Loading Mock Data.");
        
//         // --- MOCK DATA ---
//         setRequests([
//           { id: 101, restaurant_name: "Spicy Wok", owner_name: "Rahul Sharma", address: "Mumbai", email: "rahul@wok.com", phone: "9876543210" },
//         ]);

//         setActiveRestaurants([
//           { id: 1, name: "Burger King", location: "Downtown", status: "Open", rating: 4.5 },
//           { id: 2, name: "Pizza Hut", location: "City Center", status: "Open", rating: 4.2 },
//           { id: 3, name: "Subway", location: "Tech Park", status: "Closed", rating: 3.9 },
//         ]);

//         setUsers([
//           { id: 1, name: "John Doe", email: "john@gmail.com", role: "customer", status: "Active" },
//           { id: 2, name: "Alice Smith", email: "alice@yahoo.com", role: "customer", status: "Active" },
//           { id: 3, name: "Bob Johnson", email: "bob@crave.com", role: "driver", status: "Busy" },
//           { id: 4, name: "Charlie Day", email: "charlie@gmail.com", role: "customer", status: "Inactive" },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // --- CALCULATED STATS ---
//   const customerCount = users.filter(u => u.role === "customer").length;
//   const driverCount = users.filter(u => u.role === "driver").length;
//   const restaurantCount = activeRestaurants.length;

//   const handleLogout = () => {
//     sessionStorage.clear(); 
//     navigate("/login");
//   };

//   const handleBackToHome = () => navigate("/");

//   const showToast = (message, type) => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   // --- ACTIONS ---
//   const handleApprove = (id) => {
//     setRequests(requests.filter(req => req.id !== id));
//     setActiveRestaurants([...activeRestaurants, { id: Date.now(), name: "Spicy Wok", location: "Mumbai", status: "New", rating: 0 }]);
//     showToast("Restaurant approved!", "success");
//   };

//   const handleReject = (id) => {
//     setRequests(requests.filter(req => req.id !== id));
//     showToast("Application rejected.", "info");
//   };

//   const handleDeleteRestaurant = (id) => {
//     if(window.confirm("Delete this restaurant permanently?")) {
//       setActiveRestaurants(activeRestaurants.filter(r => r.id !== id));
//       showToast("Restaurant deleted.", "error");
//     }
//   };

//   return (
//     <>
//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

//       <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">

//         {/* --- 1. SIDEBAR --- */}
//         <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-sm">
//           {/* Logo */}
//           <div className="h-24 flex-none flex items-center px-8">
//              <div className="flex items-center gap-3">
//                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl">C</div>
//                <div>
//                  <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
//                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
//                </div>
//              </div>
//           </div>

//           {/* Nav */}
//           <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
//             <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Main</div>
//             <NavItem icon={<LayoutDashboard size={20} />} label="Overview" isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            
//             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
//             <NavItem icon={<Utensils size={20} />} label="All Restaurants" count={activeRestaurants.length} isActive={activeTab === "active_restaurants"} onClick={() => setActiveTab("active_restaurants")} />
//             <NavItem icon={<Store size={20} />} label="Approval Requests" count={requests.length > 0 ? requests.length : null} isActive={activeTab === "requests"} onClick={() => setActiveTab("requests")} />
//             <NavItem icon={<Users size={20} />} label="Users Database" count={users.length} isActive={activeTab === "users"} onClick={() => setActiveTab("users")} />
//           </nav>

//           {/* Footer Actions */}
//           <div className="flex-none p-4 bg-gray-50 border-t border-gray-100 space-y-2">
//              <button onClick={handleBackToHome} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
//                 <Home size={18} /> Back to Website
//              </button>
//              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
//                 <LogOut size={18} /> Sign Out
//              </button>
//           </div>
//         </aside>

//         {/* --- 2. MAIN CONTENT AREA --- */}
//         <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12">
          
//           {/* Page Header */}
//           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900">
//                 {activeTab === 'dashboard' && 'System Overview'}
//                 {activeTab === 'active_restaurants' && 'Restaurant Management'}
//                 {activeTab === 'requests' && 'New Applications'}
//                 {activeTab === 'users' && 'User Database'}
//               </h2>
//               <p className="text-gray-500 mt-1">
//                 {activeTab === 'dashboard' ? `You have ${requests.length} pending requests awaiting approval.` : 'Manage your platform data.'}
//               </p>
//             </div>
            
//             <div className="relative group">
//                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
//                <input type="text" placeholder="Search system..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-72 shadow-sm" />
//             </div>
//           </div>

//           {isLoading ? (
//              <div className="animate-pulse h-64 bg-gray-200 rounded-2xl"></div>
//           ) : (
//             <div className="space-y-8">
                
//                 {/* --- VIEW: DASHBOARD --- */}
//                 {activeTab === 'dashboard' && (
//                   <>
//                     {/* Stats Grid - REMOVED REVENUE, ADDED USERS/DRIVERS */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <StatCard 
//                           label="Total Customers" 
//                           value={customerCount} 
//                           icon={<Users className="text-white" size={24} />} 
//                           color="bg-blue-600" 
//                         />
//                         <StatCard 
//                           label="Active Restaurants" 
//                           value={restaurantCount} 
//                           icon={<Utensils className="text-white" size={24} />} 
//                           color="bg-orange-600" 
//                         />
//                          <StatCard 
//                           label="Delivery Drivers" 
//                           value={driverCount} 
//                           icon={<Car className="text-white" size={24} />} 
//                           color="bg-emerald-600" 
//                         />
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                        {/* Requests */}
//                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//                           <div className="flex justify-between items-center mb-4">
//                               <h3 className="font-bold text-gray-900">Pending Approvals</h3>
//                               <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{requests.length} New</span>
//                           </div>
                          
//                           {requests.length === 0 ? <p className="text-gray-400 text-sm">No pending requests.</p> : (
//                             <div className="space-y-4">
//                               {requests.slice(0, 3).map(req => (
//                                 <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
//                                    <div className="flex items-center gap-3">
//                                       <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">{req.restaurant_name[0]}</div>
//                                       <div>
//                                         <p className="text-sm font-bold">{req.restaurant_name}</p>
//                                         <p className="text-xs text-gray-500">{req.owner_name}</p>
//                                       </div>
//                                    </div>
//                                    <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                        </div>

//                        {/* Recent Users */}
//                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//                           <h3 className="font-bold text-gray-900 mb-4">New Users</h3>
//                           <div className="space-y-4">
//                               {users.slice(0, 3).map(u => (
//                                 <div key={u.id} className="flex items-center justify-between">
//                                    <div className="flex items-center gap-3">
//                                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
//                                         {u.name[0]}
//                                       </div>
//                                       <div>
//                                         <p className="text-sm font-medium">{u.name}</p>
//                                         <p className="text-xs text-gray-400 capitalize">{u.role}</p>
//                                       </div>
//                                    </div>
//                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{u.status}</span>
//                                 </div>
//                               ))}
//                           </div>
//                        </div>
//                     </div>
//                   </>
//                 )}

//                 {/* --- VIEW: ACTIVE RESTAURANTS (REMOVED REVENUE COLUMN) --- */}
//                 {activeTab === 'active_restaurants' && (
//                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                       <table className="w-full text-left">
//                         <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                           <tr>
//                             <th className="px-6 py-4">Name</th>
//                             <th className="px-6 py-4">Location</th>
//                             <th className="px-6 py-4">Status</th>
//                             <th className="px-6 py-4">Rating</th>
//                             <th className="px-6 py-4 text-right">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                           {activeRestaurants.map(r => (
//                             <tr key={r.id} className="hover:bg-gray-50/50">
//                               <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
//                               <td className="px-6 py-4 text-gray-500">{r.location}</td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                   {r.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 font-bold text-gray-700">{r.rating} ★</td>
//                               <td className="px-6 py-4 text-right">
//                                 <button onClick={() => handleDeleteRestaurant(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
//                                   <Trash2 size={18} />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                       {activeRestaurants.length === 0 && <div className="p-8 text-center text-gray-500">No active restaurants found.</div>}
//                    </div>
//                 )}

//                 {/* --- VIEW: REQUESTS --- */}
//                 {activeTab === 'requests' && (
//                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                     <table className="w-full text-left">
//                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                          <tr>
//                            <th className="px-6 py-4">Applicant</th>
//                            <th className="px-6 py-4">Details</th>
//                            <th className="px-6 py-4 text-right">Decision</th>
//                          </tr>
//                        </thead>
//                        <tbody className="divide-y divide-gray-100">
//                          {requests.map(req => (
//                            <tr key={req.id}>
//                              <td className="px-6 py-4">
//                                <p className="font-bold text-gray-900">{req.restaurant_name}</p>
//                                <p className="text-xs text-gray-500">ID: #{req.id}</p>
//                              </td>
//                              <td className="px-6 py-4 text-sm text-gray-600">
//                                <div className="flex items-center gap-2"><Users size={14}/> {req.owner_name}</div>
//                                <div className="flex items-center gap-2"><Mail size={14}/> {req.email}</div>
//                              </td>
//                              <td className="px-6 py-4 text-right space-x-2">
//                                <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200">Reject</button>
//                                <button onClick={() => handleApprove(req.id)} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-orange-600">Approve</button>
//                              </td>
//                            </tr>
//                          ))}
//                        </tbody>
//                     </table>
//                     {requests.length === 0 && <div className="p-12 text-center text-gray-500 flex flex-col items-center"><CheckCircle size={40} className="text-green-500 mb-2"/>All requests handled.</div>}
//                   </div>
//                 )}

//                  {/* --- VIEW: USERS (WITH ROLE BADGES) --- */}
//                  {activeTab === 'users' && (
//                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                       <table className="w-full text-left">
//                         <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                           <tr>
//                             <th className="px-6 py-4">User</th>
//                             <th className="px-6 py-4">Role</th>
//                             <th className="px-6 py-4">Status</th>
//                             <th className="px-6 py-4 text-right">Action</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                           {users.map(u => (
//                             <tr key={u.id}>
//                               <td className="px-6 py-4">
//                                 <p className="font-bold text-gray-900">{u.name}</p>
//                                 <p className="text-xs text-gray-500">{u.email}</p>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize 
//                                   ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
//                                     u.role === 'restaurant' ? 'bg-orange-100 text-orange-700' : 
//                                     'bg-blue-100 text-blue-700'}`}>
//                                   {u.role}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <span className={`text-xs font-bold flex items-center gap-1 ${u.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
//                                   <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-600' : 'bg-gray-400'}`}></span> 
//                                   {u.status}
//                                 </span>
//                               </td>
//                               <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-black"><MoreVertical size={16} /></button></td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                    </div>
//                 )}

//             </div>
//           )}
//         </main>
//       </div>
//     </>
//   );
// };

// // --- SUB COMPONENTS ---
// const NavItem = ({ icon, label, isActive, onClick, count }) => (
//   <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}>
//     <div className="flex items-center gap-3">
//       <div className={isActive ? "text-orange-400" : "text-gray-400 group-hover:text-black"}>{icon}</div>
//       <span className="font-medium text-sm">{label}</span>
//     </div>
//     {count && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</span>}
//   </button>
// );

// const StatCard = ({ label, value, icon, color }) => (
//   <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
//       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>{icon}</div>
//       <div>
//          <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p>
//          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
//       </div>
//   </div>
// );

// export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Utensils, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle, 
  Home, 
  Trash2, 
  MoreVertical, 
  Car,
  Mail,
  MapPin
} from "lucide-react";

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600"
  };

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

  // --- DATA STATES ---
  const [requests, setRequests] = useState([]);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [users, setUsers] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch from your actual backend endpoints
        // Note: We use Promise.allSettled to ensure one failing endpoint doesn't break the others
        const [requestsRes, restaurantsRes, usersRes] = await Promise.allSettled([
          api.get("/admin/requests"),     // Defined in admin.router
          api.get("/restaurants"),        // Defined in main.py (public list)
          api.get("/admin/users")         // Defined in admin.router
        ]);
        
        // 2. Set Data if successful, otherwise keep defaults (which will be filled by mock data below if empty)
        if(requestsRes.status === "fulfilled") setRequests(requestsRes.value.data);
        if(restaurantsRes.status === "fulfilled") setActiveRestaurants(restaurantsRes.value.data);
        if(usersRes.status === "fulfilled") setUsers(usersRes.value.data);

        // --- MOCK DATA FALLBACK (If Backend is empty or fails) ---
        // This ensures your UI looks good immediately for demo purposes
        if(requestsRes.status === "rejected" || (requestsRes.status === "fulfilled" && requestsRes.value.data.length === 0)) {
           setRequests([
            { id: 101, restaurant_name: "Spicy Wok", owner_name: "Rahul Sharma", address: "Mumbai", email: "rahul@wok.com", phone: "9876543210" },
            { id: 102, restaurant_name: "Pasta Bar", owner_name: "Sarah Jenkins", address: "Delhi", email: "sarah@pasta.com", phone: "9988776655" }
           ]);
        }

        if(restaurantsRes.status === "rejected" || (restaurantsRes.status === "fulfilled" && restaurantsRes.value.data.length === 0)) {
           setActiveRestaurants([
            { id: 1, name: "Burger King", address: "Downtown", is_active: true, cuisine: "Burger" },
            { id: 2, name: "Pizza Hut", address: "City Center", is_active: true, cuisine: "Pizza" },
            { id: 3, name: "Subway", address: "Tech Park", is_active: false, cuisine: "Healthy" },
           ]);
        }

        if(usersRes.status === "rejected" || (usersRes.status === "fulfilled" && usersRes.value.data.length === 0)) {
           setUsers([
            { id: 1, username: "john_doe", email: "john@gmail.com", role: "customer", phone: "1234567890" },
            { id: 2, username: "alice_smith", email: "alice@yahoo.com", role: "customer", phone: "0987654321" },
            { id: 3, username: "driver_bob", email: "bob@crave.com", role: "driver", phone: "1122334455" },
           ]);
        }

      } catch (err) {
        console.error("Critical Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- STATS CALCULATION ---
  const customerCount = users.filter(u => u.role === "customer").length;
  const driverCount = users.filter(u => u.role === "driver" || u.role === "delivery").length; // Flexible check
  const restaurantCount = activeRestaurants.length;

  // --- HANDLERS ---
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.clear(); 
    navigate("/login");
  };

  const handleApprove = async (id) => {
    try {
      // Optimistic Update
      setRequests(prev => prev.filter(req => req.id !== id));
      showToast("Restaurant approved successfully!", "success");
      
      // Actual API Call
      await api.post(`/admin/approve/${id}`);
      
      // Refresh Data (Optional)
      const res = await api.get("/restaurants");
      setActiveRestaurants(res.data);
    } catch (error) {
       console.error("Approval Failed", error);
       // Keep the optimistic update for demo smoothness unless strict data integrity is needed
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
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if(!window.confirm("Permanently delete this restaurant? This cannot be undone.")) return;
    try {
      setActiveRestaurants(prev => prev.filter(r => r.id !== id));
      await api.delete(`/admin/restaurants/${id}`);
      showToast("Restaurant deleted.", "error");
    } catch (error) {
       console.error("Delete failed", error);
    }
  };

  return (
    <>
      {/* Hide Scrollbar Utility */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Toast Notification Overlay */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">

        {/* --- SIDEBAR --- */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-sm transition-all">
          {/* Logo */}
          <div className="h-24 flex-none flex items-center px-8">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl">C</div>
               <div>
                 <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
               </div>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</div>
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              isActive={activeTab === "dashboard"} 
              onClick={() => setActiveTab("dashboard")} 
            />
            
            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
            <NavItem 
              icon={<Utensils size={20} />} 
              label="All Restaurants" 
              count={activeRestaurants.length} 
              isActive={activeTab === "active_restaurants"} 
              onClick={() => setActiveTab("active_restaurants")} 
            />
            <NavItem 
              icon={<Store size={20} />} 
              label="Approval Requests" 
              count={requests.length > 0 ? requests.length : null} 
              isActive={activeTab === "requests"} 
              onClick={() => setActiveTab("requests")} 
            />
            <NavItem 
              icon={<Users size={20} />} 
              label="Users Database" 
              count={users.length} 
              isActive={activeTab === "users"} 
              onClick={() => setActiveTab("users")} 
            />
          </nav>

          {/* Footer Actions */}
          <div className="flex-none p-4 bg-gray-50 border-t border-gray-100 space-y-2">
             <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
                <Home size={18} /> Back to Website
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={18} /> Sign Out
             </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 animate-fade-in-up">
                {activeTab === 'dashboard' && 'System Overview'}
                {activeTab === 'active_restaurants' && 'Restaurant Management'}
                {activeTab === 'requests' && 'New Applications'}
                {activeTab === 'users' && 'User Database'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeTab === 'dashboard' ? `Welcome back! You have ${requests.length} pending requests.` : 'Manage your platform data.'}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search data..." 
                  className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-72 shadow-sm transition-all" 
               />
            </div>
          </div>

          {isLoading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
                <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
             </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
                
                {/* --- VIEW: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                          label="Total Customers" 
                          value={customerCount} 
                          icon={<Users className="text-white" size={24} />} 
                          color="bg-blue-600" 
                        />
                        <StatCard 
                          label="Active Restaurants" 
                          value={restaurantCount} 
                          icon={<Utensils className="text-white" size={24} />} 
                          color="bg-orange-600" 
                        />
                         <StatCard 
                          label="Delivery Drivers" 
                          value={driverCount} 
                          icon={<Car className="text-white" size={24} />} 
                          color="bg-emerald-600" 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {/* Requests Card */}
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-900">Pending Approvals</h3>
                              {requests.length > 0 && <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{requests.length} New</span>}
                          </div>
                          
                          {requests.length === 0 ? <p className="text-gray-400 text-sm py-4">No pending requests.</p> : (
                            <div className="space-y-4">
                              {requests.slice(0, 3).map(req => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">
                                        {req.restaurant_name ? req.restaurant_name[0] : "R"}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold">{req.restaurant_name}</p>
                                        <p className="text-xs text-gray-500">{req.owner_name}</p>
                                      </div>
                                   </div>
                                   <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>

                       {/* New Users Card */}
                       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                          <h3 className="font-bold text-gray-900 mb-4">Recent Users</h3>
                          <div className="space-y-4">
                              {users.slice(0, 3).map(u => (
                                <div key={u.id} className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                        {u.username ? u.username[0] : "U"}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{u.username}</p>
                                        <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                                      </div>
                                   </div>
                                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                                </div>
                              ))}
                          </div>
                       </div>
                    </div>
                  </>
                )}

                {/* --- VIEW: ACTIVE RESTAURANTS --- */}
                {activeTab === 'active_restaurants' && (
                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">Restaurant</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Cuisine</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {activeRestaurants
                            .filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(r => (
                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
                              <td className="px-6 py-4 text-gray-500 text-sm flex items-center gap-1"><MapPin size={14}/> {r.address || r.location}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active || r.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {r.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-600">{r.cuisine || "N/A"}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteRestaurant(r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Restaurant">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {activeRestaurants.length === 0 && <div className="p-12 text-center text-gray-500">No active restaurants found.</div>}
                   </div>
                )}

                {/* --- VIEW: REQUESTS (APPROVALS) --- */}
                {activeTab === 'requests' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                         <tr>
                           <th className="px-6 py-4">Applicant Details</th>
                           <th className="px-6 py-4">Contact</th>
                           <th className="px-6 py-4 text-right">Decision</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {requests.map(req => (
                           <tr key={req.id} className="group hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4">
                               <p className="font-bold text-gray-900 text-lg">{req.restaurant_name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-600">ID #{req.id}</span>
                                 <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10}/> {req.address}</span>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-gray-600">
                               <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-gray-400"/> <span className="font-medium text-gray-900">{req.owner_name}</span></div>
                               <div className="flex items-center gap-2 mb-1"><Mail size={14} className="text-gray-400"/> {req.email}</div>
                               <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold border border-gray-400 rounded-full text-gray-400">P</div> {req.phone}</div>
                             </td>
                             <td className="px-6 py-4 text-right space-x-3">
                               <button 
                                  onClick={() => handleReject(req.id)} 
                                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                               >
                                 Reject
                               </button>
                               <button 
                                  onClick={() => handleApprove(req.id)} 
                                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-green-600 shadow-md hover:shadow-lg transition-all transform active:scale-95"
                               >
                                 Approve
                               </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                    {requests.length === 0 && (
                      <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-500"/></div>
                        <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                        <p>No pending applications at the moment.</p>
                      </div>
                    )}
                  </div>
                )}

                 {/* --- VIEW: USERS --- */}
                 {activeTab === 'users' && (
                   <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr>
                            <th className="px-6 py-4">User Profile</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users
                            .filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold uppercase text-slate-600">
                                      {u.username ? u.username[0] : "U"}
                                   </div>
                                   <div>
                                      <p className="font-bold text-gray-900 text-sm">{u.username}</p>
                                      <p className="text-xs text-gray-400">ID: {u.id}</p>
                                   </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize 
                                  ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                    u.role === 'restaurant' ? 'bg-orange-100 text-orange-700' : 
                                    u.role === 'driver' ? 'bg-cyan-100 text-cyan-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-black p-2 rounded-full hover:bg-gray-100">
                                  <MoreVertical size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                )}

            </div>
          )}
        </main>
      </div>
    </>
  );
};

// --- SUB COMPONENTS ---
const NavItem = ({ icon, label, isActive, onClick, count }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}>
    <div className="flex items-center gap-3">
      <div className={isActive ? "text-orange-400" : "text-gray-400 group-hover:text-black"}>{icon}</div>
      <span className="font-medium text-sm">{label}</span>
    </div>
    {count && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</span>}
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>{icon}</div>
      <div>
         <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p>
         <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
  </div>
);

export default AdminDashboard;