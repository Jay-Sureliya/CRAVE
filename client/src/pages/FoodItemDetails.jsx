// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { 
//   ArrowLeft, Minus, Plus, Star, Clock, Flame, 
//   Heart, Share2, Check, Loader2, ShoppingBag, 
//   Utensils, Info, AlertCircle 
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../services/api";

// const FoodItemDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // --- STATE ---
//   const [item, setItem] = useState(location.state?.item || null);
//   const [loading, setLoading] = useState(!location.state?.item);
//   const [qty, setQty] = useState(1);
//   const [isFav, setIsFav] = useState(false);

//   // Customization State
//   const [selectedAddons, setSelectedAddons] = useState(new Set());

//   // --- FETCH DATA ---
//   useEffect(() => {
//     const fetchItemDetails = async () => {
//       try {
//         if (!item) setLoading(true);
//         const response = await api.get(`/api/public/menu/item/${id}`);
//         if (response.data) setItem(response.data);
//       } catch (error) {
//         console.error("Failed to fetch item:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItemDetails();
//   }, [id]);

//   // --- HELPERS ---
//   const getImageUrl = (itm) => {
//     if (!itm) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
//     if (itm.image && (itm.image.startsWith("data:") || itm.image.startsWith("http"))) return itm.image;
//     return `http://localhost:8000/api/menu/image/${itm.id}`;
//   };

//   const availableAddons = useMemo(() => {
//     if (!item || !item.addons) return [];
//     if (typeof item.addons === 'string') {
//         try { return JSON.parse(item.addons); } catch (e) { return []; }
//     }
//     return Array.isArray(item.addons) ? item.addons : [];
//   }, [item]);

//   const basePrice = item ? (item.discountPrice || item.discount_price || item.price) : 0;

//   const totalPrice = useMemo(() => {
//     let total = parseFloat(basePrice);
//     selectedAddons.forEach(addonId => {
//         const addon = availableAddons.find(a => a.id === addonId);
//         if(addon) total += parseFloat(addon.price);
//     });
//     return total * qty;
//   }, [basePrice, selectedAddons, availableAddons, qty]);

//   // --- FIXED ADD TO CART ---
//   const handleAddToCart = async () => {
//     // 1. FIX: Check sessionStorage first (where your Login saves it)
//     const token = sessionStorage.getItem("token") || localStorage.getItem("token");

//     if (!token) {
//         alert("Please sign in first!");
//         return;
//     }

//     try {
//         // 2. FIX: Explicitly pass the Authorization header
//         await api.post("/api/cart", { 
//             menu_item_id: item.id, 
//             quantity: qty,
//         }, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         // 3. Success Feedback
//         window.dispatchEvent(new Event('cart-updated')); // Updates TopBanner count
//         navigate(-1); // Go back to menu
//     } catch (err) {
//         console.error("Add to cart failed", err);
//         if (err.response && err.response.status === 401) {
//             alert("Session expired. Please login again.");
//         } else {
//             alert("Failed to add to cart");
//         }
//     }
//   };

//   const toggleAddon = (addonId) => {
//     const next = new Set(selectedAddons);
//     if (next.has(addonId)) next.delete(addonId);
//     else next.add(addonId);
//     setSelectedAddons(next);
//   };

//   if (loading || !item) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 pb-24 md:pb-10 pt-20 md:pt-28 px-4 md:px-8">

//       {/* --- BACK BUTTON --- */}
//       <div className="max-w-6xl mx-auto mb-6">
//         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
//             <ArrowLeft size={18} /> Back to Menu
//         </button>
//       </div>

//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

