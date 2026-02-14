import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Store, Bike, CheckCircle, ArrowRight, Loader2, 
    User, Mail, Phone, MapPin, Building2, Map 
} from "lucide-react";
import api from "../services/api"; // Ensure this path is correct

const SpecialOffer = () => {
    const [activeTab, setActiveTab] = useState("restaurant"); // 'restaurant' or 'rider'
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // --- FORM STATES ---
    const [restaurantData, setRestaurantData] = useState({
        restaurantName: "", ownerName: "", email: "", phone: "", address: ""
    });

    const [riderData, setRiderData] = useState({
        fullName: "", email: "", phone: "", city: "", vehicleType: "bike"
    });

    // --- HANDLERS ---
    const handleResChange = (e) => setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });
    const handleRiderChange = (e) => setRiderData({ ...riderData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            if (activeTab === "restaurant") {
                await api.post("/api/restaurant-request", restaurantData);
                setSuccessMsg("Application submitted! We will contact you soon.");
                setRestaurantData({ restaurantName: "", ownerName: "", email: "", phone: "", address: "" });
            } else {
                await api.post("/api/rider-request", riderData);
                setSuccessMsg("Application received! Ride with us soon.");
                setRiderData({ fullName: "", email: "", phone: "", city: "", vehicleType: "bike" });
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.detail || "Submission failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-gray-900 mb-4"
                    >
                        Grow with <span className="text-orange-500">Crave.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-2xl mx-auto"
                    >
                        Join thousands of restaurants and riders who are changing the way food is delivered. 
                        Select your path below.
                    </motion.p>
                </div>

                {/* --- TAB SWITCHER --- */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-2 relative">
                        {/* Animated Background Slider */}
                        <motion.div 
                            layout
                            className="absolute h-[calc(100%-12px)] top-1.5 bg-orange-500 rounded-xl shadow-md z-0"
                            initial={false}
                            animate={{ 
                                left: activeTab === "restaurant" ? "6px" : "50%", 
                                width: "calc(50% - 9px)" 
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        
                        <button
                            onClick={() => { setActiveTab("restaurant"); setSuccessMsg(""); setErrorMsg(""); }}
                            className={`relative z-10 flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-colors duration-200 ${activeTab === 'restaurant' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Store size={18} />
                            For Restaurants
                        </button>
                        <button
                            onClick={() => { setActiveTab("rider"); setSuccessMsg(""); setErrorMsg(""); }}
                            className={`relative z-10 flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-colors duration-200 ${activeTab === 'rider' ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Bike size={18} />
                            For Riders
                        </button>
                    </div>
                </div>

                {/* --- FORM CONTAINER --- */}
                <motion.div 
                    layout
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
                >
                    <div className="grid md:grid-cols-5 h-full">
                        
                        {/* LEFT SIDE: INFO & IMAGE */}
                        <div className="md:col-span-2 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">
                                    {activeTab === "restaurant" ? "Partner with us" : "Become a Rider"}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    {activeTab === "restaurant" 
                                        ? "Reach more customers, increase your sales, and manage orders seamlessly." 
                                        : "Earn money on your own schedule. Be your own boss and deliver smiles."}
                                </p>
                                
                                <ul className="space-y-3">
                                    {[
                                        activeTab === "restaurant" ? "0% Commission for 1st Month" : "Weekly Payouts",
                                        activeTab === "restaurant" ? "24/7 Business Support" : "Flexible Hours",
                                        activeTab === "restaurant" ? "Dashboard Analytics" : "Keep 100% of Tips"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm font-medium">
                                            <CheckCircle size={16} className="text-orange-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Decorative Background Circles */}
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/90 z-0"></div>
                            
                            {/* Background Image based on tab */}
                            <motion.img 
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ duration: 0.5 }}
                                src={activeTab === "restaurant" 
                                    ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000&auto=format&fit=crop" 
                                    : "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1000&auto=format&fit=crop"}
                                className="absolute inset-0 w-full h-full object-cover -z-10"
                            />
                        </div>

                        {/* RIGHT SIDE: FORM */}
                        <div className="md:col-span-3 p-8 sm:p-12">
                            <AnimatePresence mode="wait">
                                {activeTab === "restaurant" ? (
                                    <motion.form 
                                        key="res-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4">
                                            <FormInput icon={Building2} name="restaurantName" placeholder="Restaurant Name" value={restaurantData.restaurantName} onChange={handleResChange} />
                                            <FormInput icon={User} name="ownerName" placeholder="Owner Full Name" value={restaurantData.ownerName} onChange={handleResChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput icon={Mail} type="email" name="email" placeholder="Email Address" value={restaurantData.email} onChange={handleResChange} />
                                                <FormInput icon={Phone} type="tel" name="phone" placeholder="Phone Number" value={restaurantData.phone} onChange={handleResChange} />
                                            </div>
                                            <FormInput icon={MapPin} name="address" placeholder="Restaurant Address" value={restaurantData.address} onChange={handleResChange} />
                                        </div>
                                        <SubmitButton isLoading={isLoading} label="Submit Restaurant Application" />
                                    </motion.form>
                                ) : (
                                    <motion.form 
                                        key="rider-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4">
                                            <FormInput icon={User} name="fullName" placeholder="Full Name" value={riderData.fullName} onChange={handleRiderChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput icon={Mail} type="email" name="email" placeholder="Email Address" value={riderData.email} onChange={handleRiderChange} />
                                                <FormInput icon={Phone} type="tel" name="phone" placeholder="Phone Number" value={riderData.phone} onChange={handleRiderChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput icon={Map} name="city" placeholder="City" value={riderData.city} onChange={handleRiderChange} />
                                                
                                                {/* Vehicle Select */}
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Bike className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <select
                                                        name="vehicleType"
                                                        value={riderData.vehicleType}
                                                        onChange={handleRiderChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none text-gray-700"
                                                    >
                                                        <option value="bike">Bike / Scooter</option>
                                                        <option value="bicycle">Bicycle</option>
                                                        <option value="car">Car</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <SubmitButton isLoading={isLoading} label="Submit Rider Application" />
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* MESSAGES */}
                            <div className="mt-4">
                                {successMsg && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2">
                                        <CheckCircle size={18} /> {successMsg}
                                    </motion.div>
                                )}
                                {errorMsg && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold">
                                        {errorMsg}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

// --- SUBCOMPONENTS ---
const FormInput = ({ icon: Icon, type = "text", ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500 text-gray-400">
            <Icon className="h-5 w-5" />
        </div>
        <input
            type={type}
            required
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-900"
            {...props}
        />
    </div>
);

const SubmitButton = ({ isLoading, label }) => (
    <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
    >
        {isLoading ? <Loader2 className="animate-spin" /> : <>{label} <ArrowRight size={18} /></>}
    </button>
);

export default SpecialOffer;