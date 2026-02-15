// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import {
//   LayoutDashboard, Users, Store, Utensils, LogOut, Search,
//   CheckCircle, XCircle, Home, Trash2, MoreVertical, Bike,
//   Ban, Clock, FileText, MapPin, Bell, X, DollarSign, Star, Calendar
// } from "lucide-react";

// // --- TOAST COMPONENT ---
// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const bgColors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };

//   return (
//     <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce-in`}>
//       {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
//       <span className="font-medium">{message}</span>
//     </div>
//   );
// };

// // --- DETAIL MODAL COMPONENT ---
// const DetailModal = ({ data, type, onClose }) => {
//   if (!data) return null;

//   // Mock data generator for demonstration (since backend might not provide deep stats yet)
//   const mockStats = {
//     totalSpent: "₹12,450",
//     lastOrder: "2 days ago",
//     rating: 4.8,
//     earnings: "₹45,200",
//     ordersCompleted: 142,
//     joinDate: "Jan 12, 2024"
//   };

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
//         {/* Header */}
//         <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
//           <div className="flex gap-4 items-center">
//             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${type === 'restaurant' ? 'bg-orange-500' : type === 'rider' ? 'bg-cyan-500' : 'bg-blue-500'}`}>
//               {data.name ? data.name[0] : data.username ? data.username[0] : "?"}
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">{data.name || data.username || data.restaurant_name}</h2>
//               <p className="text-slate-400 text-sm uppercase tracking-wider font-bold">{type}</p>
//               <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
//                 <span className="px-2 py-0.5 rounded bg-white/20">ID: {data.id}</span>
//                 <span>• {mockStats.joinDate}</span>
//               </div>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X size={20} /></button>
//         </div>

//         {/* Body */}
//         <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

//           {/* Column 1: Contact & Info */}
//           <div className="space-y-6">
//             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Details</h3>

//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gray-50 rounded-lg"><Users size={18} className="text-gray-500" /></div>
//                 <div><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-900">{data.email}</p></div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-gray-50 rounded-lg"><MapPin size={18} className="text-gray-500" /></div>
//                 <div><p className="text-xs text-gray-400">Location/Address</p><p className="font-medium text-gray-900">{data.address || data.city || "Not Provided"}</p></div>
//               </div>
//               {type === 'rider' && (
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gray-50 rounded-lg"><Bike size={18} className="text-gray-500" /></div>
//                   <div><p className="text-xs text-gray-400">Vehicle</p><p className="font-medium text-gray-900 capitalize">{data.vehicleType || "Motorcycle"}</p></div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Column 2: Stats & Activity */}
//           <div className="space-y-6">
//             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Activity</h3>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 bg-gray-50 rounded-2xl">
//                 <DollarSign className="text-green-600 mb-2" size={20} />
//                 <p className="text-xs text-gray-500">{type === 'customer' ? 'Total Spent' : 'Total Earnings'}</p>
//                 <p className="text-xl font-bold text-gray-900">{type === 'customer' ? mockStats.totalSpent : mockStats.earnings}</p>
//               </div>
//               <div className="p-4 bg-gray-50 rounded-2xl">
//                 <Star className="text-orange-500 mb-2" size={20} />
//                 <p className="text-xs text-gray-500">Rating</p>
//                 <p className="text-xl font-bold text-gray-900">{mockStats.rating} <span className="text-xs text-gray-400 font-normal">/ 5.0</span></p>
//               </div>
//             </div>

//             {type === 'restaurant' && (
//               <div className="p-4 border border-gray-100 rounded-xl">
//                 <p className="text-sm font-bold text-gray-900 mb-2">Top Menu Items</p>
//                 <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
//                   <li>Butter Chicken</li>
//                   <li>Garlic Naan</li>
//                   <li>Paneer Tikka</li>
//                 </ul>
//               </div>
//             )}
//             {type === 'customer' && (
//               <div className="p-4 border border-gray-100 rounded-xl">
//                 <p className="text-sm font-bold text-gray-900 mb-2">Recent Order</p>
//                 <p className="text-sm text-gray-600">2x Pizza, 1x Coke from <strong>Domino's</strong></p>
//                 <p className="text-xs text-gray-400 mt-1">{mockStats.lastOrder}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
//           <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Close</button>
//           <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">View Full History</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [requestSubTab, setRequestSubTab] = useState("restaurant");
//   const [isLoading, setIsLoading] = useState(true);
//   const [toast, setToast] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Notification State
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);

//   // Detail Modal State
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [detailType, setDetailType] = useState(null); // 'restaurant', 'rider', 'customer'

