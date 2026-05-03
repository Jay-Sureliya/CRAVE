import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, LogOut, Save, Edit3,
  Camera, Loader2, ArrowLeft, AtSign, ShieldCheck, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useToast } from "../context/useToast";

const Profile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

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

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = sessionStorage.getItem("user_id");
      const token = sessionStorage.getItem("token");

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
      addToast("Profile Updated Successfully!", "success");
    } catch (err) {
      console.error("Update failed", err);
      addToast("Failed to update profile.", "error");
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

  // Safe input handler to prevent focus loss
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-sans text-slate-900 pt-20 pb-24 selection:bg-orange-500/20">
      
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2.5} /> Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
        
        {/* ================= LEFT COLUMN: PROFILE SUMMARY ================= */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/3 flex flex-col gap-6"
        >
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                {/* Decorative background blob */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-orange-50 to-white"></div>

                {/* Avatar */}
                <div className="relative w-36 h-36 mb-6 mt-4 group z-10">
                    <div className="w-full h-full rounded-full p-1.5 bg-white shadow-xl shadow-slate-200/50">
                        <img
                            src={formData.profile_image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover bg-slate-100"
                        />
                    </div>
                    
                    {/* Hover Camera Icon (Always visible if editing) */}
                    <AnimatePresence>
                        {isEditing && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={triggerFileSelect}
                                className="absolute bottom-0 right-2 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-20"
                            >
                                <Camera size={18} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {formData.full_name || "Guest User"}
                </h1>
                <p className="text-slate-400 font-bold text-sm tracking-wide mt-1">
                    @{formData.username || "username"}
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck size={16} /> {user?.role || "Member"}
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-white border border-slate-200 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
                <LogOut size={18} strokeWidth={2.5} /> Sign Out
            </button>
        </motion.div>

        {/* ================= RIGHT COLUMN: SETTINGS FORM ================= */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3"
        >
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white z-10 relative">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Details</h2>
                        <p className="text-slate-500 font-medium text-sm mt-2">Manage your personal information.</p>
                    </div>
                    
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all w-full sm:w-auto justify-center ${
                            isEditing 
                            ? "bg-slate-900 text-white hover:bg-black shadow-lg" 
                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        }`}
                    >
                        {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Profile</>}
                    </button>
                </div>

                {/* Form Fields */}
                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        ) : (
                            <div className="p-4 bg-transparent border border-transparent font-bold text-lg text-slate-800">
                                {formData.full_name || "—"}
                            </div>
                        )}
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <AtSign size={14} /> Username
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                placeholder="johndoe123"
                            />
                        ) : (
                            <div className="p-4 bg-transparent border border-transparent font-bold text-lg text-slate-800">
                                {formData.username || "—"}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} /> Email Address
                        </label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                placeholder="john@example.com"
                            />
                        ) : (
                            <div className="p-4 bg-transparent border border-transparent font-bold text-lg text-slate-800">
                                {formData.email || "—"}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={14} /> Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                placeholder="+1 234 567 890"
                            />
                        ) : (
                            <div className="p-4 bg-transparent border border-transparent font-bold text-lg text-slate-800">
                                {formData.phone || "—"}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;