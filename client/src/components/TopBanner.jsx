// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { MapPin, ShoppingBasket, Navigation, X, CheckCircle2 } from "lucide-react";
// // import { motion, AnimatePresence } from "framer-motion";

// // const TopBanner = ({ isMapOpen, setIsMapOpen }) => {
// //     const navigate = useNavigate();

// //     // Initialize state with localStorage value if it exists, otherwise default
// //     const [location, setLocation] = useState(localStorage.getItem("user_location") || "Select Location");
// //     const [manualLocation, setManualLocation] = useState("");
// //     const [coords, setCoords] = useState({ lat: 51.5074, lng: -0.1278 });

// //     // --- 1. CHECK ON LOAD: Open Modal if no location saved ---
// //     useEffect(() => {
// //         const savedLocation = localStorage.getItem("user_location");
// //         if (savedLocation) {
// //             setLocation(savedLocation);
// //         } else {
// //             setIsMapOpen(true); // Open modal automatically on first visit
// //         }
// //     }, [setIsMapOpen]);

// //     // --- Helper to update state and storage ---
// //     const updateLocation = (newLoc) => {
// //         setLocation(newLoc);
// //         localStorage.setItem("user_location", newLoc); // Save globally
// //         setIsMapOpen(false);
// //         // Optional: window.location.reload(); // Uncomment if you need to force refresh data immediately
// //     };

// //     const handleSetCurrentLocation = () => {
// //         if (navigator.geolocation) {
// //             navigator.geolocation.getCurrentPosition((position) => {
// //                 const { latitude, longitude } = position.coords;
// //                 setCoords({ lat: latitude, lng: longitude });

// //                 // In a real app, use a Geocoding API here to get the city name
// //                 const locString = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
// //                 updateLocation(locString);
// //             });
// //         }
// //     };

// //     const handleManualSubmit = () => {
// //         if (manualLocation.trim()) {
// //             updateLocation(manualLocation);
// //             setManualLocation("");
// //         }
// //     };

// //     return (
// //         <div className="w-full pb-2 bg-white">

// //             {/* --- MAIN HEADER BANNER (Floating Card Style) --- */}
// //             <div className="w-[95%] mx-auto flex items-center justify-between bg-gray-100 rounded-bl-xl rounded-br-xl border border-slate-200 overflow-hidden h-14">

// //                 {/* LEFT: Promo Section */}
// //                 <div className="hidden md:flex items-center px-6 h-full">
// //                     <span className="text-xl">🌟</span>
// //                     <p className="text-sm font-semibold text-slate-700">
// //                         Get 5% Off your first order, <span className="text-orange-500 font-bold">Promo: ORDER5</span>
// //                     </p>
// //                 </div>

// //                 {/* CENTER: Location Section */}
// //                 <div className="flex flex-1 items-center justify-center gap-2 px-4 h-full border-l border-slate-100 md:border-none">
// //                     <MapPin className="w-5 h-5 text-slate-900 " />
// //                     <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-[300px]">{location}</p>
// //                     <button
// //                         onClick={() => setIsMapOpen(true)}
// //                         className="text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 ml-2 transition-colors whitespace-nowrap"
// //                     >
// //                         Change Location
// //                     </button>
// //                 </div>

// //                 {/* RIGHT: Cart Section (Green Background) */}
// //                 <div
// //                     onClick={() => navigate("/cart")}
// //                     className="flex items-center bg-[#008a46] text-white h-full cursor-pointer hover:bg-[#00753b] transition-colors pl-6 pr-6 gap-6"
// //                 >
// //                     {/* Basket Icon */}
// //                     <div className="relative">
// //                         <ShoppingBasket className="w-6 h-6" />
// //                         <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
// //                             <div className="bg-[#008a46] rounded-full w-2.5 h-2.5 flex items-center justify-center">
// //                                 <span className="text-[6px] text-white">✓</span>
// //                             </div>
// //                         </div>
// //                     </div>

// //                     {/* Text Info */}
// //                     <div className="flex items-center gap-6 text-sm font-bold">
// //                         <span className="whitespace-nowrap">23 Items</span>
// //                     </div>

// //                 </div>
// //             </div>

