import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { User, Lock, Mail, Phone, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        phone: "",
        role: "user"
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

                const res = await api.post("/login", data, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" }
                });

                // --- ERROR SOLVED HERE: SAVING CRITICAL DATA ---
                // We must save the user_id so the Profile page can fetch data by ID
                sessionStorage.setItem("token", res.data.access_token);
                sessionStorage.setItem("role", res.data.role);
                sessionStorage.setItem("user_id", res.data.user_id); // This prevents the "No User ID found" redirect

                if (res.data.username) {
                    sessionStorage.setItem("username", res.data.username);
                }

                // --- NAVIGATION LOGIC ---
                if (res.data.role === "admin") navigate("/admin/dashboard");
                else if (res.data.role === "restaurant") navigate("/restaurant/dashboard");
                else navigate("/");

            } else {
                // --- REGISTER LOGIC ---
                try {
                    await api.post("/register", {
                        username: formData.username.trim(),
                        full_name: formData.username.trim(), // Consider adding a separate full_name field in the future
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        password: formData.password.trim(),
                        role: "customer"
                    });
                    alert("Account created! Please log in.");
                    setIsLogin(true);
                    // Clear fields after successful registration
                    setFormData({ username: "", password: "", email: "", phone: "", role: "user" });
                } catch (err) {
                    setError(err.response?.data?.detail || "Signup failed. Try again.");
                }
            }

        } catch (err) {
            console.error(err);
            // Improved error messaging based on response
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

            <div className="pt-35 w-[95%] mx-auto fixed inset-0 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative h-full w-full overflow-y-auto no-scrollbar flex items-center justify-center p-4">
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-[420px] border border-slate-100 flex flex-col shadow-xl relative z-10 my-auto"
                    >
                        <motion.div layout="position" className="text-center mb-6">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </h1>
                            <p className="text-slate-500 text-xs font-medium">
                                {isLogin ? "Enter details to sign in." : "Join us to order delicious food."}
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <motion.div layout="position">
                                <label className="text-xs font-bold text-slate-700 ml-1 mb-1 block">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="username"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
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
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-2 gap-3 pb-1 pt-1">
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 ml-1 mb-1 block">Email</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        placeholder="email"
                                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required={!isLogin}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-700 ml-1 mb-1 block">Phone</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="phone"
                                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
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

                            <motion.div layout="position">
                                <label className="text-xs font-bold text-slate-700 ml-1 mb-1 block">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
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
                                        className="py-2 px-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center font-bold"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                layout="position"
                                className="group w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors duration-300 shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 mt-4"
                            >
                                {isLogin ? "Sign In" : "Register as Customer"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </form>

                        <motion.div layout="position" className="mt-5 text-center">
                            <p className="text-slate-500 font-medium text-xs">
                                {isLogin ? "New to Crave?" : "Already have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                                    className="text-orange-500 font-bold hover:text-orange-600 hover:underline transition-all ml-1"
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