//   // Data States
//   const [restaurantRequests, setRestaurantRequests] = useState([]);
//   const [riderRequests, setRiderRequests] = useState([]);
//   const [activeRestaurants, setActiveRestaurants] = useState([]);
//   const [users, setUsers] = useState([]);

//   // --- FETCH DATA ---
//   const fetchData = async (isPolling = false) => {
//     try {
//       const [reqRes, riderReqRes, restaurantsRes, usersRes] = await Promise.allSettled([
//         api.get("/admin/requests"),
//         api.get("/admin/rider-requests"),
//         api.get("/restaurants"),
//         api.get("/admin/users")
//       ]);

//       if (reqRes.status === "fulfilled") setRestaurantRequests(reqRes.value.data);
//       if (riderReqRes.status === "fulfilled") setRiderRequests(riderReqRes.value.data);
//       if (restaurantsRes.status === "fulfilled") setActiveRestaurants(restaurantsRes.value.data);
//       if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);

//       // Notification Logic
//       if (reqRes.status === "fulfilled" && riderReqRes.status === "fulfilled") {
//         const newNotes = [];
//         if (reqRes.value.data.length > 0) newNotes.push({ id: 1, text: `${reqRes.value.data.length} Pending Restaurants`, type: 'alert' });
//         if (riderReqRes.value.data.length > 0) newNotes.push({ id: 2, text: `${riderReqRes.value.data.length} Pending Riders`, type: 'info' });
//         setNotifications(newNotes);
//       }

//     } catch (err) {
//       console.error("Critical Error fetching data:", err);
//     } finally {
//       if (!isPolling) setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     // POLLING: Check for new data every 30 seconds
//     const interval = setInterval(() => {
//       fetchData(true);
//     }, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Filter Data
//   const customerList = users.filter(u => u.role === "customer");
//   const riderList = users.filter(u => u.role === "driver" || u.role === "rider");

//   // Stats
//   const customerCount = customerList.length;
//   const driverCount = riderList.length;
//   const restaurantCount = activeRestaurants.length;
//   const totalPending = restaurantRequests.length + riderRequests.length;

//   const showToast = (message, type) => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const handleLogout = () => {
//     sessionStorage.clear();
//     localStorage.clear();
//     navigate("/login");
//   };

//   // --- MODAL HANDLER ---
//   const openDetailModal = (item, type) => {
//     setSelectedItem(item);
//     setDetailType(type);
//   };

//   // --- ACTIONS ---
//   const handleApproveRestaurant = async (e, id) => {
//     e.stopPropagation(); // Prevent row click
//     try {
//       setRestaurantRequests(prev => prev.filter(req => req.id !== id));
//       showToast("Restaurant Approved!", "success");
//       await api.post(`/admin/approve/${id}`);
//       fetchData(true); // Refresh list
//     } catch (error) {
//       showToast("Failed to approve.", "error");
//     }
//   };

//   const handleRejectRestaurant = async (e, id) => {
//     e.stopPropagation();
//     if (!window.confirm("Reject this application?")) return;
//     try {
//       setRestaurantRequests(prev => prev.filter(req => req.id !== id));
//       await api.post(`/admin/reject/${id}`);
//       showToast("Application rejected.", "info");
//     } catch (error) {
//       showToast("Failed to reject.", "error");
//     }
//   };

//   const handleApproveRider = async (e, id) => {
//     e.stopPropagation();
//     try {
//       setRiderRequests(prev => prev.filter(req => req.id !== id));
//       showToast("Rider Approved & Created!", "success");
//       await api.post(`/admin/rider-approve/${id}`);
//       fetchData(true);
//     } catch (error) {
//       console.error(error);
//       showToast("Failed to approve rider.", "error");
//     }
//   };

//   const handleRejectRider = async (e, id) => {
//     e.stopPropagation();
//     if (!window.confirm("Reject this rider application?")) return;
//     try {
//       setRiderRequests(prev => prev.filter(req => req.id !== id));
//       await api.post(`/admin/rider-reject/${id}`);
//       showToast("Rider application rejected.", "info");
//     } catch (error) {
//       showToast("Failed to reject.", "error");
//     }
//   };

//   const handleDeleteRestaurant = async (e, id) => {
//     e.stopPropagation();
//     if (!window.confirm("Permanently delete?")) return;
//     try {
//       setActiveRestaurants(prev => prev.filter(r => r.id !== id));
//       await api.delete(`/admin/restaurants/${id}`);
//       showToast("Restaurant deleted.", "error");
//     } catch (error) {
//       showToast("Failed to delete.", "error");
//     }
//   };

