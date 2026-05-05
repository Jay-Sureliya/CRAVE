import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  LayoutDashboard, Users, Store, Utensils, LogOut, Search,
  CheckCircle, XCircle, Home, Trash2, Bike,
  MapPin, Bell, X, DollarSign, Star,
  MessageSquare, Send, Menu
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

  const joinDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Recently Joined";

  const rawRating = data.average_rating || data.rating || 0;
  const ratingValue = rawRating > 0 ? Number(rawRating).toFixed(1) : "New";
  const ratingCount = data.rating_count || 0;

  const rawEarnings = Number(data.total_earnings || data.earnings || 0);
  const rawSpent = Number(data.total_spent || 0);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white flex-shrink-0">
          <div className="flex gap-4 items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${type === 'restaurant' ? 'bg-orange-500' : type === 'rider' ? 'bg-cyan-500' : 'bg-blue-500'}`}>
              {data.name ? data.name[0] : data.username ? data.username[0] : "?"}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">{data.name || data.username || data.restaurant_name}</h2>
              <p className="text-slate-400 text-sm uppercase tracking-wider font-bold">{type}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-white/20">ID: {data.id}</span>
                <span>• {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><Users size={18} className="text-gray-500" /></div>
                <div className="overflow-hidden"><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-900 truncate">{data.email || "Not Provided"}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg"><MapPin size={18} className="text-gray-500" /></div>
                <div><p className="text-xs text-gray-400">Location/Address</p><p className="font-medium text-gray-900">{data.address || data.city || data.location || "Not Provided"}</p></div>
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

            <div className={`grid ${type === 'customer' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <DollarSign className="text-green-600 mb-2" size={20} />
                <p className="text-xs text-gray-500">{type === 'customer' ? 'Total Spent' : 'Total Earnings'}</p>
                <p className="text-xl font-bold text-gray-900">
                  {type === 'customer' ? formatMoney(rawSpent) : formatMoney(rawEarnings)}
                </p>
              </div>

              {type !== 'customer' && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <Star className="text-orange-500 mb-2" size={20} />
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-xl font-bold text-gray-900">
                    {ratingValue} <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
                  </p>
                  {ratingCount > 0 && <p className="text-[10px] text-gray-400 mt-1">{ratingCount} Reviews</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="w-full md:w-auto px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className={`px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
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

  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmActionId, setConfirmActionId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null);

  const [restaurantRequests, setRestaurantRequests] = useState([]);
  const [riderRequests, setRiderRequests] = useState([]);
  const [activeRestaurants, setActiveRestaurants] = useState([]);
  const [users, setUsers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const fetchData = async (isPolling = false) => {
    try {
      const [reqRes, riderReqRes, restaurantsRes, usersRes, messagesRes] = await Promise.allSettled([
        api.get("api/admin/requests"),
        api.get("api/admin/rider-requests"),
        api.get("/restaurants"),
        api.get("/admin/users"),
        api.get("/api/admin/messages")
      ]);

      if (reqRes.status === "fulfilled") setRestaurantRequests(reqRes.value.data);
      if (riderReqRes.status === "fulfilled") setRiderRequests(riderReqRes.value.data);
      if (restaurantsRes.status === "fulfilled") setActiveRestaurants(restaurantsRes.value.data);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
      if (messagesRes.status === "fulfilled") setMessages(messagesRes.value.data);

      if (reqRes.status === "fulfilled" && riderReqRes.status === "fulfilled") {
        const newNotes = [];
        if (reqRes.value.data.length > 0) {
          newNotes.push({ id: 1, text: `${reqRes.value.data.length} Pending Restaurants`, type: 'alert', targetTab: 'requests', targetSubTab: 'restaurant' });
        }
        if (riderReqRes.value.data.length > 0) {
          newNotes.push({ id: 2, text: `${riderReqRes.value.data.length} Pending Riders`, type: 'info', targetTab: 'requests', targetSubTab: 'rider' });
        }
        const pendingMessages = messagesRes.status === "fulfilled" ? messagesRes.value.data.filter(m => m.status === 'pending').length : 0;
        if (pendingMessages > 0) {
          newNotes.push({ id: 3, text: `${pendingMessages} Unread Messages`, type: 'info', targetTab: 'messages' });
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

  const showConfirm = (message, action, id) => {
    setConfirmDialog(message);
    setConfirmAction(action);
    setConfirmActionId(id);
  };

  const handleConfirmYes = async () => {
    try {
      if (confirmAction === 'reject-restaurant') {
        await api.post(`/admin/reject/${confirmActionId}`);
        setRestaurantRequests(prev => prev.filter(req => req.id !== confirmActionId));
        showToast("Application rejected.", "info");
      } else if (confirmAction === 'reject-rider') {
        await api.post(`/admin/rider-reject/${confirmActionId}`);
        setRiderRequests(prev => prev.filter(req => req.id !== confirmActionId));
        showToast("Rider application rejected.", "info");
      } else if (confirmAction === 'delete-restaurant') {
        await api.delete(`/api/admin/restaurants/${confirmActionId}`);
        setActiveRestaurants(prev => prev.filter(r => r.id !== confirmActionId));
        showToast("Restaurant deleted.", "error");
      } else if (confirmAction === 'suspend-user') {
        showToast("User suspended.", "info");
      } else if (confirmAction === 'delete-user') {
        await api.delete(`/admin/users/${confirmActionId}`);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== confirmActionId));
        showToast("User deleted from database.", "success");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Action failed.", "error");
    } finally {
      setConfirmDialog(null);
      setConfirmAction(null);
      setConfirmActionId(null);
    }
  };

  const handleConfirmNo = () => {
    setConfirmDialog(null);
    setConfirmAction(null);
    setConfirmActionId(null);
  };

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
    showConfirm("Reject this application?", 'reject-restaurant', id);
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
    showConfirm("Reject this rider application?", 'reject-rider', id);
  };

  const handleDeleteRestaurant = async (e, id) => {
    e.stopPropagation();
    showConfirm("Permanently delete?", 'delete-restaurant', id);
  };

  const handleTerminateUser = async (e, userId) => {
    e.stopPropagation();
    showConfirm("Are you sure you want to permanently delete this user?", 'delete-user', userId);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      showToast("Reply cannot be empty", "error");
      return;
    }
    setIsSendingReply(true);
    try {
      await api.post(`/api/admin/reply/${replyingTo}`, { reply_message: replyText });
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

  const calculatePlatformRevenue = () => {
    const totalRestaurantRev = activeRestaurants.reduce((sum, r) => sum + Number(r.total_earnings || r.earnings || 0), 0);
    const totalRiderRev = riderList.reduce((sum, r) => sum + Number(r.total_earnings || r.earnings || 0), 0);
    const platformRevenue = (totalRestaurantRev * 0.20) + (totalRiderRev * 0.10);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(platformRevenue);
  };

  const formattedTotalRevenue = calculatePlatformRevenue();

  // Helper to change tabs and close sidebar on mobile
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedItem && <DetailModal data={selectedItem} type={detailType} onClose={() => setSelectedItem(null)} />}

      <ConfirmationModal
        isOpen={confirmDialog !== null}
        message={confirmDialog}
        onConfirm={handleConfirmYes}
        onCancel={handleConfirmNo}
        isLoading={false}
      />

      {replyingTo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send size={20} className="text-orange-600" /> Send Reply
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
              <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold" disabled={isSendingReply}>Cancel</button>
              <button onClick={handleSendReply} className={`px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 flex items-center gap-2 transition-all ${isSendingReply ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isSendingReply}>
                {isSendingReply ? 'Sending...' : 'Send Email'} <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen w-screen bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
        
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 flex flex-col h-full z-50 shadow-2xl md:shadow-sm md:relative transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="h-24 flex-none flex items-center px-8 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl">C</div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Panel</span>
              </div>
            </div>
            {/* Close button for mobile inside sidebar */}
            <button className="md:hidden text-gray-400 hover:text-black" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-4">
            <div className="px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Overview</div>
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === "dashboard"} onClick={() => handleNavClick("dashboard")} />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
            <NavItem icon={<Utensils size={20} />} label="All Restaurants" count={activeRestaurants.length} isActive={activeTab === "active_restaurants"} onClick={() => handleNavClick("active_restaurants")} />
            <NavItem icon={<Store size={20} />} label="Requests" count={totalPending > 0 ? totalPending : null} isActive={activeTab === "requests"} onClick={() => handleNavClick("requests")} />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Support</div>
            <NavItem icon={<MessageSquare size={20} />} label="Messages" count={unreadMessagesCount > 0 ? unreadMessagesCount : null} isActive={activeTab === "messages"} onClick={() => handleNavClick("messages")} />

            <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">People</div>
            <NavItem icon={<Bike size={20} />} label="All Riders" count={driverCount} isActive={activeTab === "riders"} onClick={() => handleNavClick("riders")} />
            <NavItem icon={<Users size={20} />} label="All Customers" count={customerCount} isActive={activeTab === "customers"} onClick={() => handleNavClick("customers")} />
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

        {/* MAIN CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
          
          {/* MOBILE TOP HEADER */}
          <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">C</div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">Crave.</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
          </div>

          <main className="flex-1 overflow-y-auto no-scrollbar bg-[#F8F9FA] p-4 md:p-8 lg:p-12 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {activeTab === 'dashboard' && 'System Overview'}
                  {activeTab === 'active_restaurants' && 'Restaurant Management'}
                  {activeTab === 'requests' && 'New Applications'}
                  {activeTab === 'riders' && 'Delivery Fleet'}
                  {activeTab === 'customers' && 'Customer Database'}
                  {activeTab === 'messages' && 'Support Messages'}
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  {activeTab === 'dashboard' ? `You have ${totalPending} pending requests.` : 'Manage your platform data.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                <div className="relative w-full sm:w-auto z-20 flex justify-between sm:justify-start items-center">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:shadow-md transition-all relative shrink-0">
                    <Bell size={20} />
                    {(totalPending > 0 || unreadMessagesCount > 0) && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </button>

                  {showNotifications && (
                    <div className="absolute left-0 sm:left-auto right-auto sm:right-0 top-14 sm:top-12 mt-1 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-sm">Notifications</span>
                        <span className="text-xs text-orange-500 font-bold">{notifications.length} New</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-xs">No new alerts</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} onClick={() => { setActiveTab(n.targetTab); if (n.targetSubTab) setRequestSubTab(n.targetSubTab); setShowNotifications(false); }} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                              <p className="text-sm font-medium text-gray-800">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">Just now</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Duplicate search bar specifically for small screens to fit layout cleanly */}
                  <div className="relative group w-full ml-4 sm:hidden">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-full shadow-sm transition-all" />
                  </div>
                </div>

                {/* Desktop/Tablet search bar */}
                <div className="relative group hidden sm:block w-full sm:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none w-full sm:w-64 shadow-sm transition-all" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      <StatCard label="Total Customers" value={customerCount} icon={<Users className="text-white" size={24} />} color="bg-blue-600" />
                      <StatCard label="Active Restaurants" value={restaurantCount} icon={<Utensils className="text-white" size={24} />} color="bg-orange-600" />
                      <StatCard label="All Riders" value={driverCount} icon={<Bike className="text-white" size={24} />} color="bg-emerald-600" />
                      <StatCard label="Total Revenue" value={formattedTotalRevenue} icon={<DollarSign className="text-white" size={24} />} color="bg-slate-900" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 overflow-hidden">
                      <h3 className="font-bold text-gray-900 mb-4">Pending Approvals (Restaurants)</h3>
                      {restaurantRequests.length === 0 ? <p className="text-gray-400 text-sm">No pending restaurant requests.</p> : (
                        <div className="space-y-4">
                          {restaurantRequests.slice(0, 3).map(req => (
                            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700 flex-shrink-0">{req.restaurant_name ? req.restaurant_name[0] : "R"}</div>
                                <div className="truncate"><p className="text-sm font-bold truncate">{req.restaurant_name}</p><p className="text-xs text-gray-500 truncate">{req.owner_name}</p></div>
                              </div>
                              <button onClick={() => { setActiveTab('requests'); setRequestSubTab('restaurant'); }} className="text-xs font-bold text-blue-600 hover:underline sm:text-right flex-shrink-0">Review</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 2. ACTIVE RESTAURANTS */}
                {activeTab === 'active_restaurants' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Rating</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeRestaurants.filter(r => r.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(r => (
                          <tr key={r.id} onClick={() => openDetailModal(r, 'restaurant')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm max-w-[200px] truncate">{r.address || r.location || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                {r.average_rating > 0 ? Number(r.average_rating).toFixed(1) : "New"}
                              </span>
                            </td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.is_active ? "Active" : "Inactive"}</span></td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={(e) => handleDeleteRestaurant(e, r.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {activeRestaurants.length === 0 && <div className="p-12 text-center text-gray-500">No restaurants found.</div>}
                  </div>
                )}

                {/* 3. REQUESTS */}
                {activeTab === 'requests' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
                    <div className="flex border-b border-gray-100">
                      <button onClick={() => setRequestSubTab('restaurant')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'restaurant' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Store size={16} className="hidden sm:block" /> Restaurant <span className="hidden sm:inline">({restaurantRequests.length})</span>
                      </button>
                      <button onClick={() => setRequestSubTab('rider')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${requestSubTab === 'rider' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Bike size={16} className="hidden sm:block" /> Rider <span className="hidden sm:inline">({riderRequests.length})</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto w-full">
                      {requestSubTab === 'restaurant' && (
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr><th className="px-6 py-4">Restaurant</th><th className="px-6 py-4">Owner Info</th><th className="px-6 py-4 text-right">Decision</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {restaurantRequests.map(req => (
                              <tr key={req.id}>
                                <td className="px-6 py-4"><p className="font-bold text-gray-900">{req.restaurant_name}</p><span className="text-xs text-gray-400">{req.address}</span></td>
                                <td className="px-6 py-4 text-sm text-gray-600"><div>{req.owner_name}</div><div className="text-xs">{req.email}</div></td>
                                <td className="px-6 py-4 text-right space-x-3">
                                  <button onClick={(e) => handleRejectRestaurant(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600 mb-2 sm:mb-0">Reject</button>
                                  <button onClick={(e) => handleApproveRestaurant(e, req.id)} className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:bg-gray-800">Approve</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {requestSubTab === 'rider' && (
                        <table className="w-full text-left whitespace-nowrap">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                            <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-right">Decision</th></tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {riderRequests.map(req => (
                              <tr key={req.id}>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-gray-900">{req.fullName || req.full_name || req.name || req.username || "Unknown"}</p>
                                </td>
                                <td className="px-6 py-4"><span className="capitalize px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">{req.vehicleType || "Bike"}</span></td>
                                <td className="px-6 py-4 text-sm text-gray-600"><div>{req.email}</div><div className="text-xs font-bold flex items-center gap-1"><MapPin size={10} /> {req.city}</div></td>
                                <td className="px-6 py-4 text-right space-x-3">
                                  <button onClick={(e) => handleRejectRider(e, req.id)} className="px-3 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-red-50 text-red-600 mb-2 sm:mb-0">Reject</button>
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
                  </div>
                )}

                {/* 4. RIDERS */}
                {activeTab === 'riders' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr><th className="px-6 py-4">Rider</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Rating</th><th className="px-6 py-4">Role</th><th className="px-6 py-4 text-right">Action</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {riderList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                          <tr key={u.id} onClick={() => openDetailModal(u, 'rider')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">
                                {u.username ? u.username[0] : "R"}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{u.username || "Unknown"}</p>
                                <p className="text-xs text-gray-400">ID: {u.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                {u.rating > 0 ? Number(u.rating).toFixed(1) : "New"}
                              </span>
                            </td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-cyan-100 text-cyan-700">Rider</span></td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={(e) => handleTerminateUser(e, u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Rider">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {riderList.length === 0 && <div className="p-12 text-center text-gray-500">No riders found.</div>}
                  </div>
                )}

                {/* 5. CUSTOMERS */}
                {activeTab === 'customers' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto w-full">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                        <tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customerList.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                          <tr key={u.id} onClick={() => openDetailModal(u, 'customer')} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">{u.username ? u.username[0] : "C"}</div>
                              <p className="font-bold text-sm">{u.username || "Unknown"}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.phone || "N/A"}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">Active</span></td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={(e) => handleTerminateUser(e, u.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Customer">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {customerList.length === 0 && <div className="p-12 text-center text-gray-500">No customers found.</div>}
                  </div>
                )}

                {/* 6. MESSAGES */}
                {activeTab === 'messages' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto w-full">
                      <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                          <tr><th className="px-6 py-4">User Info</th><th className="px-6 py-4">Message</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {messages.length === 0 ? (
                            <tr><td colSpan="4" className="p-12 text-center text-gray-500">No messages found.</td></tr>
                          ) : (
                            messages.map(msg => (
                              <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors align-top">
                                <td className="px-6 py-4 min-w-[150px]">
                                  <p className="font-bold text-gray-900 text-sm">{msg.name}</p>
                                  <p className="text-xs text-gray-500">{msg.email}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'Recent'}</p>
                                </td>
                                <td className="px-6 py-4 max-w-sm md:max-w-md">
                                  <div className="text-sm text-gray-800 break-words bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-normal">{msg.message}</div>
                                  {msg.admin_reply && (
                                    <div className="mt-2 ml-4 text-xs text-gray-500 border-l-2 border-orange-200 pl-2 whitespace-normal">
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
                                    <button onClick={() => { setReplyingTo(msg.id); setReplyText(""); }} className="flex items-center justify-center gap-2 ml-auto px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800">
                                      <Send size={12} /> <span className="hidden sm:inline">Reply</span>
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
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow w-full overflow-hidden">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${color}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-gray-500 text-[11px] sm:text-xs font-bold uppercase tracking-wide truncate">{label}</p>
      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</h4>
    </div>
  </div>
);

export default AdminDashboard;