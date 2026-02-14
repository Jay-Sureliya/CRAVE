import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ShoppingBasket, Navigation, X, CheckCircle2, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

// --- IMPORT DRAWERS ---
import Cart from "./cart";
import FavoritesDrawer from "./FavoritesDrawer";

const Toast = ({ message, type = "success" }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 20, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border ${type === "neutral"
            ? "bg-stone-800 text-white border-stone-700"
            : "bg-stone-900/90 text-white border-white/10"
            }`}
    >
        {type === "success" ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-yellow-400" />}
        <span className="font-medium text-sm">{message}</span>
    </motion.div>
);

const TopBanner = ({ isMapOpen, setIsMapOpen }) => {
    const navigate = useNavigate();
    const locationHook = useLocation();

    // --- STATES ---
    const [location, setLocation] = useState(localStorage.getItem("user_location") || "Select Location");
    const [manualLocation, setManualLocation] = useState("");
    const [coords, setCoords] = useState({ lat: 51.5074, lng: -0.1278 });

    // Auth & Data States
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFavOpen, setIsFavOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [favItems, setFavItems] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- HELPER: Get Clean Token ---
    const getToken = () => {
        // Check both Local and Session storage
        let raw = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("access_token");
        if (!raw) {
            raw = sessionStorage.getItem("authToken") || sessionStorage.getItem("token") || sessionStorage.getItem("access_token");
        }
        if (!raw) return null;
        return raw.replace(/^"|"$/g, ''); // Clean quotes
    };

    // --- HELPER: Handle Logout on 401 ---
    const handleLogout = () => {
        console.warn("Session invalid. Logging out.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        sessionStorage.clear();
        setIsAuthenticated(false);
        setCartItems([]);
        setFavItems([]);
    };

    // --- DATA FETCHING ---
    const fetchCartData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await api.get("/api/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(res.data);
            setIsAuthenticated(true); // We know we are logged in if this succeeds
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLogout();
            }
        }
    };

    const fetchFavData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await api.get("/api/favorites/list", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavItems(res.data);
            setIsAuthenticated(true);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                handleLogout();
            }
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        const token = getToken();

        // 1. Immediate UI update based on token existence
        if (token) {
            setIsAuthenticated(true);
            fetchCartData();
            fetchFavData();
        } else {
            setIsAuthenticated(false);
            setCartItems([]);
            setFavItems([]);
        }

        // 2. Auto Refresh Interval
        const intervalId = setInterval(() => {
            if (getToken()) {
                fetchCartData();
                fetchFavData();
            }
        }, 5000);

        // 3. Event Listeners
        window.addEventListener('cart-updated', fetchCartData);
        window.addEventListener('fav-updated', fetchFavData);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('cart-updated', fetchCartData);
            window.removeEventListener('fav-updated', fetchFavData);
        };
    }, [locationHook.pathname]);

    // --- HANDLERS ---
    const handleOpenCart = () => {
        // FIX: Check token directly, don't wait for state
        if (!getToken()) {
            showToast("Sign in first to view cart", "neutral");
        } else {
            setIsCartOpen(true);
        }
    };

    const handleUpdateCart = async (itemId, delta) => {
        const token = getToken();
        if (!token) {
            showToast("Sign in first", "neutral");
            return;
        }

        try {
            await api.post("/api/cart", { menu_item_id: itemId, quantity: delta }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCartData();
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            if (err.response && err.response.status === 401) handleLogout();
        }
    };

    const handleRemoveFav = async (itemId) => {
        const token = getToken();
        if (!token) return;

        try {
            await api.post(`/api/favorites/${itemId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFavData();
            window.dispatchEvent(new Event('fav-updated'));
            showToast("Removed from Favorites", "neutral");
        } catch (err) {
            if (err.response && err.response.status === 401) handleLogout();
        }
    };

    // --- LOCATION LOGIC ---
    useEffect(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (!savedLocation || savedLocation === "Select Location") {
            setIsMapOpen(true);
        } else {
            setLocation(savedLocation);
        }
    }, [setIsMapOpen]);

    const updateLocation = (newLoc) => {
        setLocation(newLoc);
        localStorage.setItem("user_location", newLoc);
        setIsMapOpen(false);
        window.location.reload();
    };

    const handleSetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                updateLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
            });
        }
    };

    const handleManualSubmit = () => {
        if (manualLocation.trim()) {
            updateLocation(manualLocation);
            setManualLocation("");
        }
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const favCount = favItems.length;

    return (
        <div className="w-full pb-2 bg-white">
            <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

            <div className="w-[95%] mx-auto flex items-center justify-between bg-gray-100 rounded-bl-xl rounded-br-xl border border-slate-200 overflow-hidden h-14">
                <div className="hidden md:flex items-center px-6 h-full">
                    <span className="text-xl">🌟</span>
                    <p className="text-sm font-semibold text-slate-700">
                        Get 5% Off your first order, <span className="text-orange-500 font-bold">Promo: ORDER5</span>
                    </p>
                </div>

                <div className="flex flex-1 items-center justify-center gap-2 px-4 h-full border-l border-slate-100 md:border-none">
                    <MapPin className="w-5 h-5 text-slate-900" />
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-[300px]">{location}</p>
                    <button onClick={() => setIsMapOpen(true)} className="text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 ml-2 transition-colors whitespace-nowrap">
                        Change Location
                    </button>
                </div>

                <div className="flex h-full">
                    {/* FAVORITES BUTTON - FIX: Check getToken() directly */}
                    <div
                        onClick={() => getToken() ? setIsFavOpen(true) : showToast("Sign in first", "neutral")}
                        className="flex items-center justify-center px-5 h-full cursor-pointer hover:bg-slate-200 border-l border-slate-200 transition-colors relative group"
                    >
                        <Heart className="w-6 h-6 text-slate-500 group-hover:text-red-500 transition-colors" />
                        {favCount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {favCount}
                            </div>
                        )}
                    </div>

                    {/* CART BUTTON */}
                    <div onClick={handleOpenCart} className="flex items-center bg-[#008a46] text-white h-full cursor-pointer hover:bg-[#00753b] transition-colors pl-6 pr-6 gap-6">
                        <div className="relative">
                            <ShoppingBasket className="w-6 h-6" />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                <div className="bg-[#008a46] rounded-full w-2.5 h-2.5 flex items-center justify-center">
                                    <span className="text-[6px] text-white">✓</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold">
                            <span className="whitespace-nowrap">{cartCount} Items</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS AND DRAWERS (Unchanged) */}
            <AnimatePresence>
                {isMapOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 flex items-center justify-between border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Select Location</h3>
                                {location !== "Select Location" && (
                                    <button onClick={() => setIsMapOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                                )}
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative">
                                    <iframe title="map" width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`} allowFullScreen></iframe>
                                </div>
                                <button onClick={handleSetCurrentLocation} className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all">
                                    <Navigation className="w-5 h-5 fill-current" /> Use My Current Location
                                </button>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="text" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="Enter City (e.g. Rajkot)" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()} />
                                    </div>
                                    <button onClick={handleManualSubmit} className="bg-slate-900 text-white px-6 rounded-xl hover:bg-slate-800 transition-colors"><CheckCircle2 className="w-6 h-6" /></button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdate={handleUpdateCart}
                isGuest={!isAuthenticated}
            />

            <FavoritesDrawer
                isOpen={isFavOpen}
                onClose={() => setIsFavOpen(false)}
                favItems={favItems}
                onRemove={handleRemoveFav}
                isGuest={!isAuthenticated}
            />
        </div>
    );
};

export default TopBanner;