//   const handleSuspendUser = async (e, userId) => {
//     e.stopPropagation();
//     if (!window.confirm("Suspend user for 7 Days?")) return;
//     showToast("User suspended.", "info");
//   };

//   const handleTerminateUser = async (e, userId) => {
//     e.stopPropagation();
//     if (!window.confirm("Terminate account?")) return;
//     try {
//       setUsers(users.filter(u => u.id !== userId));
//       showToast("Account terminated.", "error");
//     } catch (error) {
//       showToast("Failed to terminate.", "error");
//     }
//   };

//   return (
//     <>
//       <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

//       {/* Toast Notification */}
//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

//       {/* Detail Modal */}
//       {selectedItem && <DetailModal data={selectedItem} type={detailType} onClose={() => setSelectedItem(null)} />}

//       <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
//         {/* SIDEBAR */}
//         <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-30 shadow-sm transition-all">
//           <div className="h-24 flex-none flex items-center px-8">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl">C</div>
//               <div>
//                 <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
//                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
//               </div>
//             </div>
//           </div>

//           <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
//             <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</div>
//             <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />

//             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
//             <NavItem icon={<Utensils size={20} />} label="All Restaurants" count={activeRestaurants.length} isActive={activeTab === "active_restaurants"} onClick={() => setActiveTab("active_restaurants")} />
//             <NavItem icon={<FileText size={20} />} label="Requests" count={totalPending > 0 ? totalPending : null} isActive={activeTab === "requests"} onClick={() => setActiveTab("requests")} />

//             <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">People</div>
//             <NavItem icon={<Bike size={20} />} label="All Riders" count={driverCount} isActive={activeTab === "riders"} onClick={() => setActiveTab("riders")} />
//             <NavItem icon={<Users size={20} />} label="All Customers" count={customerCount} isActive={activeTab === "customers"} onClick={() => setActiveTab("customers")} />
//           </nav>

//           <div className="flex-none p-4 bg-gray-50 border-t border-gray-100 space-y-2">
//             <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
//               <Home size={18} /> Back to Website
//             </button>
//             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
//               <LogOut size={18} /> Sign Out
//             </button>
//           </div>
//         </aside>

//         {/* MAIN CONTENT */}
//         <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12 relative">

//           {/* HEADER: Title + Search + Notification */}
//           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900">
//                 {activeTab === 'dashboard' && 'System Overview'}
//                 {activeTab === 'active_restaurants' && 'Restaurant Management'}
//                 {activeTab === 'requests' && 'New Applications'}
//                 {activeTab === 'riders' && 'Delivery Fleet'}
//                 {activeTab === 'customers' && 'Customer Database'}
//               </h2>
//               <p className="text-gray-500 mt-1">
//                 {activeTab === 'dashboard' ? `You have ${totalPending} pending requests.` : 'Manage your platform data.'}
//               </p>
//             </div>

//             <div className="flex items-center gap-4">
//               {/* NOTIFICATION CENTER */}
//               <div className="relative">
//                 <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:shadow-md transition-all relative">
//                   <Bell size={20} />
//                   {totalPending > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
//                 </button>

//                 {/* Dropdown */}
//                 {showNotifications && (
//                   <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
//                     <div className="p-4 border-b border-gray-100 flex justify-between items-center">
//                       <span className="font-bold text-sm">Notifications</span>
//                       <span className="text-xs text-orange-500 font-bold">{notifications.length} New</span>
//                     </div>
//                     <div className="max-h-64 overflow-y-auto">
//                       {notifications.length === 0 ? (
//                         <div className="p-6 text-center text-gray-400 text-xs">No new alerts</div>
//                       ) : (
//                         notifications.map(n => (
//                           <div key={n.id} onClick={() => { setActiveTab('requests'); setShowNotifications(false); }} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
//                             <p className="text-sm font-medium text-gray-800">{n.text}</p>
//                             <p className="text-xs text-gray-400 mt-1">Just now</p>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="relative group">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
//                 <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-64 shadow-sm transition-all" />
//               </div>
//             </div>
//           </div>

//           {isLoading ? (
//             <div className="animate-pulse space-y-4">
//               <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
//               <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
//             </div>
//           ) : (
//             <div className="space-y-8 animate-fade-in">

