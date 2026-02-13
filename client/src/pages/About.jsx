import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    Users,
    Store,
    Bike,
    CheckCircle2,
    Award,
    Zap,
    ShieldCheck,
    ShoppingBasket,
    X,
    Loader2,
    ArrowRight
} from "lucide-react";
import api from '../services/api';

/* ---------- Animated Counter ---------- */
const Counter = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [isInView, end, duration]);

    return (
        <span ref={ref} className="text-5xl font-extrabold bg-gradient-to-br from-orange-600 to-amber-500 bg-clip-text text-transparent">
            {count.toLocaleString()}+
        </span>
    );
};

/* ---------- Reveal Wrapper ---------- */
const FadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay }}
    >
        {children}
    </motion.div>
);

/* ---------- REGISTRATION MODAL COMPONENT (Dark Header UI) ---------- */
const RegistrationModal = ({ isOpen, onClose, type }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        vehicleType: "bike"
    });

    // Reset logic
    useEffect(() => {
        if (!isOpen) {
            setSubmitted(false);
            setFormData({ restaurantName: "", ownerName: "", email: "", phone: "", address: "", vehicleType: "bike" });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = type === 'restaurant' ? '/api/restaurant-request' : '/api/rider-request';
        // Payload mapping
        const payload = type === 'restaurant' 
            ? { ...formData }
            : { 
                fullName: formData.ownerName, 
                email: formData.email, 
                phone: formData.phone, 
                city: formData.address, 
                vehicleType: formData.vehicleType 
              };

        try {
            await api.post(endpoint, payload);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting form", error);
            if (error.response && error.response.data && error.response.data.detail) {
                alert(`Error: ${error.response.data.detail}`);
            } else {
                alert("Something went wrong. Please check your connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Styles for the split-tone UI inputs
    const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
    const inputStyle = "w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-300 focus:border-orange-500 outline-none transition-all";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto relative overflow-hidden flex flex-col z-10"
                    >
                        {/* --- DARK HEADER --- */}
                        <div className="bg-slate-900 p-8 pb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-[50px] opacity-10 pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    {type === 'restaurant' ? 'Partner Application' : 'Rider Application'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1 font-medium">
                                    {type === 'restaurant' ? 'Join the culinary revolution.' : 'Join our fleet today.'}
                                </p>
                            </div>

                            <button onClick={onClose} type="button" className="absolute top-5 right-5 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 cursor-pointer">
                                <X className="w-5 h-5 pointer-events-none" />
                            </button>
                        </div>

                        {/* --- CONTENT SECTION --- */}
                        <div className="px-8 pb-8 relative flex-1 bg-white">
                            {/* Floating Badge */}
                            <div className="absolute -top-8 left-8">
                                <div className={`h-16 w-16 rounded-2xl shadow-lg flex items-center justify-center rotate-3 border-4 border-white ${type === 'restaurant' ? 'bg-orange-600 shadow-orange-600/30' : 'bg-blue-600 shadow-blue-600/30'}`}>
                                    {type === 'restaurant' ? <Store className="w-8 h-8 text-white" /> : <Bike className="w-8 h-8 text-white" />}
                                </div>
                            </div>

                            <div className="mt-12">
                                {!submitted ? (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {type === 'restaurant' && (
                                                <div className="space-y-1">
                                                    <label className={labelStyle}>Business Name</label>
                                                    <input required name="restaurantName" value={formData.restaurantName} onChange={handleChange} type="text" className={inputStyle} placeholder="Tasty Bites" />
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <label className={labelStyle}>{type === 'restaurant' ? 'Owner Name' : 'Full Name'}</label>
                                                <input required name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" className={inputStyle} placeholder="John Doe" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1">
                                                <label className={labelStyle}>Contact Email</label>
                                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className={inputStyle} placeholder="hello@example.com" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className={labelStyle}>Phone</label>
                                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className={inputStyle} placeholder="+1 (555) 000-0000" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className={labelStyle}>{type === 'restaurant' ? 'Location' : 'City / Area'}</label>
                                            <textarea required name="address" value={formData.address} onChange={handleChange} rows="1" className={`${inputStyle} resize-none`} placeholder={type === 'restaurant' ? "Full Address" : "Preferred Zone"}></textarea>
                                        </div>

                                        {type === 'rider' && (
                                            <div className="space-y-1">
                                                <label className={labelStyle}>Vehicle</label>
                                                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className={inputStyle}>
                                                    <option value="bike">Motorcycle / Scooter</option>
                                                    <option value="bicycle">Bicycle</option>
                                                    <option value="car">Car</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <button type="submit" disabled={loading} className="w-full group relative overflow-hidden bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
                                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="inline-block p-4 rounded-full bg-green-50 border border-green-100 mb-6">
                                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">We hear you!</h3>
                                        <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                            Application received. Credentials will be sent to <span className="text-slate-900 font-bold">{formData.email}</span> shortly.
                                        </p>
                                        <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all">Close Window</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

/* ---------- ABOUT PAGE ---------- */
const About = () => {
    const navigate = useNavigate();
    
    // State for modal visibility and type
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('restaurant'); 

    // Handler to open modal with specific type
    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="font-sans text-slate-900 overflow-x-hidden">

            {/* Render the Modal */}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
            />

            <section className="relative flex items-center justify-center overflow-hidden">
                <div className="relative max-w-7xl mx-auto py-28 text-center z-10">
                    <FadeIn>
                        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-orange-600 bg-orange-100 rounded-full">
                            Redefining Delivery
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
                            About <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 bg-clip-text text-transparent">CRAVE</span>
                        </h1>
                        <p className="max-w-3xl mx-auto text-slate-500 text-xl md:text-2xl leading-relaxed font-light">
                            We aren't just a delivery app. We are the bridge between your
                            <span className="text-slate-900 font-medium"> cravings</span> and the city's
                            <span className="text-slate-900 font-medium"> finest kitchens</span>.
                        </p>
                    </FadeIn>
                </div>
            </section>

            <section>
                <div className="w-[95%] mx-auto py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Total Orders", end: 5000 },
                            { label: "Happy Customers", end: 2000 },
                            { label: "Partnered Chefs", end: 500 },
                            { label: "Fleet Heroes", end: 1000 },
                        ].map((stat, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <Counter end={stat.end} />
                                <p className="text-slate-500 font-medium mt-3 uppercase tracking-wider text-sm">{stat.label}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="w-[95%] mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "For Customers",
                                desc: "Experience a UI so smooth it feels like the food is already there. Precision tracking meets curated taste.",
                                icon: <Users className="w-8 h-8 text-orange-500" />,
                            },
                            {
                                title: "For Restaurants",
                                desc: "We provide the digital backbone. You focus on the recipe; we handle the scale and logistics.",
                                icon: <Store className="w-8 h-8 text-orange-500" />,
                            },
                            {
                                title: "For Partners",
                                desc: "Fairness in every mile. We value our delivery fleet as the heartbeat of our entire operation.",
                                icon: <Bike className="w-8 h-8 text-orange-500" />,
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-10 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group"
                            >
                                <div className="mb-6 p-3 bg-orange-50 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 relative overflow-hidden bg-white">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-[95%] mx-auto relative z-10">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-xs uppercase tracking-widest mb-6">
                                <Zap className="w-3 h-3 fill-orange-600" />
                                <span>Our DNA</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                                Built on <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Principles</span>.
                            </h2>
                            <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
                                We don't just deliver food; we deliver on our promises. These are the core values that drive our technology and our partnerships.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { text: "Customer Obsessed", desc: "Every pixel and every mile is optimized for the user experience.", icon: <CheckCircle2 className="w-6 h-6" /> },
                            { text: "Hyper-Growth", desc: "We move fast, break boundaries, and set new industry standards.", icon: <Zap className="w-6 h-6" /> },
                            { text: "Absolute Integrity", desc: "Transparent pricing, honest tracking, and real relationships.", icon: <ShieldCheck className="w-6 h-6" /> },
                            { text: "Tech-Forward", desc: "Leveraging AI and data to solve hunger before it happens.", icon: <Award className="w-6 h-6" /> },
                            { text: "Partner Respect", desc: "Fair wages and real support for the heroes on the road.", icon: <Users className="w-6 h-6" /> },
                            { text: "Eco-Conscious", desc: "Minimizing our carbon footprint, one delivery at a time.", icon: <Store className="w-6 h-6" /> },
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                className="group relative p-8 h-full bg-white rounded-[2.5rem] border border-slate-100 hover:border-transparent shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:bg-white/20 group-hover:border-white/20 group-hover:text-white transition-all duration-500 shadow-sm">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors duration-500">
                                        {value.text}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed group-hover:text-orange-50 transition-colors duration-500">
                                        {value.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-[95%] mx-auto py-24">
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-30 text-center text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-600 to-amber-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <FadeIn>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight relative z-10">
                            Ready to join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">revolution?</span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium relative z-10">
                            Choose your path and start your CRAVE journey today.
                        </p>
                        
                        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center relative z-10">
                            
                            {/* --- 1. ORDER NOW -> REDIRECT --- */}
                            <motion.button
                                onClick={() => navigate('/rest')}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-900/20 hover:shadow-orange-500/40 transition-all"
                            >
                                <ShoppingBasket className="w-6 h-6 text-white" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-80 uppercase tracking-widest text-orange-100">Hungry?</span>
                                    <span className="text-lg">Order Now</span>
                                </div>
                            </motion.button>

                            {/* --- 2. RESTAURANT PARTNER -> MODAL --- */}
                            <motion.button
                                onClick={() => handleOpenModal('restaurant')}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-white text-slate-900 font-bold shadow-xl hover:bg-slate-50 transition-all"
                            >
                                <Store className="w-6 h-6 text-slate-900" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-60 uppercase tracking-widest text-slate-500">Business</span>
                                    <span className="text-lg">Add Restaurant</span>
                                </div>
                            </motion.button>

                            {/* --- 3. RIDER -> MODAL --- */}
                            <motion.button
                                onClick={() => handleOpenModal('rider')}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-slate-800 backdrop-blur-md text-white border border-slate-700 font-bold shadow-xl hover:bg-slate-700 transition-all"
                            >
                                <Bike className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-60 uppercase tracking-widest text-slate-400">Earn Money</span>
                                    <span className="text-lg">Become a Rider</span>
                                </div>
                            </motion.button>
                        </div>
                    </FadeIn>
                </div>
            </section>

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

export default About;