// //             {/* --- LOCATION MODAL (Unchanged UI) --- */}
// //             <AnimatePresence>
// //                 {isMapOpen && (
// //                     <motion.div
// //                         initial={{ opacity: 0 }}
// //                         animate={{ opacity: 1 }}
// //                         exit={{ opacity: 0 }}
// //                         className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
// //                     >
// //                         <motion.div
// //                             initial={{ scale: 0.95, opacity: 0 }}
// //                             animate={{ scale: 1, opacity: 1 }}
// //                             exit={{ scale: 0.95, opacity: 0 }}
// //                             className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
// //                         >
// //                             <div className="p-6 flex items-center justify-between border-b border-slate-100">
// //                                 <h3 className="text-xl font-bold text-slate-900">Select Location</h3>
// //                                 {/* Only allow closing if a location is already set */}
// //                                 {location !== "Select Location" && (
// //                                     <button onClick={() => setIsMapOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
// //                                         <X className="w-5 h-5 text-slate-600" />
// //                                     </button>
// //                                 )}
// //                             </div>

// //                             <div className="p-6 space-y-6">
// //                                 <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative">
// //                                     <iframe
// //                                         title="satellite-view"
// //                                         width="100%"
// //                                         height="100%"
// //                                         frameBorder="0"
// //                                         style={{ border: 0 }}
// //                                         src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`}
// //                                         allowFullScreen
// //                                     ></iframe>
// //                                 </div>

// //                                 <button
// //                                     onClick={handleSetCurrentLocation}
// //                                     className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all"
// //                                 >
// //                                     <Navigation className="w-5 h-5 fill-current" />
// //                                     Use My Current Location
// //                                 </button>

// //                                 <div className="flex gap-2">
// //                                     <div className="relative flex-1">
// //                                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
// //                                         <input
// //                                             type="text"
// //                                             value={manualLocation}
// //                                             onChange={(e) => setManualLocation(e.target.value)}
// //                                             placeholder="Search for street, city..."
// //                                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
// //                                             onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
// //                                         />
// //                                     </div>
// //                                     <button
// //                                         onClick={handleManualSubmit}
// //                                         className="bg-slate-900 text-white px-6 rounded-xl hover:bg-slate-800 transition-colors"
// //                                     >
// //                                         <CheckCircle2 className="w-6 h-6" />
// //                                     </button>
// //                                 </div>
// //                             </div>
// //                         </motion.div>
// //                     </motion.div>
// //                 )}
// //             </AnimatePresence>
// //         </div>
// //     );
// // };

// // export default TopBanner;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { MapPin, ShoppingBasket, Navigation, X, CheckCircle2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const TopBanner = ({ isMapOpen, setIsMapOpen }) => {
//     const navigate = useNavigate();

//     // Default to "Select Location" if nothing in storage
//     const [location, setLocation] = useState(localStorage.getItem("user_location") || "Select Location");
//     const [manualLocation, setManualLocation] = useState("");
//     const [coords, setCoords] = useState({ lat: 51.5074, lng: -0.1278 });

//     // --- 1. CRITICAL: CHECK ON LOAD ---
//     useEffect(() => {
//         const savedLocation = localStorage.getItem("user_location");

//         // Open Popup if:
//         // 1. No location exists in storage (First visit)
//         // 2. OR location is just the placeholder "Select Location"
//         if (!savedLocation || savedLocation === "Select Location") {
//             setIsMapOpen(true);
//         } else {
//             setLocation(savedLocation);
//         }
//     }, [setIsMapOpen]); // Run once on mount

//     // --- 2. UPDATE HELPER ---
//     const updateLocation = (newLoc) => {
//         setLocation(newLoc);
//         localStorage.setItem("user_location", newLoc); // Save to Browser
//         setIsMapOpen(false); // Close Popup

//         // Force refresh so Home/Restaurant pages pick up the new location
//         window.location.reload(); 
//     };

//     const handleSetCurrentLocation = () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition((position) => {
//                 const { latitude, longitude } = position.coords;
//                 setCoords({ lat: latitude, lng: longitude });
//                 const locString = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
//                 updateLocation(locString);
//             });
//         }
//     };

//     const handleManualSubmit = () => {
//         if (manualLocation.trim()) {
//             updateLocation(manualLocation);
//             setManualLocation("");
//         }
//     };

//     return (
//         <div className="w-full pb-2 bg-white">
//             {/* --- MAIN HEADER BANNER --- */}
//             <div className="w-[95%] mx-auto flex items-center justify-between bg-gray-100 rounded-bl-xl rounded-br-xl border border-slate-200 overflow-hidden h-14">

//                 {/* Promo */}
//                 <div className="hidden md:flex items-center px-6 h-full">
//                     <span className="text-xl">🌟</span>
//                     <p className="text-sm font-semibold text-slate-700">
//                         Get 5% Off your first order, <span className="text-orange-500 font-bold">Promo: ORDER5</span>
//                     </p>
//                 </div>