//         {/* --- LEFT COLUMN: STICKY IMAGE --- */}
//         <div className="relative h-fit md:sticky md:top-32">
//             <motion.div 
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/10 aspect-square md:aspect-[4/3]"
//             >
//                 <img 
//                     src={getImageUrl(item)} 
//                     className="w-full h-full object-cover"
//                     alt={item.name}
//                 />
//                 {/* Overlay Tags */}
//                 <div className="absolute top-6 left-6 flex flex-col gap-2">
//                     <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-md ${item.is_veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
//                         {item.is_veg ? 'Veg' : 'Non-Veg'}
//                     </span>
//                     {item.discountPrice && (
//                         <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500 text-white shadow-sm border border-white/20 backdrop-blur-md">
//                             Promo
//                         </span>
//                     )}
//                 </div>
//             </motion.div>
//         </div>

//         {/* --- RIGHT COLUMN: DETAILS & SCROLL --- */}
//         <div className="flex flex-col">

//             {/* Title & Stats */}
//             <div className="border-b border-dashed border-slate-200 pb-6 mb-6">
//                 <div className="flex justify-between items-start">
//                     <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{item.name}</h1>
//                     <button onClick={() => setIsFav(!isFav)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
//                         <Heart size={24} className={isFav ? "fill-red-500 text-red-500" : "text-slate-400"} />
//                     </button>
//                 </div>

//                 <p className="text-slate-500 leading-relaxed font-medium mb-4">{item.description}</p>

//                 <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
//                     <div className="flex items-center gap-1.5"><Star size={16} className="fill-yellow-400 text-yellow-400" /> 4.5 Ratings</div>
//                     <div className="w-1 h-1 bg-slate-300 rounded-full" />
//                     <div className="flex items-center gap-1.5"><Clock size={16} /> 25 Mins</div>
//                     <div className="w-1 h-1 bg-slate-300 rounded-full" />
//                     <div className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> 320 Kcal</div>
//                 </div>
//             </div>

//             {/* Price Block */}
//             <div className="flex items-end gap-3 mb-8">
//                 <span className="text-4xl font-black text-slate-900">₹{basePrice}</span>
//                 {item.discountPrice && <span className="text-lg font-bold text-slate-400 line-through mb-1">₹{item.price}</span>}
//             </div>

//             {/* Customization */}
//             {availableAddons.length > 0 && (
//                 <div className="mb-10">
//                     <div className="flex items-center gap-2 mb-4">
//                         <Utensils size={18} className="text-orange-600" />
//                         <h3 className="font-bold text-lg text-slate-800">Customize your meal</h3>
//                     </div>

//                     <div className="space-y-3">
//                         {availableAddons.map(addon => {
//                             const isSelected = selectedAddons.has(addon.id);
//                             return (
//                                 <motion.div 
//                                     key={addon.id} 
//                                     onClick={() => toggleAddon(addon.id)}
//                                     whileTap={{ scale: 0.99 }}
//                                     className={`group flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50/50' : 'border-white bg-white hover:border-orange-100 shadow-sm'}`}
//                                 >
//                                     <div className="flex items-center gap-4">
//                                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${isSelected ? "bg-orange-500 border-orange-500" : "border-slate-200 bg-slate-50"}`}>
//                                             {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
//                                         </div>
//                                         <span className={`font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>{addon.name}</span>
//                                     </div>
//                                     <span className="text-sm font-bold text-slate-800">+ ₹{addon.price}</span>
//                                 </motion.div>
//                             )
//                         })}
//                     </div>
//                 </div>
//             )}

//             {/* Note */}
//             <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start mb-8">
//                 <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
//                 <p className="text-xs text-blue-900/70 font-bold leading-relaxed">
//                     Allergies? Please contact the restaurant directly after placing your order to ensure your meal is prepared safely.
//                 </p>
//             </div>

//             {/* --- ACTION AREA (Desktop: Static, Mobile: Fixed Bottom) --- */}
//             <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-50 md:static md:bg-transparent md:border-none md:p-0">
//                 <div className="max-w-6xl mx-auto flex items-center gap-4">
//                     {/* Qty */}
//                     <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 h-16 w-40 justify-between shadow-sm">
//                         <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"><Minus size={18}/></button>
//                         <span className="font-black text-xl text-slate-900">{qty}</span>
//                         <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-black active:scale-95 transition-all"><Plus size={18}/></button>
//                     </div>

