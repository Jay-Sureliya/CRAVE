import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Edit2, Check, X, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = sessionStorage.getItem("user_id");

      if (!userId || userId === "undefined") {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    const userId = sessionStorage.getItem("user_id");
    try {
      await api.put(`/users/${userId}`, {
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone
      });
      sessionStorage.setItem("username", user.username);
      setIsEditing(false);
      alert("Profile updated!");
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900">Profile Settings</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
                <Check />
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                <X />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-orange-600 transition-all shadow-md"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          {["username", "full_name", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {field.replace("_", " ")}
              </label>
              {isEditing ? (
                <input
                  className="w-full border-b-2 border-orange-500 py-2 outline-none font-semibold text-slate-800 focus:bg-orange-50 transition-colors"
                  value={user[field] || ""}
                  onChange={(e) => setUser({ ...user, [field]: e.target.value })}
                />
              ) : (
                <p className="py-2 font-bold text-slate-800 border-b border-slate-100">
                  {user[field] || <span className="text-slate-300 font-normal italic">Not set</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => { sessionStorage.clear(); navigate("/login"); }}
          className="mt-10 flex items-center gap-2 text-red-500 font-bold hover:underline transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;