//                 {/* Location Trigger */}
//                 <div className="flex flex-1 items-center justify-center gap-2 px-4 h-full border-l border-slate-100 md:border-none">
//                     <MapPin className="w-5 h-5 text-slate-900" />
//                     <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-[300px]">
//                         {location}
//                     </p>
//                     <button
//                         onClick={() => setIsMapOpen(true)}
//                         className="text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 ml-2 transition-colors whitespace-nowrap"
//                     >
//                         Change Location
//                     </button>
//                 </div>

//                 {/* Cart */}
//                 <div onClick={() => navigate("/cart")} className="flex items-center bg-[#008a46] text-white h-full cursor-pointer hover:bg-[#00753b] transition-colors pl-6 pr-6 gap-6">
//                     <div className="relative">
//                         <ShoppingBasket className="w-6 h-6" />
//                         <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
//                             <div className="bg-[#008a46] rounded-full w-2.5 h-2.5 flex items-center justify-center">
//                                 <span className="text-[6px] text-white">✓</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-6 text-sm font-bold">
//                         <span className="whitespace-nowrap">23 Items</span>
//                     </div>
//                 </div>
//             </div>

//             {/* --- LOCATION MODAL --- */}
//             <AnimatePresence>
//                 {isMapOpen && (
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
//                     >
//                         <motion.div
//                             initial={{ scale: 0.95, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             exit={{ scale: 0.95, opacity: 0 }}
//                             className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
//                         >
//                             <div className="p-6 flex items-center justify-between border-b border-slate-100">
//                                 <h3 className="text-xl font-bold text-slate-900">Select Location</h3>

//                                 {/* Only show Close button if we ALREADY have a valid location */}
//                                 {location && location !== "Select Location" && (
//                                     <button onClick={() => setIsMapOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
//                                         <X className="w-5 h-5 text-slate-600" />
//                                     </button>
//                                 )}
//                             </div>

//                             <div className="p-6 space-y-6">
//                                 {/* Map */}
//                                 <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative">
//                                     <iframe
//                                         title="map"
//                                         width="100%"
//                                         height="100%"
//                                         frameBorder="0"
//                                         style={{ border: 0 }}
//                                         src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`}
//                                         allowFullScreen
//                                     ></iframe>
//                                 </div>

//                                 {/* Current Location Button */}
//                                 <button
//                                     onClick={handleSetCurrentLocation}
//                                     className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all"
//                                 >
//                                     <Navigation className="w-5 h-5 fill-current" />
//                                     Use My Current Location
//                                 </button>

//                                 {/* Manual Input */}
//                                 <div className="flex gap-2">
//                                     <div className="relative flex-1">
//                                         <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                         <input
//                                             type="text"
//                                             value={manualLocation}
//                                             onChange={(e) => setManualLocation(e.target.value)}
//                                             placeholder="Enter City (e.g. Rajkot)"
//                                             className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
//                                             onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
//                                         />
//                                     </div>
//                                     <button
//                                         onClick={handleManualSubmit}
//                                         className="bg-slate-900 text-white px-6 rounded-xl hover:bg-slate-800 transition-colors"
//                                     >
//                                         <CheckCircle2 className="w-6 h-6" />
//                                     </button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// export default TopBanner;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ShoppingBasket, Navigation, X, CheckCircle2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

// --- IMPORT DRAWERS ---
import Cart from "./cart";
import FavoritesDrawer from "./FavoritesDrawer";

