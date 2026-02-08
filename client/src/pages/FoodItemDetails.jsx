import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Minus, Plus, Star, Clock, Flame, Info, 
  ShoppingBag, Heart, ChevronRight, Share2, Check 
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// --- MOCK DATA FOR DEMO PURPOSES ---
// In a real app, these would come from your API inside the item object
const MOCK_SIZES = [
  { id: "s", name: "Small", price: 0 },
  { id: "m", name: "Medium", price: 40 },
  { id: "l", name: "Large", price: 80 },
];

const MOCK_ADDONS = [
  { id: "ex_cheese", name: "Extra Cheese", price: 30 },
  { id: "ex_sauce", name: "Spicy Sauce", price: 15 },
  { id: "coke", name: "Coke (250ml)", price: 40 },
];

const MOCK_REVIEWS = [
  { id: 1, user: "Alex J.", rating: 5, text: "Absolutely delicious! The crust was perfect." },
  { id: 2, user: "Sarah M.", rating: 4, text: "Great taste, but delivery was a bit slow." },
];

const FoodItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  // --- STATE ---
  const [item, setItem] = useState(location.state?.item || null);
  const [qty, setQty] = useState(1); // Default to 1 for the "Add" flow
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // details | nutrition | reviews
  
  // Customization State
  const [selectedSize, setSelectedSize] = useState(MOCK_SIZES[0]);
  const [selectedAddons, setSelectedAddons] = useState(new Set());

  // Parallax Effect for Header
  const imageY = useTransform(scrollY, [0, 300], [0, 150]);
  const headerOpacity = useTransform(scrollY, [200, 300], [0, 1]);

  // --- HELPER: Image URL ---
  const getImageUrl = (itm) => {
    if (!itm) return "";
    if (itm.image && (itm.image.startsWith("data:") || itm.image.startsWith("http"))) return itm.image;
    return `http://localhost:8000/api/menu/image/${itm.id}`;
  };

  // --- LOGIC: Calculate Total Price ---
  const basePrice = item ? (item.discountPrice || item.price) : 0;
  
  const totalPrice = useMemo(() => {
    let total = basePrice;
    total += selectedSize.price; // Add size price
    selectedAddons.forEach(addonId => {
        const addon = MOCK_ADDONS.find(a => a.id === addonId);
        if(addon) total += addon.price;
    });
    return total * qty;
  }, [basePrice, selectedSize, selectedAddons, qty]);

  // --- LOGIC: Add to Cart ---
  const handleAddToCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("myCart")) || [];
    
    // Create a unique ID for customized items so they don't merge incorrectly
    const customId = `${item.id}-${selectedSize.id}-${Array.from(selectedAddons).join('-')}`;
    
    const newItem = {
      ...item,
      id: customId, // Override ID to allow duplicates with different options
      originalId: item.id,
      name: `${item.name} (${selectedSize.name})`,
      price: (basePrice + selectedSize.price), // Update unit price
      selectedAddons: Array.from(selectedAddons), // Save addon IDs
      image: getImageUrl(item),
      quantity: qty,
      finalPrice: totalPrice // Store total for reference
    };

    // Check if exactly this customization exists
    const existingIndex = savedCart.findIndex(i => i.id === customId);
    
    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...savedCart];
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart = [...savedCart, newItem];
    }

    localStorage.setItem("myCart", JSON.stringify(updatedCart));
    navigate(-1); // Go back
  };

  // Toggle Addon
  const toggleAddon = (addonId) => {
    const next = new Set(selectedAddons);
    if (next.has(addonId)) next.delete(addonId);
    else next.add(addonId);
    setSelectedAddons(next);
  };

  // Fallback Redirect
  useEffect(() => {
    if (!item) {
      navigate(-1); 
    }
  }, [item, navigate]);

  if (!item) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-50 pb-32 font-sans">
      
      {/* --- FLOATING HEADER ACTIONS --- */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-between items-center p-4">
        <motion.div style={{ opacity: headerOpacity }} className="absolute inset-0 bg-white shadow-sm" />
        <button onClick={() => navigate(-1)} className="relative z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-800 hover:bg-white active:scale-95 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3">
            <button className="relative z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-800 hover:bg-white active:scale-95 transition-all">
                <Share2 size={20} />
            </button>
            <button onClick={() => setIsFav(!isFav)} className="relative z-10 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white active:scale-95 transition-all">
                <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : "text-stone-800"} />
            </button>
        </div>
      </div>

      {/* --- PARALLAX IMAGE --- */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <motion.img 
          style={{ y: imageY }}
          src={getImageUrl(item)} 
          className="w-full h-full object-cover"
          alt={item.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <div className="relative -mt-12 bg-stone-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
        
        {/* Title Section */}
        <div className="p-6 pb-2 bg-white">
            <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl font-black text-stone-800 leading-tight">{item.name}</h1>
                <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-3xl font-black text-orange-600 tracking-tight">₹{basePrice}</span>
                </div>
            </div>
            
            <p className="mt-2 text-stone-500 text-sm leading-relaxed">{item.description}</p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-6 py-4 border-y border-stone-100 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
                    <Star size={14} className="fill-orange-500 text-orange-500" />
                    <span className="text-xs font-bold text-orange-800">4.8 (120+)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
                    <Clock size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-800">25 min</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full">
                    <Flame size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-800">{item.calories || 350} kcal</span>
                </div>
            </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex p-1 mx-6 mt-6 bg-stone-200/50 rounded-xl relative">
            {["details", "nutrition", "reviews"].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg z-10 transition-colors ${activeTab === tab ? "text-stone-800" : "text-stone-400"}`}
                >
                    {tab}
                </button>
            ))}
            {/* Animated Tab Background */}
            <motion.div 
                animate={{ x: activeTab === "details" ? "0%" : activeTab === "nutrition" ? "100%" : "200%" }}
                className="absolute top-1 left-1 bottom-1 w-[32%] bg-white shadow-sm rounded-lg"
            />
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="p-6 min-h-[300px]">
            <AnimatePresence mode="wait">
                
                {activeTab === "details" && (
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Size Selection */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-stone-800 text-lg">Choose Size</h3>
                            <div className="space-y-2">
                                {MOCK_SIZES.map(size => (
                                    <div 
                                        key={size.id} 
                                        onClick={() => setSelectedSize(size)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedSize.id === size.id ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" : "bg-white border-stone-100 hover:border-stone-300"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSize.id === size.id ? "border-orange-500" : "border-stone-300"}`}>
                                                {selectedSize.id === size.id && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                            </div>
                                            <span className={`font-medium ${selectedSize.id === size.id ? "text-stone-800" : "text-stone-500"}`}>{size.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-stone-800">{size.price === 0 ? "Free" : `+ ₹${size.price}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add-ons */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-stone-800 text-lg">Add-ons</h3>
                            <div className="space-y-2">
                                {MOCK_ADDONS.map(addon => {
                                    const isSelected = selectedAddons.has(addon.id);
                                    return (
                                        <div 
                                            key={addon.id} 
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? "bg-stone-800 border-stone-800 text-white" : "bg-white border-stone-100 hover:border-stone-300"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "border-white bg-white" : "border-stone-300"}`}>
                                                    {isSelected && <Check size={12} className="text-stone-900" />}
                                                </div>
                                                <span className={`font-medium ${isSelected ? "text-white" : "text-stone-500"}`}>{addon.name}</span>
                                            </div>
                                            <span className={`text-sm font-bold ${isSelected ? "text-orange-400" : "text-stone-800"}`}>+ ₹{addon.price}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "nutrition" && (
                    <motion.div 
                        key="nutrition"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm"
                    >
                        <h3 className="font-bold text-stone-800 mb-4">Nutritional Facts <span className="text-xs font-normal text-stone-400">(per serving)</span></h3>
                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-stone-100">
                                <span className="text-stone-500">Protein</span>
                                <span className="font-bold text-stone-800">12g</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-stone-100">
                                <span className="text-stone-500">Carbohydrates</span>
                                <span className="font-bold text-stone-800">45g</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-stone-100">
                                <span className="text-stone-500">Fat</span>
                                <span className="font-bold text-stone-800">18g</span>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl mt-4">
                                <p className="text-xs text-orange-800 leading-relaxed">
                                    <span className="font-bold">Allergens:</span> Contains gluten, dairy, and soy. Prepared in a facility that handles nuts.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "reviews" && (
                     <motion.div 
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                     >
                        {MOCK_REVIEWS.map(review => (
                            <div key={review.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-stone-800">{review.user}</span>
                                    <div className="flex text-orange-400">
                                        {[...Array(5)].map((_,i) => (
                                            <Star key={i} size={12} className={i < review.rating ? "fill-current" : "text-stone-200"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-stone-500 text-sm leading-relaxed">{review.text}</p>
                            </div>
                        ))}
                        <button className="w-full py-3 text-sm font-bold text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">
                            Read all 45 reviews
                        </button>
                     </motion.div>
                )}

            </AnimatePresence>
        </div>
      </div>

      {/* --- STICKY ACTION BAR --- */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 p-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-xl mx-auto flex gap-4">
           {/* Qty Controller */}
           <div className="flex items-center gap-4 bg-stone-100 rounded-2xl px-5 h-14">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-stone-600 hover:bg-stone-50 active:scale-90 transition">
                <Minus size={16}/>
              </button>
              <span className="font-black text-lg w-4 text-center text-stone-800">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center bg-stone-800 text-white rounded-lg shadow-sm hover:bg-stone-700 active:scale-90 transition">
                <Plus size={16}/>
              </button>
           </div>

           {/* Add Button */}
           <button 
             onClick={handleAddToCart}
             className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-between px-6 group"
           >
             <span className="flex items-center gap-2 text-sm font-medium opacity-90">Add to Cart</span>
             <div className="flex items-center gap-2">
                <span className="text-xl">₹{totalPrice}</span>
                <div className="bg-white/20 p-1 rounded-lg group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={18} />
                </div>
             </div>
           </button>
        </div>
      </div>

    </div>
  );
};

export default FoodItemDetails;