//               {/* 1. DASHBOARD */}
//               {activeTab === 'dashboard' && (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <StatCard label="Total Customers" value={customerCount} icon={<Users className="text-white" size={24} />} color="bg-blue-600" />
//                     <StatCard label="Active Restaurants" value={restaurantCount} icon={<Utensils className="text-white" size={24} />} color="bg-orange-600" />
//                     <StatCard label="All Riders" value={driverCount} icon={<Bike className="text-white" size={24} />} color="bg-emerald-600" />
//                   </div>

//                   <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
//                     <h3 className="font-bold text-gray-900 mb-4">Pending Approvals (Restaurants)</h3>
//                     {restaurantRequests.length === 0 ? <p className="text-gray-400 text-sm">No pending restaurant requests.</p> : (
//                       <div className="space-y-4">
//                         {restaurantRequests.slice(0, 3).map(req => (
//                           <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">{req.restaurant_name ? req.restaurant_name[0] : "R"}</div>
//                               <div><p className="text-sm font-bold">{req.restaurant_name}</p><p className="text-xs text-gray-500">{req.owner_name}</p></div>
//                             </div>
//                             <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}

//               {/* 2. ACTIVE RESTAURANTS */}
//               {activeTab === 'active_restaurants' && (
//                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                   <table className="w-full text-left">
//                     <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                       <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {activeRestaurants.filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
//                         <tr key={r.id} onClick={() => openDetailModal(r, 'restaurant')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
//                           <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
//                           <td className="px-6 py-4 text-gray-500 text-sm">{r.address || r.location || "N/A"}</td>
//                           <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.is_active ? "Active" : "Inactive"}</span></td>
//                           <td className="px-6 py-4 text-right">
//                             <button onClick={(e) => handleDeleteRestaurant(e, r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* 3. REQUESTS */}
//               {activeTab === 'requests' && (
//                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                   <div className="flex border-b border-gray-100">
//                     <button onClick={() => setRequestSubTab('restaurant')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'restaurant' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
//                       <Store size={18} /> Restaurant ({restaurantRequests.length})
//                     </button>
//                     <button onClick={() => setRequestSubTab('rider')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'rider' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
//                       <Bike size={18} /> Rider ({riderRequests.length})
//                     </button>
//                   </div>

//                   {/* RESTAURANT TABLE */}
//                   {requestSubTab === 'restaurant' && (
//                     <table className="w-full text-left">
//                       <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                         <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Owner Info</th><th className="px-6 py-4 text-right">Decision</th></tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {restaurantRequests.map(req => (
//                           <tr key={req.id}>
//                             <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.restaurant_name}</p><span className="text-xs text-gray-400">{req.address}</span></td>
//                             <td className="px-6 py-4 text-sm text-gray-600"><div>{req.owner_name}</div><div className="text-xs">{req.email}</div></td>
//                             <td className="px-6 py-4 text-right space-x-3">
//                               <button onClick={(e) => handleRejectRestaurant(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600">Reject</button>
//                               <button onClick={(e) => handleApproveRestaurant(e, req.id)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-gray-800">Approve</button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}

//                   {/* RIDER TABLE */}
//                   {requestSubTab === 'rider' && (
//                     <table className="w-full text-left">
//                       <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                         <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-right">Decision</th></tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {riderRequests.map(req => (
//                           <tr key={req.id}>
//                             <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.fullName}</p></td>
//                             <td className="px-6 py-4"><span className="capitalize px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">{req.vehicleType || "Bike"}</span></td>
//                             <td className="px-6 py-4 text-sm text-gray-600"><div>{req.email}</div><div className="text-xs font-bold flex items-center gap-1"><MapPin size={10} /> {req.city}</div></td>
//                             <td className="px-6 py-4 text-right space-x-3">
//                               <button onClick={(e) => handleRejectRider(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600">Reject</button>
//                               <button onClick={(e) => handleApproveRider(e, req.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Approve</button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                   {(requestSubTab === 'restaurant' && restaurantRequests.length === 0) && <div className="p-16 text-center text-gray-500">No pending restaurant applications.</div>}
//                   {(requestSubTab === 'rider' && riderRequests.length === 0) && <div className="p-16 text-center text-gray-500">No pending rider applications.</div>}
//                 </div>
//               )}

