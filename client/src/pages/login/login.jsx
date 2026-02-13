import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import api from "../../services/api";
import { User, Lock, Mail, Phone, ArrowRight, Home, ChefHat, Star, Eye, EyeOff, Loader2, KeyRound, Hash, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, required, isPassword = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative group"
        >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
            </div>
            <input
                type={inputType}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-300 shadow-sm focus:shadow-md"
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-20"
                >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            )}
        </motion.div>
    );
};

// --- GOOGLE ICON ---
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- NEW: Forgot Password State ---
    // 0 = Normal Auth, 1 = Forgot Email Input, 2 = Verify OTP & Reset
    const [forgotStage, setForgotStage] = useState(0); 

    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        password: "",
        email: "",
        phone: "",
        role: "customer"
    });

    // --- NEW: Forgot Password Form Data ---
    const [resetData, setResetData] = useState({
        email: "",
        otp: "",
        newPassword: ""
    });

    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState(""); // Feedback for user
    const navigate = useNavigate();

    // --- LOGIC ---
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                const res = await api.post("/auth/google", { token: tokenResponse.access_token });
                handleAuthSuccess(res);
            } catch (err) {
                console.error("Google Auth Error:", err);
                setError("Google Login failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError("Google Login Failed"),
    });

    const handleAuthSuccess = (res) => {
        const token = res.data.access_token;
        const userId = res.data.user_id || res.data.user?.id || res.data.id;
        if (!token || !userId) { setError("Login failed: Invalid server response."); return; }
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user_id", String(userId));
        sessionStorage.setItem("role", res.data.role || "customer");
        if (res.data.restaurant_id) sessionStorage.setItem("restaurant_id", res.data.restaurant_id);
        if (res.data.username || res.data.user?.username) sessionStorage.setItem("username", res.data.username || res.data.user?.username);

        const role = res.data.role;
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "restaurant") navigate("/restaurant/dashboard");
        else if (role === "driver") navigate("/rider/dashboard");
        else navigate("/");
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleResetChange = (e) => setResetData({ ...resetData, [e.target.name]: e.target.value });

    // --- MAIN LOGIN / REGISTER SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            if (isLogin) {
                const data = new URLSearchParams();
                data.append("username", formData.username.trim());
                data.append("password", formData.password.trim());
                const res = await api.post("/login", data, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
                handleAuthSuccess(res);
            } else {
                await api.post("/register", {
                    username: formData.username.trim(),
                    full_name: formData.full_name.trim() || formData.username.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password.trim(),
                    role: "customer",
                    profile_image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                });
                setSuccessMsg("Account created! Please log in.");
                setIsLogin(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Action failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- NEW: FORGOT PASSWORD FLOW ---
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            if (forgotStage === 1) {
                // Step 1: Send Email
                await api.post("/auth/forgot-password", { email: resetData.email });
                setSuccessMsg("OTP sent to your email!");
                setForgotStage(2);
            } else if (forgotStage === 2) {
                // Step 2: Verify OTP & Reset
                await api.post("/auth/reset-password", { 
                    email: resetData.email,
                    otp: resetData.otp,
                    new_password: resetData.newPassword
                });
                setSuccessMsg("Password reset successfully! Please login.");
                setTimeout(() => {
                    setForgotStage(0);
                    setSuccessMsg("");
                    setResetData({ email: "", otp: "", newPassword: "" });
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed. Check your details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden relative">

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] lg:w-[50%]"></div>

            {/* --- LEFT SIDE: FORM --- */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-[400px]">

                    {/* Header */}
                    <div className="mb-8">
                        <motion.h1
                            key={forgotStage > 0 ? "forgot" : "auth"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]"
                        >
                            {forgotStage > 0 ? "Reset" : (isLogin ? "Welcome" : "Start")}
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                                {forgotStage > 0 ? "Password." : (isLogin ? "Back." : "Craving.")}
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 text-gray-400 font-medium"
                        >
                            {forgotStage === 1 && "Enter your email to receive a reset code."}
                            {forgotStage === 2 && "Enter the code sent to your email and a new password."}
                            {forgotStage === 0 && (isLogin ? "Enter your details to access your account." : "Create an account to start ordering delicious food.")}
                        </motion.p>
                    </div>

                    {/* Sliding Tab Switcher (Only visible in normal Login/Signup mode) */}
                    <AnimatePresence>
                        {forgotStage === 0 && (
                            <motion.div 
                                initial={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-gray-100 p-1 rounded-xl flex relative mb-8 overflow-hidden"
                            >
                                <motion.div
                                    className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] top-1 bg-white rounded-lg shadow-sm"
                                    layout
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    initial={false}
                                    animate={{ x: isLogin ? 0 : "100%" }}
                                />
                                <button
                                    onClick={() => { setIsLogin(true); setError("") }}
                                    className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-gray-900' : 'text-gray-400'}`}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => { setIsLogin(false); setError("") }}
                                    className={`flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-gray-900' : 'text-gray-400'}`}
                                >
                                    Sign Up
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- DYNAMIC FORMS --- */}
                    <div className="space-y-3">
                        <AnimatePresence mode="wait">
                            
                            {/* 1. NORMAL LOGIN / REGISTER FORM */}
                            {forgotStage === 0 && (
                                <motion.form 
                                    key="auth-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-3"
                                >
                                    <InputField icon={User} type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />

                                    {!isLogin && (
                                        <div className="space-y-3">
                                            <InputField icon={User} type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required />
                                            <div className="grid grid-cols-2 gap-3">
                                                <InputField icon={Mail} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                                                <InputField icon={Phone} type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    )}

                                    <InputField icon={Lock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required isPassword={true} />
                                    
                                    {/* Forgot Password Link */}
                                    {isLogin && (
                                        <div className="flex justify-end">
                                            <button 
                                                type="button" 
                                                onClick={() => { setForgotStage(1); setError(""); setSuccessMsg(""); }}
                                                className="text-[11px] font-bold text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}

                                    <SubmitButton isLoading={isLoading} label={isLogin ? "Sign In" : "Create Account"} />
                                </motion.form>
                            )}

                            {/* 2. FORGOT PASSWORD - STAGE 1 (EMAIL) */}
                            {forgotStage === 1 && (
                                <motion.form 
                                    key="forgot-email"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleForgotSubmit}
                                    className="space-y-3"
                                >
                                    <InputField icon={Mail} type="email" name="email" placeholder="Enter your email" value={resetData.email} onChange={handleResetChange} required />
                                    <SubmitButton isLoading={isLoading} label="Send Code" />
                                </motion.form>
                            )}

                            {/* 3. FORGOT PASSWORD - STAGE 2 (OTP + NEW PASS) */}
                            {forgotStage === 2 && (
                                <motion.form 
                                    key="forgot-otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleForgotSubmit}
                                    className="space-y-3"
                                >
                                    <InputField icon={Hash} type="text" name="otp" placeholder="Enter OTP Code" value={resetData.otp} onChange={handleResetChange} required />
                                    <InputField icon={KeyRound} type="password" name="newPassword" placeholder="New Password" value={resetData.newPassword} onChange={handleResetChange} required isPassword={true} />
                                    <SubmitButton isLoading={isLoading} label="Reset Password" />
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Messages & Back Button */}
                    <div className="mt-4">
                        <AnimatePresence>
                            {/* Error Msg */}
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
                                    <div className="py-3 px-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                        <p className="text-red-600 text-xs font-bold uppercase tracking-wide">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                            {/* Success Msg */}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
                                    <div className="py-3 px-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <p className="text-green-600 text-xs font-bold uppercase tracking-wide">{successMsg}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Back to Login Button (Only in Forgot Flow) */}
                        {forgotStage > 0 && (
                            <button
                                onClick={() => { setForgotStage(0); setError(""); setSuccessMsg(""); }}
                                className="w-full py-3 flex items-center justify-center gap-2 text-gray-500 font-bold text-sm hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </button>
                        )}
                    </div>

                    {/* Social Login (Only in Main Auth) */}
                    {forgotStage === 0 && (
                        <>
                            <div className="my-8 flex items-center gap-4">
                                <div className="h-px bg-gray-100 flex-1"></div>
                                <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Or continue with</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <motion.button
                                layout
                                onClick={() => !isLoading && googleLogin()}
                                whileHover={{ backgroundColor: "#F9FAFB", scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full bg-white border-2 border-gray-100 text-gray-700 font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-3 transition-colors"
                            >
                                <GoogleIcon />
                                Google
                            </motion.button>
                        </>
                    )}
                </div>
            </div>

            {/* --- RIGHT SIDE: VISUALS (UNCHANGED) --- */}
            <div className="hidden lg:block w-[50%] xl:w-[55%] relative p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full w-full rounded-[2.5rem] overflow-hidden relative shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="absolute top-10 right-10">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                            <div className="bg-green-500 p-2 rounded-full text-white shadow-lg shadow-green-500/30"><ChefHat size={20} /></div>
                            <div><p className="text-white text-xs font-bold">Top Rated</p><p className="text-white/80 text-[10px]">Over 1k+ 5-star reviews</p></div>
                        </motion.div>
                    </motion.div>
                    <div className="absolute bottom-0 left-0 w-full p-12 text-white">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-orange-500 text-orange-500 w-5 h-5 drop-shadow-md" />)}
                        </motion.div>
                        <h2 className="text-5xl font-black tracking-tight mb-4 leading-tight">It's not just food,<br /> It's an <span className="text-orange-500 italic">experience.</span></h2>
                        <p className="text-white/70 text-sm font-medium max-w-md leading-relaxed">Join thousands of foodies who trust Crave for their daily meals. Fresh ingredients, fast delivery, and unforgettable tastes.</p>
                    </div>
                </motion.div>
            </div>

            <style>{`
                html, body {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

        </div>
    );
};

// Extracted Subcomponent to clean up code
const SubmitButton = ({ isLoading, label }) => (
    <motion.button
        layout
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)" }}
        whileTap={{ scale: 0.99 }}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
    >
        {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
        ) : (
            <>
                {label}
                <ArrowRight className="w-4 h-4" />
            </>
        )}
    </motion.button>
);

export default AuthPage;