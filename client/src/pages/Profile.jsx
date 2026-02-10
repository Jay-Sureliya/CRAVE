import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, LogOut, Save, Edit2, Camera, MapPin, Loader2 } from "lucide-react";
import api from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    profile_image: ""
  });

  // --- 1. FETCH DATA (With Auto-Logout Fix) ---
  useEffect(() => {
    const fetchProfile = async () => {
      // Robust Token Check
      const userId = sessionStorage.getItem("user_id");
      const token =  sessionStorage.getItem("token");

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setFormData({
          full_name: res.data.full_name || "",
          username: res.data.username || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          profile_image: res.data.profile_image || ""
        });
      } catch (err) {
        console.error("Profile sync failed:", err);
        
        // --- THE FIX: Auto-Logout on 404 ---
        if (err.response && (err.response.status === 404 || err.response.status === 401)) {
            alert("Session expired or user not found. Logging out.");
            localStorage.clear();
            sessionStorage.clear();
            navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const userId = user.id;
      // Optimistic Update
      setUser({ ...user, ...formData });
      setIsEditing(false);
      
      await api.put(`/users/${userId}`, formData);
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border border-stone-100">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <div className="w-28 h-28 mx-auto bg-white rounded-full p-1 shadow-2xl mb-4 relative group">
              <img 
                src={formData.profile_image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">{user?.full_name || "Guest User"}</h1>
            <p className="text-stone-400 text-sm font-medium tracking-widest uppercase mt-1">{user?.role || "Customer"}</p>
          </div>
        </div>

        {/* DETAILS FORM */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800">Personal Details</h2>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isEditing ? "bg-green-500 text-white hover:bg-green-600" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              {isEditing ? <><Save size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase ml-1">Full Name</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isEditing ? "bg-white border-orange-500 shadow-orange-100 ring-2 ring-orange-100" : "bg-stone-50 border-transparent"}`}>
                <User size={18} className="text-stone-400" />
                <input 
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-transparent w-full outline-none text-stone-800 font-bold disabled:text-stone-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase ml-1">Username</label>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50 border border-transparent">
                <span className="text-stone-400 font-bold">@</span>
                <input 
                  disabled
                  value={formData.username}
                  className="bg-transparent w-full outline-none text-stone-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase ml-1">Email Address</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isEditing ? "bg-white border-orange-500" : "bg-stone-50 border-transparent"}`}>
                <Mail size={18} className="text-stone-400" />
                <input 
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-transparent w-full outline-none text-stone-800 font-bold disabled:text-stone-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase ml-1">Phone Number</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isEditing ? "bg-white border-orange-500" : "bg-stone-50 border-transparent"}`}>
                <Phone size={18} className="text-stone-400" />
                <input 
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-transparent w-full outline-none text-stone-800 font-bold disabled:text-stone-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100">
             <button 
               onClick={handleLogout}
               className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
             >
                <LogOut size={20} /> Sign Out
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;