//               {/* 4. RIDERS (EXISTING FLEET) */}
//               {activeTab === 'riders' && (
//                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                   <table className="w-full text-left">
//                     <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                       <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Action</th></tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {riderList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
//                         <tr key={u.id} onClick={() => openDetailModal(u, 'rider')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
//                           <td className="px-6 py-4 flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">{u.username ? u.username[0] : "R"}</div>
//                             <div><p className="font-bold text-sm">{u.username || "Unknown"}</p><p className="text-xs text-gray-400">ID: {u.id}</p></div>
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
//                           <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-cyan-100 text-cyan-700">Rider</span></td>
//                           <td className="px-6 py-4 text-right"><MoreVertical size={16} className="text-gray-400" /></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {riderList.length === 0 && <div className="p-12 text-center text-gray-500">No riders found.</div>}
//                 </div>
//               )}

//               {/* 5. CUSTOMERS */}
//               {activeTab === 'customers' && (
//                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//                   <table className="w-full text-left">
//                     <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//                       <tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {customerList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
//                         <tr key={u.id} onClick={() => openDetailModal(u, 'customer')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
//                           <td className="px-6 py-4 flex items-center gap-3">
//                             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{u.username ? u.username[0] : "C"}</div>
//                             <p className="font-bold text-sm">{u.username || "Unknown"}</p>
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
//                           <td className="px-6 py-4 text-sm text-gray-600">{u.phone || "N/A"}</td>
//                           <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">Active</span></td>
//                           <td className="px-6 py-4 text-right">
//                             <div className="flex items-center justify-end gap-2">
//                               <button onClick={(e) => handleSuspendUser(e, u.id)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Clock size={18} /></button>
//                               <button onClick={(e) => handleTerminateUser(e, u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Ban size={18} /></button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {customerList.length === 0 && <div className="p-12 text-center text-gray-500">No customers found.</div>}
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </>
//   );
// };

// const NavItem = ({ icon, label, isActive, onClick, count }) => (
//   <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}>
//     <div className="flex items-center gap-3"><div className={isActive ? "text-orange-400" : "text-gray-400 group-hover:text-black"}>{icon}</div><span className="font-medium text-sm">{label}</span></div>
//     {count !== undefined && count !== null && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>{count}</span>}
//   </button>
// );

// const StatCard = ({ label, value, icon, color }) => (
//   <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
//     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${color}`}>{icon}</div>
//     <div><p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p><h4 className="text-2xl font-bold text-gray-900">{value}</h4></div>
//   </div>
// );

