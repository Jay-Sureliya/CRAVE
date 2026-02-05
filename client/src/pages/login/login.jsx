import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { User, Lock, Mail, Phone, ArrowRight, UserCircle, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        password: "",
        email: "",
        phone: "",
        role: "customer"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                // --- LOGIN LOGIC ---
                const data = new URLSearchParams();
                data.append("username", formData.username.trim());
                data.append("password", formData.password.trim());

                // Pointing to your port 5000 backend via api service
                const res = await api.post("/login", data, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                // SAVING DATA - Essential for the Profile page to work after refresh
                sessionStorage.setItem("token", res.data.access_token);
                sessionStorage.setItem("role", res.data.role);
                sessionStorage.setItem("restaurant_id", res.data.restaurant_id);
                sessionStorage.setItem("user_id", String(res.data.user_id));

                if (res.data.username) {
                    sessionStorage.setItem("username", res.data.username);
                }

                // --- UPDATED NAVIGATION LOGIC ---
                if (res.data.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (res.data.role === "restaurant") {
                    navigate("/restaurant/dashboard");
                } else if (res.data.role === "driver") { // <--- ADDED THIS CHECK
                    navigate("/rider/dashboard");
                } else {
                    navigate("/");
                }

            } else {
                // --- REGISTER LOGIC ---
                try {
                    await api.post("/register", {
                        username: formData.username.trim(),
                        full_name: formData.full_name.trim() || formData.username.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        password: formData.password.trim(),
                        role: "customer",
                        // Default Profile Image
                        profile_image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    });
                    alert("Account created! Welcome to Crave. Please log in.");
                    setIsLogin(true);
                    setFormData({ username: "", full_name: "", password: "", email: "", phone: "", role: "customer" });
                } catch (err) {
                    setError(err.response?.data?.detail || "Signup failed. Try again.");
                }
            }
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.detail ||
                (isLogin ? "Login failed. Check your credentials." : "Signup failed. Try again.");
            setError(message);
        }
    };

    return (
        <>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="pt-35 w-[95%] mx-auto fixed inset-0 overflow-hidden flex items-center justify-center bg-slate-50">
                {/* Home Button for Easy Navigation */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 font-bold transition-colors z-20"
                >
                    <Home size={20} /> <span className="text-sm uppercase tracking-widest">Home</span>
                </button>

                <div className="absolute inset-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative h-full w-full overflow-y-auto no-scrollbar flex items-center justify-center p-4">
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white p-6 sm:p-8 rounded-[2.5rem] w-full max-w-[420px] border border-slate-100 flex flex-col shadow-2xl relative z-10 my-auto"
                    >
                        <motion.div layout="position" className="text-center mb-6">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                                {isLogin ? "Sign in to continue" : "Start your food journey"}
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <motion.div layout="position">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <AnimatePresence initial={false}>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden space-y-4"
                                    >
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserCircle className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    placeholder="John Doe"
                                                    className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="email@crave.com"
                                                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required={!isLogin}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Phone</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="0000000000"
                                                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required={!isLogin}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Password */}
                            <motion.div layout="position">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="py-3 px-4 bg-red-50 text-red-600 text-[10px] rounded-xl border border-red-100 text-center font-black uppercase tracking-widest"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                layout="position"
                                className="group w-full bg-orange-500 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLogin ? "Sign In" : "Create Account"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        <motion.div layout="position" className="mt-6 text-center">
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                {isLogin ? "New to Crave?" : "Already a member?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                                    className="text-orange-500 hover:text-orange-600 font-black ml-1 underline decoration-2 underline-offset-4"
                                >
                                    {isLogin ? "Register now" : "Login now"}
                                </button>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;