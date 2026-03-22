import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, LogOut, Save, Edit2, 
  Camera, Loader2, UtensilsCrossed, ArrowLeft
} from "lucide-react";
import api from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State (Simplified to Personal Data only)
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    profile_image: ""
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
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
        if (err.response && (err.response.status === 404 || err.response.status === 401)) {
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
      setUser({ ...user, ...formData });
      setIsEditing(false);
      await api.put(`/users/${userId}`, formData);
      alert("Profile Updated Successfully!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile.");
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper Component for Inputs
  const InputField = ({ label, icon: Icon, value, field, type = "text", fullWidth = false }) => (
    <div className={`space-y-2 group ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{label}</label>
      <div className={`
        flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200
        ${isEditing 
          ? "bg-white ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/5" 
          : "bg-stone-50 border border-stone-200/60"}
      `}>
        <div className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-orange-50 text-orange-600' : 'bg-stone-200 text-stone-400'}`}>
          <Icon size={16} />
        </div>
        <input 
          disabled={!isEditing}
          type={type}
          value={value}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          className="bg-transparent w-full outline-none text-stone-800 font-bold text-sm md:text-base disabled:text-stone-600 placeholder-stone-300"
          placeholder={isEditing ? `Enter ${label.toLowerCase()}` : "—"}
        />
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-stone-800 p-4 flex items-center justify-center font-sans">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-6 left-6 z-50 bg-white p-3 rounded-full shadow-lg shadow-stone-200 text-stone-400 hover:text-orange-600 hover:scale-105 transition-all border border-stone-100"
      >
        <ArrowLeft size={20} />
      </button>

      {/* --- MAIN STRUCTURED CONTAINER --- */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl shadow-stone-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-stone-100">
        
        {/* --- LEFT SIDEBAR: IDENTITY (Fixed width) --- */}
        <div className="lg:w-[320px] bg-stone-50/50 border-r border-stone-100 flex flex-col relative shrink-0">
          
          {/* Decorative Header Image/Gradient */}
          <div className="h-32 w-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
          </div>

          <div className="px-6 flex flex-col h-full -mt-16">
            
            {/* Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full p-1.5 bg-white shadow-lg">
                <img 
                  src={formData.profile_image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover bg-stone-100"
                />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              {isEditing && (
                <button 
                  onClick={triggerFileSelect}
                  className="absolute bottom-2 right-2 bg-stone-800 text-white p-2 rounded-full hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-stone-900 tracking-tight">{formData.full_name || "Guest User"}</h2>
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">@{formData.username || "username"}</p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-100/50 text-orange-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-100">
                <UtensilsCrossed size={12} /> {user?.role || "Foodie"}
              </div>
            </div>

            {/* Logout - Pushed to bottom */}
            <div className="mt-auto pb-8">
                <button 
                onClick={handleLogout}
                className="w-full py-3.5 rounded-xl border border-stone-200 text-stone-500 font-bold hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                <LogOut size={16} /> Sign Out
                </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: STRUCTURED FORM --- */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          
          {/* Sticky Header */}
          <div className="px-8 py-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
               <h1 className="text-xl font-black text-stone-800 flex items-center gap-2">
                 <User size={20} className="text-orange-500" /> Account Settings
               </h1>
               <p className="text-stone-400 text-xs font-bold mt-1 tracking-wide">MANAGE YOUR PERSONAL PROFILE</p>
            </div>

            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                ${isEditing 
                  ? "bg-stone-900 text-white shadow-lg hover:bg-black" 
                  : "bg-orange-500 text-white shadow-orange-200 shadow-md hover:bg-orange-600"}
              `}
            >
              {isEditing ? <><Save size={14} /> Save Changes</> : <><Edit2 size={14} /> Edit Details</>}
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto custom-scrollbar">
            
            {/* Identity & Contact Section */}
            <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <User size={16} />
                 </div>
                 <h3 className="text-sm font-black text-stone-700 uppercase tracking-widest">
                   Identity & Contact
                 </h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Full Name" icon={User} value={formData.full_name} field="full_name" />
                  <InputField label="Username" icon={UtensilsCrossed} value={formData.username} field="username" />
                  <InputField label="Email Address" icon={Mail} value={formData.email} field="email" type="email" />
                  <InputField label="Phone Number" icon={Phone} value={formData.phone} field="phone" type="tel" />
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;