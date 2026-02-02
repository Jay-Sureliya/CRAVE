import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Edit2, Check, X, LogOut, Camera, Home,
  User as UserIcon, Mail, Phone, ShieldCheck,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    profile_image: "",
    role: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Retrieve the ID from sessionStorage
      const userId = sessionStorage.getItem("user_id");

      // 2. Safety check: If ID is missing, the user isn't logged in
      if (!userId || userId === "undefined") {
        navigate("/login");
        return;
      }

      try {
        // 3. Explicitly fetch from your Port 5000 backend
        const res = await api.get(`/users/${userId}`);

        // 4. Update the state with confirmed data from the DB
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Refresh sync failed:", err);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Resize to max 400px width
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to compressed JPEG (quality 0.7 = 70%)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setUser({ ...user, profile_image: compressedBase64 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const userId = sessionStorage.getItem("user_id");

    const payload = {
      username: user?.username?.trim(), // Trim whitespace to prevent DB issues
      full_name: user?.full_name,
      email: user?.email,
      phone: user?.phone,
      profile_image: user?.profile_image
    };

    try {
      const res = await api.put(`/users/${userId}`, payload);

      if (res.status === 200) {
        sessionStorage.setItem("username", user.username);
        setIsEditing(false);
        alert("Profile updated successfully! ✅");
        window.location.reload();
      }
    } catch (err) {
      // This looks for the specific "detail" message sent by your FastAPI backend
      const errorMessage = err.response?.data?.detail;

      if (errorMessage === "Username already taken") {
        alert("❌ This username is already in use. Please choose another one.");
      } else {
        console.error("Save failed:", errorMessage);
        alert(`❌ Update failed: ${errorMessage || "Internal Server Error"}`);
      }
    }
  };

  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Profile</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-10 font-sans text-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >

        {/* --- LEFT SIDE: Sidebar --- */}
        <div className="md:w-80 bg-orange-500 p-8 flex flex-col items-center text-center">
          <div className="relative group mt-8">
            <div className="relative">
              <img
                src={user.profile_image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Profile"
                className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl bg-white"
              />
              <AnimatePresence>
                {isEditing && (
                  <motion.label
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-2 -right-2 bg-white text-orange-500 p-3 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all shadow-xl border border-orange-100 flex items-center justify-center"
                  >
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 space-y-1 text-white">
            <h2 className="text-2xl font-black tracking-tight">{user.username}</h2>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest border border-white/30">
              <ShieldCheck size={12} /> {user.role || 'Partner'}
            </div>
          </div>

          <div className="mt-auto pt-10 w-full space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 bg-white text-orange-500 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg active:scale-95"
            >
              <Home size={18} /> Home
            </button>

            <button
              onClick={() => { sessionStorage.clear(); navigate("/login"); }}
              className="w-full flex items-center justify-center gap-2 bg-orange-600/50 text-white/90 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all border border-white/20 active:scale-95"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* --- RIGHT SIDE: Content --- */}
        <div className="flex-1 p-8 sm:p-14 bg-white">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Merchant Portal</p>
              <h1 className="text-4xl font-black text-slate-800">Account Settings</h1>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleSave} className="p-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 shadow-lg transition-all"><Check size={20} /></button>
                  <button onClick={() => setIsEditing(false)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"><X size={20} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <InputGroup label="Display Username" value={user.username} isEditing={isEditing} icon={<Fingerprint size={18} />} onChange={(v) => setUser({ ...user, username: v })} />
            <InputGroup label="Merchant Name" value={user.full_name} isEditing={isEditing} icon={<UserIcon size={18} />} onChange={(v) => setUser({ ...user, full_name: v })} />
            <InputGroup label="Business Email" value={user.email} isEditing={isEditing} icon={<Mail size={18} />} onChange={(v) => setUser({ ...user, email: v })} />
            <InputGroup label="Contact Number" value={user.phone} isEditing={isEditing} icon={<Phone size={18} />} onChange={(v) => setUser({ ...user, phone: v })} />
          </div>

          {/* THE STATS SECTION HAS BEEN REMOVED FROM HERE */}
        </div>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ label, value, isEditing, icon, onChange }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-orange-500">{label}</label>
    <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl border transition-all ${isEditing ? 'bg-white border-orange-500 shadow-md ring-4 ring-orange-50' : 'bg-slate-50 border-slate-100 hover:border-orange-200'}`}>
      <span className={isEditing ? 'text-orange-500' : 'text-slate-400'}>{icon}</span>
      {isEditing ? (
        <input
          className="bg-transparent w-full text-sm font-bold outline-none text-slate-800"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="text-sm font-bold text-slate-700">{value || "Not Set"}</span>
      )}
    </div>
  </div>
);

export default Profile;