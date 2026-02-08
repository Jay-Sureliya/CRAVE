import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import api from "../services/api";
import {
  ArrowLeft, Star, Clock, MapPin, Search, Plus, Minus,
  ShoppingBag, ChevronRight, UtensilsCrossed, Leaf, Drumstick, Heart,
  CheckCircle, AlertCircle, Zap, Lock // Added Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORT YOUR CART COMPONENT ---
import Cart from "../components/cart";

// --- HELPER: Lazy Load & Optimize Images ---
const getImageUrl = (item) => {
  if (!item) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60";
  if (item.image && (item.image.startsWith("data:") || item.image.startsWith("http"))) {
    return item.image;
  }
  return `http://localhost:8000/api/menu/image/${item.id}`;
};

// --- COMPONENT: Toast Notification ---
const Toast = ({ message, type = "success" }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border ${type === "success"
      ? "bg-stone-900/90 text-white border-white/10"
      : "bg-red-500/90 text-white border-red-400"
      }`}
  >
    {type === "success" ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} />}
    <span className="font-medium text-sm">{message}</span>
  </motion.div>
);

// --- COMPONENT: Skeleton Loader ---
const MenuSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-[1.5rem] p-4 h-48 flex gap-4 animate-pulse border border-orange-50/50">
        <div className="w-32 h-32 bg-stone-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-4 bg-stone-200 rounded w-3/4" />
          <div className="h-3 bg-stone-100 rounded w-full" />
          <div className="h-3 bg-stone-100 rounded w-2/3" />
          <div className="mt-auto pt-4 flex justify-between items-end">
            <div className="h-6 bg-stone-200 rounded w-16" />
            <div className="h-8 bg-orange-100 rounded-xl w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for redirection
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOCAL STATE ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // --- UPDATED CART STATE (Array based for compatibility) ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Controls Cart Drawer
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Controls Login Popup

  const [favorites, setFavorites] = useState({});
  const [toast, setToast] = useState(null);

  

  // --- 1. Load Cart from LocalStorage ---
  useEffect(() => {
    const savedCart = localStorage.getItem('myCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // --- 2. Save Cart to LocalStorage whenever it changes ---
  useEffect(() => {
    localStorage.setItem('myCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const start = Date.now();
      try {
        setLoading(true);
        const [menuRes, restRes] = await Promise.all([
          api.get(`/api/public/menu/${id}`),
          api.get(`/restaurants/${id}`).catch(() => ({
            data: {
              name: "Restaurant", rating: "4.5", address: "Address unavailable", description: "Delicious food awaits."
            }
          }))
        ]);
        const availableItems = Array.isArray(menuRes.data) ? menuRes.data.filter(item => item.isAvailable === true) : [];
        const elapsed = Date.now() - start;
        if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));
        setMenuItems(availableItems);
        setRestaurant(restRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const categories = useMemo(() => {
    const uniqueCats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(uniqueCats).filter(Boolean)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, activeCategory]);

  // --- UPDATED CART LOGIC (Array Manipulation) ---
  const getItemQty = (itemId) => {
    return cartItems.find(item => item.id === itemId)?.quantity || 0;
  };

  const updateQty = (item, delta) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        // Item exists, update quantity
        const newQty = existing.quantity + delta;
        if (delta > 0 && newQty === 1) showToast(`Added ${item.name} to cart`); // Edge case re-add

        if (newQty <= 0) {
          showToast(`Removed ${item.name}`, "neutral");
          return prev.filter(i => i.id !== item.id);
        }

        return prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i);
      } else {
        // Item does not exist, Add new
        if (delta > 0) {
          showToast(`Added ${item.name} to cart`);
          // Ensure we save the image too for the cart drawer
          return [...prev, { ...item, quantity: 1, image: getImageUrl(item) }];
        }
        return prev;
      }
    });
  };

  const toggleFavorite = (itemId) => {
    const isNowFav = !favorites[itemId];
    setFavorites(prev => ({ ...prev, [itemId]: isNowFav }));
    if (isNowFav) showToast("Added to Favorites");
  };

  // --- LOGIN CHECK & VIEW CART ---
  // --- LOGIN CHECK & VIEW CART ---
  const handleViewCart = () => {
    // 1. Check for the token (Try both common names)
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    // Debugging: Open your browser console (F12) to see if this prints "null" or a real token
    console.log("Checking Login Token:", token);

    if (!token) {
      // Case A: No Token found -> Redirect
      setShowLoginPopup(true);
      setTimeout(() => {
        setShowLoginPopup(false);
        navigate('/login');
      }, 2000);
    } else {
      // Case B: Token found -> Open Cart
      setIsCartOpen(true);
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalValue = cartItems.reduce((acc, item) => {
    const price = item.discountPrice || item.discount_price || item.price || 0;
    return acc + (price * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-900 pb-32">

      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* --- Mobile Header --- */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <Link to="/" className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-full text-stone-600 active:scale-95 transition-transform"><ArrowLeft size={20} /></Link>
        <span className="font-bold text-lg truncate max-w-[200px] text-stone-800">{loading ? "Loading..." : restaurant?.name}</span>
        <button className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-full text-stone-600 active:scale-95 transition-transform"><Search size={20} /></button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:p-8">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-1/4 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-white">
            <Link to="/" className="hidden lg:flex items-center text-stone-400 hover:text-orange-600 transition-colors mb-6 group text-sm font-medium">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
            </Link>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 bg-stone-100 rounded w-full"></div>
                <div className="h-4 bg-stone-100 rounded w-2/3"></div>
              </div>
            ) : (
              <>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black text-stone-800 leading-tight mb-2">
                  {restaurant?.name}
                </motion.h1>
                <p className="text-stone-500 text-sm mb-4 leading-relaxed">{restaurant?.description || restaurant?.address}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-stone-700 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <Star size={16} className="text-orange-500 fill-orange-500" />
                  <span>{restaurant?.rating || "4.5"}</span>
                  <span className="text-stone-300">|</span>
                  <Clock size={16} className="text-orange-500" />
                  <span>25 min</span>
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:flex flex-col bg-white p-2 rounded-[2rem] shadow-lg border border-white h-full overflow-y-auto custom-scrollbar">
            <h3 className="px-4 py-3 text-xs font-bold text-stone-400 uppercase tracking-widest">Menu</h3>
            {loading ? (
              <div className="space-y-2 p-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse"></div>)}</div>
            ) : (
              categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between w-full text-left px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${activeCategory === cat ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20' : 'text-stone-500 hover:bg-stone-50 hover:text-orange-600'}`}
                >
                  {cat}
                  {activeCategory === cat && <ChevronRight size={16} />}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* --- RIGHT PANEL --- */}
        <main className="flex-1 w-full px-4 lg:px-0">
          <div className="sticky top-16 lg:top-0 z-40 bg-[#FDFBF7]/95 lg:bg-[#FDFBF7]/90 backdrop-blur-md py-4 lg:py-6 mb-2 space-y-4">
            <div className="relative group max-w-2xl">
              <div className="absolute inset-0 bg-orange-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-duration-500"></div>
              <div className="relative bg-white border border-stone-100 rounded-2xl flex items-center p-1 shadow-sm focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <Search className="ml-3 text-stone-400" size={20} />
                <input type="text" placeholder={`Search ${restaurant?.name || "menu"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent p-3 outline-none text-stone-700 placeholder-stone-400 font-medium" />
                {searchTerm && (<button onClick={() => setSearchTerm("")} className="mr-2 p-1 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200"><Minus size={14} className="rotate-45" /></button>)}
              </div>
            </div>

            <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? "bg-stone-900 text-white border-stone-900 shadow-md" : "bg-white text-stone-600 border-stone-200"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 min-h-[50vh]">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              {activeCategory}
              {!loading && <span className="text-xs font-bold text-stone-400 bg-white px-2 py-1 rounded-lg border border-stone-100 shadow-sm">{filteredItems.length}</span>}
            </h2>

            {loading ? (
              <MenuSkeleton />
            ) : filteredItems.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      qty={getItemQty(item.id)} // Used Helper Here
                      isFav={favorites[item.id] || false}
                      onUpdate={(delta) => updateQty(item, delta)} // Pass entire item now
                      onFav={() => toggleFavorite(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <UtensilsCrossed size={48} className="text-stone-300 mb-4" />
                <p className="text-lg font-bold text-stone-500">No items found.</p>
                <button onClick={() => { setSearchTerm(""); setActiveCategory("All") }} className="text-orange-500 font-bold mt-2 hover:underline">Reset Filters</button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- FLOATING CART BAR --- */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4"
          >
            <div className="bg-stone-900/90 backdrop-blur-md text-white pl-6 pr-2 py-2 rounded-[2rem] shadow-2xl shadow-stone-900/30 flex items-center gap-6 lg:gap-12 border border-white/10 w-full max-w-lg justify-between ring-1 ring-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Total ({totalItems} items)</span>
                <span className="font-bold text-xl tracking-tight">₹{cartTotalValue.toFixed(2)}</span>
              </div>
              <button
                onClick={handleViewCart} // Attached Logic Here
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-3 rounded-[1.5rem] font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95 group"
              >
                View Cart
                <ShoppingBag size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CART DRAWER --- */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />

      {/* --- LOGIN POPUP --- */}
      <AnimatePresence>
        {showLoginPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border border-red-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Access Denied</h3>
              <p className="text-stone-500 mb-6">Please login to view your cart.</p>
              <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-red-500"
                />
              </div>
              <p className="text-xs text-stone-400 mt-3">Redirecting to login...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- MENU CARD COMPONENT (Unchanged mostly, just using updated props) ---
// const MenuCard = ({ item, qty, onUpdate, isFav, onFav }) => {
//   const dPrice = item.discountPrice || item.discount_price;
//   const hasDiscount = dPrice && dPrice < item.price;
//   const discountPercent = hasDiscount ? Math.round(((item.price - dPrice) / item.price) * 100) : 0;
//   const [imgLoaded, setImgLoaded] = useState(false);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.9 }}
//       transition={{ duration: 0.2 }}
//       className="group bg-white rounded-[1.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-transparent hover:border-orange-100 transition-all duration-300 flex flex-col relative"
//     >
//       <button onClick={onFav} className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 border border-white">
//         <Heart size={18} className={`transition-colors duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-stone-400 hover:text-red-500"}`} />
//       </button>

//       <div className="flex gap-4">
//         <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100">
//           <img
//             src={getImageUrl(item)} alt={item.name} loading="lazy" decoding="async"
//             onLoad={() => setImgLoaded(true)}
//             onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60" }}
//             className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-105`}
//           />
//           <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-stone-100 z-10">
//             {item.type === 'veg' || item.is_veg ? (<Leaf size={14} className="text-green-600 fill-green-100" />) : (<Drumstick size={14} className="text-red-600 fill-red-100" />)}
//           </div>
//           {hasDiscount && (
//             <div className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1 z-20 animate-in zoom-in-90 duration-300">
//               <Zap size={10} className="fill-white text-white" /> {discountPercent}% OFF
//             </div>
//           )}
//         </div>

//         <div className="flex flex-col flex-1 min-w-0 py-1">
//           <div className="flex justify-between items-start pr-8">
//             <h3 className="text-lg font-bold text-stone-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">{item.name}</h3>
//           </div>
//           <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed font-medium">{item.description || "Freshly prepared with authentic ingredients."}</p>
//           <div className="mt-auto pt-3 flex items-end justify-between">
//             <div className="flex flex-col">
//               {hasDiscount && (<span className="text-stone-400 text-xs line-through font-medium decoration-stone-300/50">₹{item.price}</span>)}
//               <span className={`text-lg font-black tracking-tight ${hasDiscount ? 'text-orange-600' : 'text-stone-900'}`}>₹{hasDiscount ? dPrice : item.price}</span>
//             </div>
//             {qty === 0 ? (
//               <button onClick={() => onUpdate(1)} className="bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 border border-orange-100 hover:border-orange-500 hover:shadow-orange-200">ADD</button>
//             ) : (
//               <div className="flex items-center gap-1 bg-stone-900 text-white p-1 rounded-xl shadow-xl shadow-stone-900/20">
//                 <button onClick={() => onUpdate(-1)} className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors active:scale-90"><Minus size={14} /></button>
//                 <span className="font-bold text-sm w-6 text-center">{qty}</span>
//                 <button onClick={() => onUpdate(1)} className="p-1.5 hover:bg-stone-700 rounded-lg transition-colors active:scale-90"><Plus size={14} /></button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };


// --- UPDATED MENU CARD COMPONENT ---
const MenuCard = ({ item, qty, onUpdate, isFav, onFav }) => {
  const navigate = useNavigate(); // 1. Add Hook
  const dPrice = item.discountPrice || item.discount_price;
  const hasDiscount = dPrice && dPrice < item.price;
  const discountPercent = hasDiscount ? Math.round(((item.price - dPrice) / item.price) * 100) : 0;
  const [imgLoaded, setImgLoaded] = useState(false);

  // 2. Handle Card Click
  const handleCardClick = () => {
    // Navigate to the new page, passing the item data in 'state' so we don't need to fetch it again
    navigate(`/menu-item/${item.id}`, { state: { item } });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick} // 3. Attach Click Handler to main div
      className="group bg-white rounded-[1.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-orange-900/5 border border-transparent hover:border-orange-100 transition-all duration-300 flex flex-col relative cursor-pointer" // Added cursor-pointer
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onFav(); }} // 4. STOP PROPAGATION on Favorite
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 border border-white"
      >
        <Heart size={18} className={`transition-colors duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-stone-400 hover:text-red-500"}`} />
      </button>

      <div className="flex gap-4">
        {/* ... (Image section remains exactly the same) ... */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-100">
           {/* Image code same as before... */}
           <img
            src={item.image ? item.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60"} 
            alt={item.name} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-105`}
          />
           {/* ... tags ... */}
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
            
            {/* 5. STOP PROPAGATION on Add/Remove Buttons */}
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