//                     {/* Add Button */}
//                     <button onClick={handleAddToCart} className="flex-1 h-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-between px-8 hover:brightness-110">
//                         <div className="flex flex-col items-start leading-none">
//                             <span className="text-[10px] uppercase tracking-wider opacity-80 mb-1">Total</span>
//                             <span>₹{totalPrice}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <span>Add to Cart</span>
//                             <ShoppingBag size={20} />
//                         </div>
//                     </button>
//                 </div>
//             </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default FoodItemDetails;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft, Minus, Plus, Star, Clock, Flame,
    Heart, Share2, Check, Loader2, ShoppingBag,
    Utensils, Info, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const FoodItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATE ---
    const [item, setItem] = useState(location.state?.item || null);
    const [loading, setLoading] = useState(!location.state?.item);
    const [qty, setQty] = useState(1);
    const [isFav, setIsFav] = useState(false);

    // Customization State
    const [selectedAddons, setSelectedAddons] = useState(new Set());

    // New State for Button Feedback
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                if (!item) setLoading(true);
                const response = await api.get(`/api/public/menu/item/${id}`);
                if (response.data) setItem(response.data);
            } catch (error) {
                console.error("Failed to fetch item:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItemDetails();
    }, [id]);

    // --- HELPERS ---
    const getImageUrl = (itm) => {
        if (!itm) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
        if (itm.image && (itm.image.startsWith("data:") || itm.image.startsWith("http"))) return itm.image;
        return `http://localhost:8000/api/menu/image/${itm.id}`;
    };

    const availableAddons = useMemo(() => {
        if (!item || !item.addons) return [];
        if (typeof item.addons === 'string') {
            try { return JSON.parse(item.addons); } catch (e) { return []; }
        }
        return Array.isArray(item.addons) ? item.addons : [];
    }, [item]);

    const basePrice = item ? (item.discountPrice || item.discount_price || item.price) : 0;

    // Calculate Unit Price (Base + Addons)
    const unitPrice = useMemo(() => {
        let price = parseFloat(basePrice);
        selectedAddons.forEach(addonId => {
            const addon = availableAddons.find(a => a.id === addonId);
            if (addon) price += parseFloat(addon.price);
        });
        return price;
    }, [basePrice, selectedAddons, availableAddons]);

    // Calculate Grand Total
    const totalPrice = unitPrice * qty;

    // --- FIXED: ADD TO CART ---
    // --- FIXED ADD TO CART LOGIC ---
    const handleAddToCart = async () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");

        if (!token) {
            alert("Please sign in first!");
            return;
        }

        try {
            // Calculate total price for ONE item (Base + Addons)
            // We send this so the backend knows the customized price
            let itemCustomPrice = parseFloat(basePrice);
            selectedAddons.forEach(addonId => {
                const addon = availableAddons.find(a => a.id === addonId);
                if (addon) itemCustomPrice += parseFloat(addon.price);
            });

            await api.post("/api/cart", {
                menu_item_id: item.id,
                quantity: qty,
                // Send the custom price per unit (if your backend supports it)
                // Or rely on the backend to recalculate based on addons if you send them
                // For now, we will send the addons list so you can store it
                customization: JSON.stringify(Array.from(selectedAddons)),
                total_price: itemCustomPrice * qty // Optional: depends on backend
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 1. Update Cart Badge
            window.dispatchEvent(new Event('cart-updated'));

            // 2. Show Success Feedback (instead of redirecting)
            alert("Item added to cart!");

            // 3. REMOVED: navigate(-1);  <-- This line caused the redirect

        } catch (err) {
            console.error("Add to cart failed", err);
            if (err.response && err.response.status === 401) {
                alert("Session expired. Please login again.");
            } else {
                alert("Failed to add to cart");
            }
        }
    };

    const toggleAddon = (addonId) => {
        const next = new Set(selectedAddons);
        if (next.has(addonId)) next.delete(addonId);
        else next.add(addonId);
        setSelectedAddons(next);
    };

    if (loading || !item) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 pb-24 md:pb-10 pt-20 md:pt-28 px-4 md:px-8">

            {/* --- BACK BUTTON --- */}
            <div className="max-w-6xl mx-auto mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors">
                    <ArrowLeft size={18} /> Back to Menu
                </button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

                {/* --- LEFT COLUMN: STICKY IMAGE --- */}
                <div className="relative h-fit md:sticky md:top-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/10 aspect-square md:aspect-[4/3]"
                    >
                        <img
                            src={getImageUrl(item)}
                            className="w-full h-full object-cover"
                            alt={item.name}
                        />
                        {/* Overlay Tags */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-md ${item.is_veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {item.is_veg ? 'Veg' : 'Non-Veg'}
                            </span>
                            {item.discountPrice && (
                                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500 text-white shadow-sm border border-white/20 backdrop-blur-md">
                                    Promo
                                </span>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: DETAILS --- */}
                <div className="flex flex-col">

                    {/* Title & Stats */}
                    <div className="border-b border-dashed border-slate-200 pb-6 mb-6">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{item.name}</h1>
                        </div>

                        <p className="text-slate-500 leading-relaxed font-medium mb-4">{item.description}</p>

                        <div className="flex items-center gap-6 text-sm font-bold text-slate-600">
                            <div className="flex items-center gap-1.5"><Star size={16} className="fill-yellow-400 text-yellow-400" /> 4.5 Ratings</div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <div className="flex items-center gap-1.5"><Clock size={16} /> 25 Mins</div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <div className="flex items-center gap-1.5"><Flame size={16} className="text-orange-500" /> 320 Kcal</div>
                        </div>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-end gap-3 mb-8">
                        <span className="text-4xl font-black text-slate-900">₹{basePrice}</span>
                        {item.discountPrice && <span className="text-lg font-bold text-slate-400 line-through mb-1">₹{item.price}</span>}
                    </div>

                    {/* Customization */}
                    {availableAddons.length > 0 && (
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Utensils size={18} className="text-orange-600" />
                                <h3 className="font-bold text-lg text-slate-800">Customize your meal</h3>
                            </div>

                            <div className="space-y-3">
                                {availableAddons.map(addon => {
                                    const isSelected = selectedAddons.has(addon.id);
                                    return (
                                        <motion.div
                                            key={addon.id}
                                            onClick={() => toggleAddon(addon.id)}
                                            whileTap={{ scale: 0.99 }}
                                            className={`group flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50/50' : 'border-white bg-white hover:border-orange-100 shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${isSelected ? "bg-orange-500 border-orange-500" : "border-slate-200 bg-slate-50"}`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <span className={`font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>{addon.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">+ ₹{addon.price}</span>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start mb-8">
                        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-blue-900/70 font-bold leading-relaxed">
                            Allergies? Please contact the restaurant directly after placing your order to ensure your meal is prepared safely.
                        </p>
                    </div>

                    {/* --- ACTION AREA --- */}
                    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-50 md:static md:bg-transparent md:border-none md:p-0">
                        <div className="max-w-6xl mx-auto flex items-center gap-4">
                            {/* Qty */}
                            <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 h-16 w-40 justify-between shadow-sm">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"><Minus size={18} /></button>
                                <span className="font-black text-xl text-slate-900">{qty}</span>
                                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-black active:scale-95 transition-all"><Plus size={18} /></button>
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className={`flex-1 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-between px-8 
                        ${isAdded ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:brightness-110'}`}
                            >
                                {isAdding ? (
                                    <div className="w-full flex justify-center"><Loader2 className="animate-spin" /></div>
                                ) : isAdded ? (
                                    <div className="w-full flex justify-center items-center gap-2"><Check /> Added!</div>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-start leading-none">
                                            <span className="text-[10px] uppercase tracking-wider opacity-80 mb-1">Total</span>
                                            <span>₹{totalPrice}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Add to Cart</span>
                                            <ShoppingBag size={20} />
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FoodItemDetails;