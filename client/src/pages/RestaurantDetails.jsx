import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft, Star, Clock, MapPin, Search, Plus, Minus,
  ShoppingBag, ChevronRight, UtensilsCrossed, Leaf, Drumstick
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER: Fix Image URLs ---
const getImageUrl = (path) => {
  if (!path) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"; // Fallback

  // Case 1: Base64 String (from database) -> Use as is
  if (path.startsWith("data:")) return path;

  // Case 2: External URL (Unsplash, etc.) -> Use as is
  if (path.startsWith("http")) return path;

  // Case 3: Local File Path (if you revert to file uploads later) -> Append backend URL
  return `http://localhost:8000${path}`;
};

const RestaurantDetails = () => {
  const { id } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FILTERS STATE ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, restRes] = await Promise.all([
          api.get(`/api/menu/${id}`),
          api.get(`/restaurants/${id}`).catch(() => ({
            data: {
              name: "Loading Restaurant...",
              rating: "4.5",
              address: "Fetching details",
              description: "Please wait while we load the restaurant info."
            }
          }))
        ]);

        setMenuItems(menuRes.data);
        setRestaurant(restRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- DYNAMIC CATEGORIES ---
  const categories = useMemo(() => {
    const uniqueCats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(uniqueCats).filter(Boolean)];
  }, [menuItems]);

  // --- FILTERING LOGIC ---
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = activeCategory === "All" || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, activeCategory]);

  // --- CART LOGIC ---
  const updateQty = (itemId, delta) => {
    setCartItems(prev => {
      const current = prev[itemId] || 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const cartTotalValue = Object.keys(cartItems).reduce((acc, itemId) => {
    const item = menuItems.find(i => i.id === parseInt(itemId));
    const price = item?.discount_price || item?.price || 0;
    return acc + (price * cartItems[itemId]);
  }, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="animate-pulse flex flex-col items-center">
        <UtensilsCrossed size={48} className="text-orange-500 mb-4" />
        <span className="text-orange-400 tracking-widest uppercase text-xs font-bold">Loading Menu...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50/30 font-sans text-stone-900 pb-32">

      {/* --- Mobile Header --- */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 px-4 py-3 flex justify-between items-center shadow-sm">
        <Link to="/" className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-full text-orange-600"><ArrowLeft size={20} /></Link>
        <span className="font-bold text-lg truncate max-w-[200px]">{restaurant?.name}</span>
        <button className="w-10 h-10 flex items-center justify-center bg-orange-50 rounded-full text-orange-600"><Search size={20} /></button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:p-8">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-1/4 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-8 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-orange-100/50 border border-orange-50">
            <Link to="/rest" className="hidden lg:flex items-center text-stone-400 hover:text-orange-600 transition-colors mb-6 group text-sm font-medium">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Restaurants
            </Link>

            <h1 className="text-3xl font-black text-stone-800 leading-tight mb-2">{restaurant?.name}</h1>
            <p className="text-stone-500 text-sm mb-4 leading-relaxed">{restaurant?.description || restaurant?.address}</p>

            <div className="flex items-center gap-2 text-sm font-bold text-stone-700 bg-orange-50 p-3 rounded-xl border border-orange-100">
              <Star size={16} className="text-orange-500 fill-orange-500" />
              <span>{restaurant?.rating}</span>
              <span className="text-stone-300">|</span>
              <Clock size={16} className="text-orange-500" />
              <span>25 min</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-col bg-white p-2 rounded-[2rem] shadow-lg border border-orange-50 h-full overflow-y-auto custom-scrollbar">
            <h3 className="px-4 py-3 text-xs font-bold text-stone-400 uppercase tracking-widest">Menu Sections</h3>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between w-full text-left px-5 py-3.5 rounded-xl transition-all font-bold text-sm ${activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-stone-500 hover:bg-orange-50 hover:text-orange-600'
                  }`}
              >
                {cat}
                {activeCategory === cat && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        </aside>

        {/* --- RIGHT PANEL --- */}
        <main className="flex-1 w-full px-4 lg:px-0">

          <div className="sticky top-16 lg:top-0 z-40 bg-orange-50/95 lg:bg-transparent backdrop-blur-sm py-4 lg:py-0 mb-6 space-y-4">
            {/* Search Input */}
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-duration-500"></div>
              <div className="relative bg-white border border-orange-100 rounded-2xl flex items-center p-1 shadow-sm focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <Search className="ml-3 text-orange-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search in ${restaurant?.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent p-3 outline-none text-stone-700 placeholder-stone-400 font-medium"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="mr-2 p-1 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200">
                    <Minus size={14} className="rotate-45" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Categories */}
            <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeCategory === cat
                    ? "bg-orange-600 text-white border-orange-600 shadow-lg"
                    : "bg-white text-stone-600 border-stone-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              {activeCategory} <span className="text-sm font-normal text-stone-400 bg-white px-2 py-1 rounded-lg border border-stone-100">{filteredItems.length}</span>
            </h2>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    qty={cartItems[item.id] || 0}
                    onUpdate={(d) => updateQty(item.id, d)}
                  />
                ))}
              </div>
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

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4"
          >
            <div className="bg-slate-900 text-white pl-6 pr-2 py-2 rounded-[2rem] shadow-2xl shadow-orange-900/20 flex items-center gap-6 lg:gap-12 border border-white/10 w-full max-w-lg justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Total ({totalItems} items)</span>
                <span className="font-bold text-xl">₹{cartTotalValue}</span>
              </div>
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-3 rounded-[1.5rem] font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95">
                View Cart <ShoppingBag size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const MenuCard = ({ item, qty, onUpdate }) => {
  const hasDiscount = item.discount_price && item.discount_price < item.price;
  const discountPercent = hasDiscount ? Math.round(((item.price - item.discount_price) / item.price) * 100) : 0;

  return (
    <div className="group bg-white rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 border border-transparent hover:border-orange-100 transition-all duration-300 flex flex-col">

      <div className="flex gap-4">
        {/* Image Section */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-stone-100">
            {item.is_veg ? (
              <Leaf size={14} className="text-green-600 fill-green-100" />
            ) : (
              <Drumstick size={14} className="text-red-600 fill-red-100" />
            )}
          </div>

          {hasDiscount && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-stone-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
              {item.name}
            </h3>
          </div>

          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {item.description || "Freshly prepared with authentic ingredients."}
          </p>

          <div className="mt-auto pt-3 flex items-end justify-between">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-stone-400 text-xs line-through font-medium">₹{item.price}</span>
              )}
              <span className="text-lg font-black text-stone-900">
                ₹{hasDiscount ? item.discount_price : item.price}
              </span>
            </div>

            {qty === 0 ? (
              <button
                onClick={() => onUpdate(1)}
                className="bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 border border-orange-100"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-stone-900 text-white px-2 py-1.5 rounded-xl shadow-lg">
                <button onClick={() => onUpdate(-1)} className="p-1 hover:bg-stone-700 rounded-lg transition-colors"><Minus size={14} /></button>
                <span className="font-bold text-sm w-4 text-center">{qty}</span>
                <button onClick={() => onUpdate(1)} className="p-1 hover:bg-stone-700 rounded-lg transition-colors"><Plus size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;