// export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard, Users, Store, Utensils, LogOut, Search,
  CheckCircle, XCircle, Home, Trash2, MoreVertical, Bike,
  Ban, Clock, FileText, MapPin, Bell, X, DollarSign, Star,
  MessageSquare, Send
} from "lucide-react";

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = { success: "bg-emerald-600", error: "bg-red-600", info: "bg-blue-600" };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[100] animate-bounce-in`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// --- DETAIL MODAL COMPONENT ---
const DetailModal = ({ data, type, onClose }) => {
  if (!data) return null;

  const mockStats = {
    totalSpent: "₹12,450",
    lastOrder: "2 days ago",
    rating: 4.8,
    earnings: "₹45,200",
    ordersCompleted: 142,
    joinDate: "Jan 12, 2024"
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
          <div className="flex gap-4 items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${type === 'restaurant' ? 'bg-orange-500' : type === 'rider' ? 'bg-cyan-500' : 'bg-blue-500'}`}>
              {data.name ? data.name[0] : data.username ? data.username[0] : "?"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{data.name || data.username || data.restaurant_name}</h2>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-bold">{type}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded bg-white/20">ID: {data.id}</span>
                <span>• {mockStats.joinDate}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><Users size={18} className="text-gray-500" /></div>
                <div><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-900">{data.email}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><MapPin size={18} className="text-gray-500" /></div>
                <div><p className="text-xs text-gray-400">Location/Address</p><p className="font-medium text-gray-900">{data.address || data.city || "Not Provided"}</p></div>
              </div>
              {type === 'rider' && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg"><Bike size={18} className="text-gray-500" /></div>
                  <div><p className="text-xs text-gray-400">Vehicle</p><p className="font-medium text-gray-900 capitalize">{data.vehicleType || "Motorcycle"}</p></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <DollarSign className="text-green-600 mb-2" size={20} />
                <p className="text-xs text-gray-500">{type === 'customer' ? 'Total Spent' : 'Total Earnings'}</p>
                <p className="text-xl font-bold text-gray-900">{type === 'customer' ? mockStats.totalSpent : mockStats.earnings}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Star className="text-orange-500 mb-2" size={20} />
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-xl font-bold text-gray-900">{mockStats.rating} <span className="text-xs text-gray-400 font-normal">/ 5.0</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Close</button>
          <button className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">View Full History</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requestSubTab, setRequestSubTab] = useState("restaurant");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null);

  // Data States
  const [restaurantRequests, setRestaurantRequests] = useState([]);
  const [riderRequests, setRiderRequests] = useState([]);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  
  // --- MESSAGE STATES ---
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // --- FETCH DATA & NOTIFICATIONS ---
  const fetchData = async (isPolling = false) => {
    try {
      const [reqRes, riderReqRes, restaurantsRes, usersRes, messagesRes] = await Promise.allSettled([
        api.get("/admin/requests"),
        api.get("/admin/rider-requests"),
        api.get("/restaurants"),
        api.get("/admin/users"),
        api.get("/api/admin/messages")
      ]);

      if (reqRes.status === "fulfilled") setRestaurantRequests(reqRes.value.data);
      if (riderReqRes.status === "fulfilled") setRiderRequests(riderReqRes.value.data);
      if (restaurantsRes.status === "fulfilled") setActiveRestaurants(restaurantsRes.value.data);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
      if (messagesRes.status === "fulfilled") setMessages(messagesRes.value.data);

      // --- SMART NOTIFICATION LOGIC ---
      if (reqRes.status === "fulfilled" && riderReqRes.status === "fulfilled") {
        const newNotes = [];
        
        // 1. Restaurant Notification -> Redirects to 'requests' / 'restaurant'
        if (reqRes.value.data.length > 0) {
            newNotes.push({ 
                id: 1, 
                text: `${reqRes.value.data.length} Pending Restaurants`, 
                type: 'alert', 
                targetTab: 'requests', 
                targetSubTab: 'restaurant' 
            });
        }

        // 2. Rider Notification -> Redirects to 'requests' / 'rider'
        if (riderReqRes.value.data.length > 0) {
            newNotes.push({ 
                id: 2, 
                text: `${riderReqRes.value.data.length} Pending Riders`, 
                type: 'info', 
                targetTab: 'requests', 
                targetSubTab: 'rider' 
            });
        }
        
        // 3. Message Notification -> Redirects to 'messages'
        // THIS IS THE PART THAT HANDLES "1 Unread Messages"
        const pendingMessages = messagesRes.status === "fulfilled" ? messagesRes.value.data.filter(m => m.status === 'pending').length : 0;
        if (pendingMessages > 0) {
            newNotes.push({ 
                id: 3, 
                text: `${pendingMessages} Unread Messages`, 
                type: 'info', 
                targetTab: 'messages' // <--- Tells dashboard to open "messages" tab
            });
        }

        setNotifications(newNotes);
      }

    } catch (err) {
      console.error("Critical Error fetching data:", err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter Data
  const customerList = users.filter(u => u.role === "customer");
  const riderList = users.filter(u => u.role === "driver" || u.role === "rider");
  const customerCount = customerList.length;
  const driverCount = riderList.length;
  const restaurantCount = activeRestaurants.length;
  const totalPending = restaurantRequests.length + riderRequests.length;
  const unreadMessagesCount = messages.filter(m => m.status === 'pending').length;

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/login");
  };

  const openDetailModal = (item, type) => {
    setSelectedItem(item);
    setDetailType(type);
  };

  // --- ACTIONS ---
  const handleApproveRestaurant = async (e, id) => {
    e.stopPropagation();
    try {
      setRestaurantRequests(prev => prev.filter(req => req.id !== id));
      showToast("Restaurant Approved!", "success");
      await api.post(`/admin/approve/${id}`);
      fetchData(true);
    } catch (error) {
      showToast("Failed to approve.", "error");
    }
  };

  const handleRejectRestaurant = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Reject this application?")) return;
    try {
      setRestaurantRequests(prev => prev.filter(req => req.id !== id));
      await api.post(`/admin/reject/${id}`);
      showToast("Application rejected.", "info");
    } catch (error) {
      showToast("Failed to reject.", "error");
    }
  };

  const handleApproveRider = async (e, id) => {
    e.stopPropagation();
    try {
      setRiderRequests(prev => prev.filter(req => req.id !== id));
      showToast("Rider Approved & Created!", "success");
      await api.post(`/admin/rider-approve/${id}`);
      fetchData(true);
    } catch (error) {
      showToast("Failed to approve rider.", "error");
    }
  };

  const handleRejectRider = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Reject this rider application?")) return;
    try {
      setRiderRequests(prev => prev.filter(req => req.id !== id));
      await api.post(`/admin/rider-reject/${id}`);
      showToast("Rider application rejected.", "info");
    } catch (error) {
      showToast("Failed to reject.", "error");
    }
  };

  const handleDeleteRestaurant = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete?")) return;
    try {
      setActiveRestaurants(prev => prev.filter(r => r.id !== id));
      await api.delete(`/admin/restaurants/${id}`);
      showToast("Restaurant deleted.", "error");
    } catch (error) {
      showToast("Failed to delete.", "error");
    }
  };

  const handleSuspendUser = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Suspend user for 7 Days?")) return;
    showToast("User suspended.", "info");
  };

  const handleTerminateUser = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm("Terminate account?")) return;
    try {
      setUsers(users.filter(u => u.id !== userId));
      showToast("Account terminated.", "error");
    } catch (error) {
      showToast("Failed to terminate.", "error");
    }
  };

  // --- HANDLE SEND REPLY ---
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      showToast("Reply cannot be empty", "error");
      return;
    }
    
    setIsSendingReply(true);
    try {
      await api.post(`/api/admin/reply/${replyingTo}`, { 
        reply_message: replyText 
      });

      showToast("Reply Sent to User!", "success");
      setReplyingTo(null);
      setReplyText("");
      fetchData(true);
    } catch (error) {
      console.error(error);
      showToast("❌ Failed to send reply", "error");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Detail Modal */}
      {selectedItem && <DetailModal data={selectedItem} type={detailType} onClose={() => setSelectedItem(null)} />}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send size={20} className="text-orange-600"/> Send Reply
            </h3>
            <textarea
              rows="5"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none bg-gray-50"
              placeholder="Type your reply here. It will be emailed to the user..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSendingReply}
            ></textarea>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => { setReplyingTo(null); setReplyText(""); }} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
                disabled={isSendingReply}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendReply} 
                className={`px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 flex items-center gap-2 transition-all ${isSendingReply ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSendingReply}
              >
                {isSendingReply ? 'Sending...' : 'Send Email'} <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
            <NavItem icon={<FileText size={20} />} label="Requests" count={totalPending > 0 ? totalPending : null} isActive={activeTab === "requests"} onClick={() => setActiveTab("requests")} />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</div>
            <NavItem 
              icon={<MessageSquare size={20} />} 
              label="Messages" 
              count={unreadMessagesCount > 0 ? unreadMessagesCount : null} 
              isActive={activeTab === "messages"} 
              onClick={() => setActiveTab("messages")} 
            />

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
        <main className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#F8F9FA] p-8 md:p-12 relative">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'System Overview'}
                {activeTab === 'active_restaurants' && 'Restaurant Management'}
                {activeTab === 'requests' && 'New Applications'}
                {activeTab === 'riders' && 'Delivery Fleet'}
                {activeTab === 'customers' && 'Customer Database'}
                {activeTab === 'messages' && 'Support Messages'}
              </h2>
              <p className="text-gray-500 mt-1">
                {activeTab === 'dashboard' ? `You have ${totalPending} pending requests.` : 'Manage your platform data.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* NOTIFICATION CENTER */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:shadow-md transition-all relative">
                  <Bell size={20} />
                  {(totalPending > 0 || unreadMessagesCount > 0) && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      <span className="text-xs text-orange-500 font-bold">{notifications.length} New</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-xs">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} 
                            // --- CLICK HANDLER FOR NOTIFICATIONS ---
                            onClick={() => { 
                                setActiveTab(n.targetTab); 
                                if(n.targetSubTab) setRequestSubTab(n.targetSubTab); 
                                setShowNotifications(false); 
                            }} 
                            className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                          >
                            <p className="text-sm font-medium text-gray-800">{n.text}</p>
                            <p className="text-xs text-gray-400 mt-1">Just now</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-64 shadow-sm transition-all" />
              </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Customers" value={customerCount} icon={<Users className="text-white" size={24} />} color="bg-blue-600" />
                    <StatCard label="Active Restaurants" value={restaurantCount} icon={<Utensils className="text-white" size={24} />} color="bg-orange-600" />
                    <StatCard label="All Riders" value={driverCount} icon={<Bike className="text-white" size={24} />} color="bg-emerald-600" />
                    {/* Fixed: Show Revenue Instead of Unread Msgs */}
                    <StatCard label="Total Revenue" value="₹8,45,200" icon={<DollarSign className="text-white" size={24} />} color="bg-slate-900" />
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                    <h3 className="font-bold text-gray-900 mb-4">Pending Approvals (Restaurants)</h3>
                    {restaurantRequests.length === 0 ? <p className="text-gray-400 text-sm">No pending restaurant requests.</p> : (
                      <div className="space-y-4">
                        {restaurantRequests.slice(0, 3).map(req => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">{req.restaurant_name ? req.restaurant_name[0] : "R"}</div>
                              <div><p className="text-sm font-bold">{req.restaurant_name}</p><p className="text-xs text-gray-500">{req.owner_name}</p></div>
                            </div>
                            <button onClick={() => { setActiveTab('requests'); setRequestSubTab('restaurant'); }} className="text-xs font-bold text-blue-600 hover:underline">Review</button>
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
                        <tr key={r.id} onClick={() => openDetailModal(r, 'restaurant')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{r.address || r.location || "N/A"}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.is_active ? "Active" : "Inactive"}</span></td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={(e) => handleDeleteRestaurant(e, r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. REQUESTS */}
              {activeTab === 'requests' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100">
                    <button onClick={() => setRequestSubTab('restaurant')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'restaurant' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <Store size={18} /> Restaurant ({restaurantRequests.length})
                    </button>
                    <button onClick={() => setRequestSubTab('rider')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'rider' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <Bike size={18} /> Rider ({riderRequests.length})
                    </button>
                  </div>

                  {requestSubTab === 'restaurant' && (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Owner Info</th><th className="px-6 py-4 text-right">Decision</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {restaurantRequests.map(req => (
                          <tr key={req.id}>
                            <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.restaurant_name}</p><span className="text-xs text-gray-400">{req.address}</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600"><div>{req.owner_name}</div><div className="text-xs">{req.email}</div></td>
                            <td className="px-6 py-4 text-right space-x-3">
                              <button onClick={(e) => handleRejectRestaurant(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600">Reject</button>
                              <button onClick={(e) => handleApproveRestaurant(e, req.id)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-gray-800">Approve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {requestSubTab === 'rider' && (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-right">Decision</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {riderRequests.map(req => (
                          <tr key={req.id}>
                            <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.fullName}</p></td>
                            <td className="px-6 py-4"><span className="capitalize px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">{req.vehicleType || "Bike"}</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600"><div>{req.email}</div><div className="text-xs font-bold flex items-center gap-1"><MapPin size={10} /> {req.city}</div></td>
                            <td className="px-6 py-4 text-right space-x-3">
                              <button onClick={(e) => handleRejectRider(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600">Reject</button>
                              <button onClick={(e) => handleApproveRider(e, req.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700">Approve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {(requestSubTab === 'restaurant' && restaurantRequests.length === 0) && <div className="p-16 text-center text-gray-500">No pending restaurant applications.</div>}
                  {(requestSubTab === 'rider' && riderRequests.length === 0) && <div className="p-16 text-center text-gray-500">No pending rider applications.</div>}
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
                        <tr key={u.id} onClick={() => openDetailModal(u, 'rider')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
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

              {/* 5. CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                      <tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customerList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                        <tr key={u.id} onClick={() => openDetailModal(u, 'customer')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{u.username ? u.username[0] : "C"}</div>
                            <p className="font-bold text-sm">{u.username || "Unknown"}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.phone || "N/A"}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">Active</span></td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={(e) => handleSuspendUser(e, u.id)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Clock size={18} /></button>
                              <button onClick={(e) => handleTerminateUser(e, u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Ban size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {customerList.length === 0 && <div className="p-12 text-center text-gray-500">No customers found.</div>}
                </div>
              )}

              {/* 6. MESSAGES (REDIRECTION TARGET) */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                          <th className="px-6 py-4">User Info</th>
                          <th className="px-6 py-4">Message</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {messages.length === 0 ? (
                           <tr><td colSpan="4" className="p-12 text-center text-gray-500">No messages found.</td></tr>
                        ) : (
                          messages.map(msg => (
                            <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-gray-900 text-sm">{msg.name}</p>
                                <p className="text-xs text-gray-500">{msg.email}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Recent'}</p>
                              </td>
                              <td className="px-6 py-4 max-w-md">
                                <div className="text-sm text-gray-800 break-words bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  {msg.message}
                                </div>
                                {msg.admin_reply && (
                                  <div className="mt-2 ml-4 text-xs text-gray-500 border-l-2 border-orange-200 pl-2">
                                    <span className="font-bold text-orange-600">You replied:</span> {msg.admin_reply}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${msg.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {msg.status === 'replied' ? 'Replied' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {msg.status !== 'replied' && (
                                  <button 
                                    onClick={() => { setReplyingTo(msg.id); setReplyText(""); }}
                                    className="flex items-center gap-2 ml-auto px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800"
                                  >
                                    <Send size={12} /> Reply
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
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