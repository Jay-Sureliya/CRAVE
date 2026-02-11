import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft, Star, Search, Plus, Minus,
  CheckCircle, AlertCircle, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMAGE HELPER ---
const getImageUrl = (item) => {
  if (!item) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60";
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
    className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border ${
      type === "neutral" 
        ? "bg-stone-800 text-white border-stone-700" 
        : "bg-stone-900/90 text-white border-white/10"
    }`}
  >
    {type === "success" ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-yellow-400" />}
    <span className="font-medium text-sm">{message}</span>
  </motion.div>
);

const MenuSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {['skel-1', 'skel-2', 'skel-3', 'skel-4'].map((i) => (
      <div key={i} className="bg-white rounded-[1.5rem] p-4 h-48 flex gap-4 animate-pulse border border-orange-50/50">
        <div className="w-32 h-32 bg-stone-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-4 bg-stone-200 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-2/3" />
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

  // --- HELPER: Get Token (Robust Version) ---
  const getToken = () => {
    // 1. Check LocalStorage
    let token = localStorage.getItem("authToken") || localStorage.getItem("token") || localStorage.getItem("access_token");
    
    // 2. Check SessionStorage (Fallback)
    if (!token) {
        token = sessionStorage.getItem("authToken") || sessionStorage.getItem("token") || sessionStorage.getItem("access_token");
    }

    // 3. Clean quotes if they exist (e.g. "eyJ...")
    if (token) {
        return token.replace(/^"|"$/g, '');
    }
    return null;
  };

  // --- HELPERS to fetch User Data ---
  const fetchUserData = async () => {
      const token = getToken();
      if (!token) return; 

      // Fetch Cart
      try {
          const cartRes = await api.get("/api/cart", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCartItems(cartRes.data);
      } catch (e) { 
          // If 401, token is invalid
          if (e.response && e.response.status === 401) {
             console.warn("Invalid Token, clearing data");
             // Optional: localStorage.clear(); 
          }
      }

      // Fetch Favorites
      try {
          const favRes = await api.get("/api/favorites", {
            headers: { Authorization: `Bearer ${token}` }
          });
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
    fetchUserData(); // Initial fetch

    // AUTO REFRESH every 5 seconds
    const intervalId = setInterval(() => {
        if(getToken()) fetchUserData();
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup
  }, [id]);

  const handleUpdateCart = async (itemId, delta, itemName = "Item") => {
    const token = getToken();

    // 1. AUTH CHECK
    if (!token) {
        // Debugging log to see why it failed
        console.log("Add to Cart Failed: No Token Found in Local/Session Storage");
        showToast("Please sign in first", "neutral");
        return;
    }
    
    // 2. OPTIMISTIC UPDATE
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

    // 3. API CALL
    try {
      await api.post("/api/cart", { menu_item_id: itemId, quantity: delta }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      window.dispatchEvent(new Event('cart-updated'));

      const res = await api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data);
    } catch (err) {
      console.error("Cart API Error", err);
      // 4. ERROR HANDLING
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         showToast("Session expired. Sign in again.", "neutral");
         setCartItems(previousCart); // Rollback
         // Clear bad token so user knows they are logged out
         localStorage.removeItem("token");
         localStorage.removeItem("authToken");
      } else {
         showToast("Failed to update cart", "neutral");
         setCartItems(previousCart); // Rollback
      }
    }
  };

  const toggleFavorite = async (itemId) => {
    const token = getToken();

    // 1. AUTH CHECK
    if (!token) {
        showToast("Please sign in first", "neutral");
        return;
    }

    const isFav = !favorites[itemId];
    setFavorites(prev => ({ ...prev, [itemId]: isFav }));
    
    if (isFav) showToast("Added to Favorites", "success");
    else showToast("Removed from Favorites", "neutral");

    try { 
        await api.post(`/api/favorites/${itemId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
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
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-900 pb-10">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <Link to="/" className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-full"><ArrowLeft size={20} /></Link>
        <span className="font-bold truncate">{restaurant?.name}</span>
        <div className="w-10" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:p-8">
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-white">
            <Link to="/" className="hidden lg:flex items-center text-stone-400 hover:text-orange-600 mb-6 font-medium"><ArrowLeft size={16} className="mr-2" /> Back</Link>
            {loading ? <div className="h-32 bg-stone-100 rounded-xl animate-pulse" /> : (
              <>
                <h1 className="text-3xl font-black text-stone-800 mb-2">{restaurant?.name}</h1>
                <p className="text-stone-500 text-sm mb-4">{restaurant?.address}</p>
                <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-xl font-bold text-sm"><Star size={16} className="text-orange-500 fill-orange-500" /> <span>4.5</span></div>
              </>
            )}
          </div>
          <div className="hidden lg:flex flex-col bg-white p-2 rounded-[2rem] shadow-lg h-full overflow-y-auto">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-left px-5 py-3.5 rounded-xl font-bold text-sm ${activeCategory === cat ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>{cat}</button>
            ))}
          </div>
        </aside>

        <main className="flex-1 w-full px-4 lg:px-0">
          <div className="sticky top-16 lg:top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md py-4 mb-2">
            <div className="bg-white border border-stone-100 rounded-2xl flex items-center p-3 shadow-sm">
              <Search className="mr-3 text-stone-400" size={20} />
              <input type="text" placeholder="Search menu..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-transparent outline-none font-medium" />
            </div>
            <div className="lg:hidden flex gap-2 overflow-x-auto mt-4 pb-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold border ${activeCategory === cat ? "bg-stone-900 text-white" : "bg-white"}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6">{activeCategory}</h2>
            {loading ? <MenuSkeleton /> : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </main>
      </div>
    </div>
  );
};

// --- MENU CARD COMPONENT ---
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
      className="group bg-white rounded-[1.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-transparent hover:border-orange-100 transition-all duration-300 flex flex-col relative cursor-pointer"
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onFav(); }} 
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 border border-white"
      >
        <Heart size={18} className={`transition-colors duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-stone-400 hover:text-red-500"}`} />
      </button>

      <div className="flex gap-4">
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100">
           <img
            src={item.image ? item.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60"} 
            alt={item.name} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-105`}
          />
        </div>

        <div className="flex flex-col flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start pr-8">
            <h3 className="text-lg font-bold text-stone-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">{item.name}</h3>
          </div>
          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed font-medium">{item.description || "Freshly prepared with authentic ingredients."}</p>
          
          <div className="mt-auto pt-3 flex items-end justify-between">
            <div className="flex flex-col">
              {hasDiscount && (<span className="text-stone-400 text-xs line-through font-medium decoration-stone-300/50">₹{item.price}</span>)}
              <span className={`text-lg font-black tracking-tight ${hasDiscount ? 'text-orange-600' : 'text-stone-900'}`}>₹{hasDiscount ? dPrice : item.price}</span>
            </div>
            
            <div onClick={(e) => e.stopPropagation()}> 
              {qty === 0 ? (
                <button onClick={() => onUpdate(1)} className="bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 border border-orange-100 hover:border-orange-500 hover:shadow-orange-200">ADD</button>
              ) : (
                <div className="flex items-center gap-1 bg-stone-900 text-white p-1 rounded-xl shadow-xl shadow-stone-900/20">
                  <button onClick={() => onUpdate(-1)} className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors active:scale-90"><Minus size={14} /></button>
                  <span className="font-bold text-sm w-6 text-center">{qty}</span>
                  <button onClick={() => onUpdate(1)} className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors active:scale-90"><Plus size={14} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantDetails;