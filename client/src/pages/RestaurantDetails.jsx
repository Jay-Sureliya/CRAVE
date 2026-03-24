import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft, Star, Search, Plus, Minus,
  CheckCircle, AlertCircle, Heart, MapPin, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMAGE HELPER ---
const getImageUrl = (item) => {
  if (!item) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
  if (item.image && (item.image.startsWith("data:") || item.image.startsWith("http"))) {
    return item.image;
  }
  return `http://localhost:8000/api/menu/image/${item.id}`;
};

// --- TOAST COMPONENT ---
const Toast = ({ message, type = "success" }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl backdrop-blur-xl border ${
      type === "neutral" 
        ? "bg-zinc-900/95 text-white border-zinc-800" 
        : "bg-emerald-500 text-white border-emerald-400"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} className="text-white" /> : <AlertCircle size={18} className="text-white" />}
    <span className="font-bold text-sm tracking-wide">{message}</span>
  </motion.div>
);

const MenuSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
    {['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((i) => (
      <div key={i} className="bg-white rounded-[2rem] p-4 flex gap-4 animate-pulse border border-zinc-100 shadow-sm">
        <div className="w-28 h-28 md:w-36 md:h-36 bg-zinc-200 rounded-[1.5rem] flex-shrink-0" />
        <div className="flex-1 space-y-3 py-2 flex flex-col justify-between">
          <div>
            <div className="h-5 bg-zinc-200 rounded-md w-3/4 mb-2" />
            <div className="h-3 bg-zinc-100 rounded-md w-full" />
            <div className="h-3 bg-zinc-100 rounded-md w-2/3 mt-1" />
          </div>
          <div className="flex justify-between items-end">
            <div className="h-5 bg-zinc-200 rounded-md w-16" />
            <div className="h-10 bg-zinc-200 rounded-xl w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- UI STATES ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // --- DATA STATES ---
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- HELPER: Get Token ---
  const getToken = () => {
    let token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) token = sessionStorage.getItem("authToken") || sessionStorage.getItem("token") || sessionStorage.getItem("access_token");
    if (token) return token.replace(/^"|"$/g, '');
    return null;
  };

  // --- HELPERS to fetch User Data ---
  const fetchUserData = async () => {
      const token = getToken();
      if (!token) return; 

      try {
          const cartRes = await api.get("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
          setCartItems(cartRes.data);
      } catch (e) { 
          if (e.response && e.response.status === 401) console.warn("Invalid Token");
      }

      try {
          const favRes = await api.get("/api/favorites", { headers: { Authorization: `Bearer ${token}` } });
          const favObj = {};
          favRes.data.forEach(id => favObj[id] = true);
          setFavorites(favObj);
      } catch (e) { }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [menuRes, restRes] = await Promise.all([
          api.get(`/api/public/menu/${id}`),
          api.get(`/restaurants/${id}`)
        ]);
        setMenuItems(menuRes.data.filter(item => item.isAvailable));
        setRestaurant(restRes.data);
      } catch (err) {
        console.error("Data Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
    fetchUserData(); 

    const intervalId = setInterval(() => {
        if(getToken()) fetchUserData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id]);

  const handleUpdateCart = async (itemId, delta, itemName = "Item") => {
    const token = getToken();

    if (!token) {
        showToast("Please sign in first", "neutral");
        return;
    }
    
    const previousCart = [...cartItems];

    setCartItems(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (delta === -1000 || newQty <= 0) {
          if (delta !== -1000) showToast(`${itemName} removed`, "neutral");
          return prev.filter(item => item.id !== itemId);
        }
        return prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item);
      } else {
        if (delta > 0) {
          showToast(`${itemName} added to cart`, "success");
          const menuItem = menuItems.find(i => i.id === itemId);
          return [...prev, { ...menuItem, quantity: 1, image: getImageUrl(menuItem) }];
        }
        return prev;
      }
    });

    try {
      await api.post("/api/cart", { menu_item_id: itemId, quantity: delta }, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new Event('cart-updated'));
      const res = await api.get("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(res.data);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         showToast("Session expired. Sign in again.", "neutral");
         setCartItems(previousCart); 
         localStorage.removeItem("token");
         localStorage.removeItem("authToken");
      } else {
         showToast("Failed to update cart", "neutral");
         setCartItems(previousCart);
      }
    }
  };

  const toggleFavorite = async (itemId) => {
    const token = getToken();
    if (!token) { showToast("Please sign in first", "neutral"); return; }

    const isFav = !favorites[itemId];
    setFavorites(prev => ({ ...prev, [itemId]: isFav }));
    
    if (isFav) showToast("Added to Favorites", "success");
    else showToast("Removed from Favorites", "neutral");

    try { 
        await api.post(`/api/favorites/${itemId}`, {}, { headers: { Authorization: `Bearer ${token}` } }); 
        window.dispatchEvent(new Event('fav-updated')); 
    } catch (err) { 
        setFavorites(prev => ({ ...prev, [itemId]: !isFav }));
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            showToast("Session expired. Sign in again.", "neutral");
        }
    }
  };

  const getItemQty = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const categories = useMemo(() => ["All", ...new Set(menuItems.map(i => i.category))], [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20 relative selection:bg-orange-500/20">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* ================= HERO SECTION ================= */}
      <div className="relative h-[35vh] md:h-[45vh] w-full bg-zinc-900 overflow-hidden">
        {/* Cover Image (Using restaurant image or a gorgeous food fallback) */}
        <img 
            src={restaurant?.profile_image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80"} 
            alt="Restaurant Cover" 
            className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        
        {/* Top Bar inside Hero */}
        <div className="absolute top-0 w-full p-4 md:p-6 z-10 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
            <button onClick={() => navigate("/")} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-zinc-900 transition-all shadow-sm">
                <ArrowLeft size={24} />
            </button>
        </div>

        {/* Restaurant Info inside Hero */}
        <div className="absolute bottom-0 w-full p-6 md:p-10 z-10 max-w-7xl mx-auto left-0 right-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl text-white font-black tracking-tight mb-2">
                        {loading ? "Loading..." : restaurant?.name}
                    </h1>
                    {!loading && (
                        <div className="flex items-center gap-4 text-zinc-300 text-sm font-medium">
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <MapPin size={16} className="text-orange-400" /> {restaurant?.address || "Unknown Location"}
                            </span>
                        </div>
                    )}
                </div>
                {!loading && (
                    <div className="flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30">
                        <span>4.5</span> <Star size={20} className="fill-white text-white mb-0.5" />
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ================= STICKY NAVIGATION & SEARCH ================= */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm">
          <div className="max-w-7xl mx-auto">
              
              {/* Search Bar (Mobile & Desktop) */}
              <div className="px-4 pt-4 pb-2 md:py-4">
                  <div className="bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center p-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                      <Search className="mr-3 text-zinc-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search for your favorite dishes..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full bg-transparent outline-none font-semibold text-zinc-800 placeholder-zinc-400" 
                      />
                  </div>
              </div>

              {/* Scrollable Categories */}
              <div className="px-4 pb-4 flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth">
                  {categories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat)} 
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                            activeCategory === cat 
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md" 
                            : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      {/* ================= MAIN MENU CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900">{activeCategory} Menu</h2>
            <span className="text-zinc-400 font-bold text-sm bg-zinc-100 px-3 py-1 rounded-lg">{filteredItems.length} items</span>
        </div>

        {loading ? <MenuSkeleton /> : (
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  qty={getItemQty(item.id)}
                  isFav={favorites[item.id] || false}
                  onUpdate={(d) => handleUpdateCart(item.id, d, item.name)}
                  onFav={() => toggleFavorite(item.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
      
      {/* Custom styles to hide scrollbar but allow scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

// --- PREMIUM MENU CARD COMPONENT ---
const MenuCard = ({ item, qty, onUpdate, isFav, onFav }) => {
  const navigate = useNavigate();
  const dPrice = item.discountPrice || item.discount_price;
  const hasDiscount = dPrice && dPrice < item.price;
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleCardClick = () => {
    navigate(`/menu-item/${item.id}`, { state: { item } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="group bg-white rounded-[2rem] p-4 flex gap-4 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer relative"
    >
      {/* Heart Button Overlay */}
      <button 
        onClick={(e) => { e.stopPropagation(); onFav(); }} 
        className="absolute top-6 left-6 z-20 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 border border-zinc-100"
      >
        <Heart size={16} className={`transition-colors duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-zinc-400 hover:text-red-500"}`} />
      </button>

      {/* Image Container */}
      <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-zinc-100 shadow-inner">
         <img
          src={item.image ? item.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60"} 
          alt={item.name} 
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-105`}
        />
        {/* Veg/NonVeg Marker */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
            <div className={`w-3 h-3 rounded-sm border-[1.5px] flex items-center justify-center ${item.is_veg || item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg || item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-col flex-1 min-w-0 justify-between py-1">
        <div>
          <h3 className="text-lg md:text-xl font-black text-zinc-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
              {item.name}
          </h3>
          <p className="text-zinc-500 text-xs md:text-sm mt-1.5 line-clamp-2 leading-relaxed font-medium">
              {item.description || "Freshly prepared with authentic ingredients and our signature touch."}
          </p>
        </div>
        
        {/* Bottom Row: Price & Button */}
        <div className="mt-3 flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && (<span className="text-zinc-400 text-xs line-through font-bold decoration-zinc-300">₹{item.price}</span>)}
            <span className={`text-xl font-black tracking-tight ${hasDiscount ? 'text-orange-600' : 'text-zinc-900'}`}>₹{hasDiscount ? dPrice : item.price}</span>
          </div>
          
          <div onClick={(e) => e.stopPropagation()}> 
            {qty === 0 ? (
              <button onClick={() => onUpdate(1)} className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 border border-orange-100 hover:border-orange-500 shadow-sm">
                  ADD
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-900 text-white p-1.5 rounded-xl shadow-lg">
                <button onClick={() => onUpdate(-1)} className="p-1 hover:bg-zinc-700 rounded-lg transition-colors active:scale-90"><Minus size={16} /></button>
                <span className="font-bold text-sm w-5 text-center">{qty}</span>
                <button onClick={() => onUpdate(1)} className="p-1 hover:bg-zinc-700 rounded-lg transition-colors active:scale-90"><Plus size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantDetails;