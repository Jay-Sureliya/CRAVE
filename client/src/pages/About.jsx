import React, { useEffect, useRef, useState } from "react";
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
    Loader2
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

/* ---------- NEW: REGISTRATION MODAL ---------- */
const RestaurantRegistrationModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // CALL THE REAL API
            await api.post('/api/restaurant-request', formData);
            
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting form", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl pointer-events-auto relative mx-4">
                            <button 
                                onClick={onClose} 
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>

                            {!submitted ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Store className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Partner with CRAVE</h2>
                                        <p className="text-gray-500 text-sm mt-2">Fill out the details below. Our admin team will review your request and send credentials to your email.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                                            <input required name="restaurantName" onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="Tasty Bites" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                                            <input required name="ownerName" onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="John Doe" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input required name="email" onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="john@example.com" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input required name="phone" onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="+1 234 567 890" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Address</label>
                                            <textarea required name="address" onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="123 Food Street, City"></textarea>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h3>
                                    <p className="text-gray-500">
                                        Thank you for your interest. We have received your details. 
                                        Once approved, you will receive your <strong>Login Credentials</strong> via email at <span className="font-semibold text-gray-900">{formData.email}</span>.
                                    </p>
                                    <button onClick={onClose} className="mt-8 px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

/* ---------- ABOUT PAGE ---------- */
const About = () => {
    // State to control modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="font-sans text-slate-900 overflow-x-hidden bg-gray-50">
            
            {/* Render the Modal */}
            <RestaurantRegistrationModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />

            <section className="pb-30 relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
                <div className="absolute top-0 -left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-28 text-center z-10">
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

            <section className="bg-gray-50 ">
                <div className="max-w-7xl mx-auto px-6">
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

            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
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

            <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-10 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-7xl mx-auto px-10 relative z-10">
                    <FadeIn>
                        <h2 className="text-4xl font-bold mb-16 text-center">Our Core Values</h2>
                    </FadeIn>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { text: "Customer Obsessed", icon: <CheckCircle2 className="w-5 h-5" /> },
                            { text: "Hyper-Growth", icon: <Zap className="w-5 h-5" /> },
                            { text: "Absolute Integrity", icon: <ShieldCheck className="w-5 h-5" /> },
                            { text: "Tech-Forward", icon: <Award className="w-5 h-5" /> },
                            { text: "Partner Respect", icon: <Users className="w-5 h-5" /> },
                            { text: "Eco-Conscious", icon: <Store className="w-5 h-5" /> },
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                            >
                                <span className="text-orange-400">{value.icon}</span>
                                <p className="font-semibold text-lg tracking-wide">{value.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24 bg-gray-50">
                <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <FadeIn>
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Ready to join the <span className="text-slate-900">revolution?</span>
                        </h2>
                        <p className="text-orange-50 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                            Choose your path and start your CRAVE journey today.
                        </p>
                        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-slate-900 text-white font-bold shadow-xl hover:bg-slate-800 transition-all"
                            >
                                <ShoppingBasket className="w-6 h-6 text-orange-500" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-70 uppercase tracking-widest">Hungry?</span>
                                    <span className="text-lg">Order Now</span>
                                </div>
                            </motion.button>
                            
                            {/* --- THIS BUTTON TRIGGERS THE MODAL --- */}
                            <motion.button
                                onClick={() => setIsModalOpen(true)}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-white text-orange-600 font-bold shadow-xl hover:bg-gray-50 transition-all"
                            >
                                <Store className="w-6 h-6" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-70 uppercase tracking-widest">Business</span>
                                    <span className="text-lg">Add Restaurant</span>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-orange-700/30 backdrop-blur-md text-white border border-white/20 font-bold shadow-xl hover:bg-orange-700/40 transition-all"
                            >
                                <Bike className="w-6 h-6" />
                                <div className="text-left">
                                    <span className="block text-xs opacity-80 uppercase tracking-widest">Earn Money</span>
                                    <span className="text-lg">Become a Rider</span>
                                </div>
                            </motion.button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            <footer className="bg-gray-50 py-10 text-center text-slate-400 text-sm border-t border-gray-200">
                <p>&copy; 2026 CRAVE Technologies Inc. Built for the bold.</p>
            </footer>

            <style>{`
                html, body {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                    display: none;
                }
                @keyframes blob {
                  0% { transform: translate(0px, 0px) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                  100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                  animation: blob 7s infinite;
                }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default About;