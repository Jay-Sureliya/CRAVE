// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { LogOut, User } from "lucide-react";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState({
//     username: "",
//     role: "",
//   });

//   useEffect(() => {
//     // Get user info from session storage
//     const username = sessionStorage.getItem("username");
//     const role = sessionStorage.getItem("role");

//     if (!username) {
//       // Redirect to login if not logged in
//       navigate("/login");
//     } else {
//       setUser({ username, role });
//     }
//   }, [navigate]);

//   // Logout function
//   const handleLogout = () => {
//     sessionStorage.clear();
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pt-20 px-4">
//       <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md flex flex-col items-center">
//         <div className="bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl mb-4">
//           <User className="w-10 h-10" />
//         </div>
//         <h2 className="text-2xl font-bold text-slate-900 mb-1">{user.username}</h2>
//         <p className="text-sm text-slate-500 mb-6 capitalize">{user.role}</p>

//         <div className="w-full border-t border-slate-200 mb-6"></div>

//         <div className="flex flex-col gap-4 w-full">
//           <div className="flex justify-between text-slate-700 text-sm">
//             <span>Username:</span>
//             <span className="font-semibold">{user.username}</span>
//           </div>
//           <div className="flex justify-between text-slate-700 text-sm">
//             <span>Role:</span>
//             <span className="font-semibold capitalize">{user.role}</span>
//           </div>
//           {/* Add more info here if needed (email, phone, etc.) */}
//         </div>

//         <button
//           onClick={handleLogout}
//           className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all"
//         >
//           <LogOut className="w-5 h-5" /> Logout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Profile;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Settings, 
  CreditCard, 
  MapPin, 
  Heart,
  Shield,
  Zap
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    role: "",
  });

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");
    if (!username) {
      navigate("/login");
    } else {
      setUser({ username, role });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  // Helper for quick action buttons
  const ActionButton = ({ icon: Icon, label, color }) => (
    <button className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className={`p-3 rounded-full ${color} text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      
      <div className="w-full max-w-5xl">
        
        {/* --- MAIN CARD --- */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* --- LEFT: BRANDING SIDEBAR (Dark Mode) --- */}
          <div className="md:w-2/5 bg-slate-900 relative p-10 text-white flex flex-col justify-between overflow-hidden">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
                <Zap className="text-orange-500 fill-orange-500" /> Crave
              </h2>
              
              <div className="flex flex-col items-start gap-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
                  <User size={40} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.username}</h1>
                  <p className="text-slate-400 capitalize flex items-center gap-2 mt-1">
                    <Shield size={14} /> {user.role || "Verified Member"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-12 md:mt-0">
               <div className="p-4 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Member Stats</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <span className="text-2xl font-bold text-white">Gold</span>
                        <span className="text-xs text-slate-400 ml-2">Tier Status</span>
                     </div>
                     <div className="h-1 w-20 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-orange-500"></div>
                     </div>
                  </div>
               </div>
            </div>

          </div>

          {/* --- RIGHT: CONTENT SIDE (Light Mode) --- */}
          <div className="md:w-3/5 p-8 md:p-12 flex flex-col">
            
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-slate-900">General Information</h3>
               <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
               >
                 <LogOut size={16} /> Logout
               </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                  <div className="font-semibold text-slate-800 border-b-2 border-slate-100 py-2">
                    {user.username}
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                  <div className="font-semibold text-slate-800 border-b-2 border-slate-100 py-2 capitalize">
                    {user.role}
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                  <div className="font-semibold text-slate-800 border-b-2 border-slate-100 py-2">
                    user@example.com
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                  <div className="font-semibold text-slate-800 border-b-2 border-slate-100 py-2">
                    +1 234 567 890
                  </div>
               </div>
            </div>

            {/* Quick Actions Title */}
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Quick Actions</h3>
            
            {/* Action Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <ActionButton icon={Settings} label="Settings" color="bg-blue-500" />
               <ActionButton icon={CreditCard} label="Payment" color="bg-purple-500" />
               <ActionButton icon={MapPin} label="Address" color="bg-orange-500" />
               <ActionButton icon={Heart} label="Favorites" color="bg-pink-500" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;