const TopBanner = ({ isMapOpen, setIsMapOpen }) => {
    const navigate = useNavigate();

    // --- 1. LOCATION STATE ---
    const [location, setLocation] = useState(localStorage.getItem("user_location") || "Select Location");
    const [manualLocation, setManualLocation] = useState("");
    const [coords, setCoords] = useState({ lat: 51.5074, lng: -0.1278 });

    // --- 2. DRAWER & DATA STATES ---
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFavOpen, setIsFavOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [favItems, setFavItems] = useState([]);

    // --- 3. FETCH DATA (Improved) ---
    const fetchCartData = async () => {
        try {
            console.log("TopBanner: Fetching Cart...");
            const res = await api.get("/api/cart");
            console.log("TopBanner: Cart Data Received", res.data);
            setCartItems(res.data);
        } catch (err) {
            console.warn("TopBanner: Cart Fetch Failed (Guest or Error)", err);
        }
    };

    const fetchFavData = async () => {
        try {
            console.log("TopBanner: Fetching Favorites...");
            const res = await api.get("/api/favorites/list");
            console.log("TopBanner: Favorites Data Received", res.data);
            setFavItems(res.data);
        } catch (err) {
            console.warn("TopBanner: Fav Fetch Failed", err);
        }
    };

    const refreshAll = () => {
        fetchCartData();
        fetchFavData();
    };

    useEffect(() => {
        // Initial Load
        refreshAll();

        // Listen for events from RestaurantDetails
        window.addEventListener('cart-updated', fetchCartData);
        window.addEventListener('fav-updated', fetchFavData);

        return () => {
            window.removeEventListener('cart-updated', fetchCartData);
            window.removeEventListener('fav-updated', fetchFavData);
        };
    }, []);

    // --- 4. CHECK LOCATION ON LOAD ---
    useEffect(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (!savedLocation || savedLocation === "Select Location") {
            setIsMapOpen(true);
        } else {
            setLocation(savedLocation);
        }
    }, [setIsMapOpen]);

    // --- HANDLERS ---
    const handleUpdateCart = async (itemId, delta) => {
        try {
            await api.post("/api/cart", { menu_item_id: itemId, quantity: delta });
            fetchCartData(); // Refresh local state
            window.dispatchEvent(new Event('cart-updated')); // Notify other components
        } catch (err) { console.error(err); }
    };

    const handleRemoveFav = async (itemId) => {
        try {
            await api.post(`/api/favorites/${itemId}`);
            fetchFavData(); // Refresh local state
            window.dispatchEvent(new Event('fav-updated')); // Notify other components
        } catch (err) { console.error(err); }
    };

    // Location Helpers
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
                const locString = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
                updateLocation(locString);
            });
        }
    };

    const handleManualSubmit = () => {
        if (manualLocation.trim()) {
            updateLocation(manualLocation);
            setManualLocation("");
        }
    };

    // Calculate Counts
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const favCount = favItems.length;

    return (
        <div className="w-full pb-2 bg-white">

            {/* --- MAIN HEADER BANNER --- */}
            <div className="w-[95%] mx-auto flex items-center justify-between bg-gray-100 rounded-bl-xl rounded-br-xl border border-slate-200 overflow-hidden h-14">

                {/* LEFT: Promo */}
                <div className="hidden md:flex items-center px-6 h-full">
                    <span className="text-xl">🌟</span>
                    <p className="text-sm font-semibold text-slate-700">
                        Get 5% Off your first order, <span className="text-orange-500 font-bold">Promo: ORDER5</span>
                    </p>
                </div>

                {/* CENTER: Location */}
                <div className="flex flex-1 items-center justify-center gap-2 px-4 h-full border-l border-slate-100 md:border-none">
                    <MapPin className="w-5 h-5 text-slate-900" />
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[200px] md:max-w-[300px]">{location}</p>
                    <button
                        onClick={() => setIsMapOpen(true)}
                        className="text-sm font-bold text-orange-500 hover:text-orange-600 underline underline-offset-2 ml-2 transition-colors whitespace-nowrap"
                    >
                        Change Location
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex h-full">

                    {/* NEW: Favorites Button */}
                    <div
                        onClick={() => setIsFavOpen(true)}
                        className="flex items-center justify-center px-5 h-full cursor-pointer hover:bg-slate-200 border-l border-slate-200 transition-colors relative group"
                        title="Your Favorites"
                    >
                        <Heart className="w-6 h-6 text-slate-500 group-hover:text-red-500 transition-colors" />
                        {favCount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                {favCount}
                            </div>
                        )}
                    </div>

                    {/* Cart Button */}
                    <div
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center bg-[#008a46] text-white h-full cursor-pointer hover:bg-[#00753b] transition-colors pl-6 pr-6 gap-6"
                    >
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

            {/* --- LOCATION MODAL --- */}
            <AnimatePresence>
                {isMapOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Select Location</h3>
                                {location !== "Select Location" && (
                                    <button onClick={() => setIsMapOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative">
                                    <iframe
                                        title="map"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`}
                                        allowFullScreen
                                    ></iframe>
                                </div>

                                <button onClick={handleSetCurrentLocation} className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-all">
                                    <Navigation className="w-5 h-5 fill-current" />
                                    Use My Current Location
                                </button>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={manualLocation}
                                            onChange={(e) => setManualLocation(e.target.value)}
                                            placeholder="Enter City (e.g. Rajkot)"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                                            onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
                                        />
                                    </div>
                                    <button onClick={handleManualSubmit} className="bg-slate-900 text-white px-6 rounded-xl hover:bg-slate-800 transition-colors">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- DRAWERS --- */}
            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdate={handleUpdateCart}
            />

            <FavoritesDrawer
                isOpen={isFavOpen}
                onClose={() => setIsFavOpen(false)}
                favItems={favItems}
                onRemove={handleRemoveFav}
            />
        </div>
    );
};

export default TopBanner;