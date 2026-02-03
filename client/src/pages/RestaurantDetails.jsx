import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, Star, Clock, MapPin, Search, Plus, Minus, ShoppingBag, ChevronRight, UtensilsCrossed } from "lucide-react";

const RestaurantDetails = () => {
  const { id } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [cartItems, setCartItems] = useState({}); // Object for faster lookups { itemId: qty }

  const categories = ["Recommended", "Chef's Specials", "Bowls", "Healthy", "Beverages", "Desserts"];

  useEffect(() => {
    // Simulated API fetch
    const fetchData = async () => {
      try {
        const [menuRes, restRes] = await Promise.all([
          api.get(`/api/menu/${id}`),
          api.get(`/restaurants/${id}`).catch(() => ({ 
            data: { 
              name: "The Urban Harvest", 
              rating: "4.9", 
              address: "Downtown • Organic & Fresh", 
              description: "Farm-to-table ingredients prepared with passion. Experience the taste of authentic nature in every bite." 
            } 
          }))
        ]);
        setMenuItems(menuRes.data);
        setRestaurantInfo(restRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Cart Helpers
  const updateQty = (itemId, delta) => {
    setCartItems(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-pulse flex flex-col items-center">
        <UtensilsCrossed size={48} className="text-orange-600 mb-4" />
        <span className="text-stone-400 tracking-widest uppercase text-xs font-bold">Curating Menu...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      
      {/* --- Mobile Header (Hidden on Desktop) --- */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex justify-between items-center">
         <Link to="/rest" className="w-10 h-10 flex items-center justify-center bg-stone-100 rounded-full"><ArrowLeft size={20} /></Link>
         <span className="font-bold text-lg">{restaurantInfo?.name}</span>
         <button className="w-10 h-10 flex items-center justify-center bg-stone-100 rounded-full"><Search size={20} /></button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* --- LEFT PANEL: Sticky Info (Desktop) / Hero (Mobile) --- */}
        <aside className="w-full lg:w-1/3 lg:h-screen lg:sticky lg:top-0 p-6 lg:p-12 flex flex-col justify-between bg-white lg:bg-transparent z-10">
          <div>
            <Link to="/rest" className="hidden lg:flex items-center text-stone-400 hover:text-orange-600 transition-colors mb-8 group">
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Restaurants
            </Link>

            {/* Restaurant Brand */}
            <div className="mb-6">
              <span className="text-orange-600 font-bold tracking-wider text-xs uppercase mb-2 block">Premium Partner</span>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 text-stone-900">
                {restaurantInfo?.name}
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed mb-6">
                {restaurantInfo?.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 border-t border-b border-stone-200 py-4">
                <div>
                   <div className="flex items-center gap-1 font-bold text-lg">
                     <Star size={18} className="fill-yellow-400 text-yellow-400" /> {restaurantInfo?.rating}
                   </div>
                   <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Rating</div>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div>
                   <div className="flex items-center gap-1 font-bold text-lg">
                     <Clock size={18} className="text-stone-700" /> 25m
                   </div>
                   <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Time</div>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div>
                   <div className="flex items-center gap-1 font-bold text-lg">
                     <MapPin size={18} className="text-stone-700" /> 1.2km
                   </div>
                   <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Distance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Category Navigation (Vertical) */}
          <div className="hidden lg:block space-y-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Menu Sections</h3>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeCategory === cat 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                  : 'text-stone-500 hover:bg-white hover:shadow-md'
                }`}
              >
                <span className="font-bold">{cat}</span>
                {activeCategory === cat && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        </aside>

        {/* --- RIGHT PANEL: Scrollable Content --- */}
        <main className="w-full lg:w-2/3 p-4 lg:p-12 pb-32">
          
          {/* Mobile Categories (Horizontal) */}
          <div className="lg:hidden sticky top-16 z-40 bg-stone-50/95 backdrop-blur-sm py-2 mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
             <div className="flex gap-2">
               {categories.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                     activeCategory === cat ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
          </div>

          {/* Section Title */}
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-900">{activeCategory}</h2>
            <span className="text-stone-400 text-sm font-medium">{menuItems.length} items</span>
          </div>

          {/* --- THE GRID LAYOUT (The "Different" Part) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, idx) => (
              <GalleryCard 
                key={item.id || idx} 
                item={item} 
                qty={cartItems[item.id] || 0}
                onUpdate={(d) => updateQty(item.id, d)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* --- Floating Glass Cart --- */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4">
           <div className="bg-stone-900/90 backdrop-blur-md text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-8 border border-white/10 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="flex flex-col">
                 <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Total Order</span>
                 <span className="font-bold text-lg">{totalItems} Items</span>
              </div>
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                 View Cart <ShoppingBag size={18} />
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

// --- Gallery Card Component ---
// Focuses on large images and clean typography
const GalleryCard = ({ item, qty, onUpdate }) => {
  const image = item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80`;

  return (
    <div className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full">
       {/* Image Area */}
       <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
         <img src={image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
         
         {/* Price Tag Overlay */}
         <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-bold text-stone-900 shadow-sm">
           ₹{item.price}
         </div>

         {/* Veg/Non-Veg Indicator */}
         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
            <div className={`w-3 h-3 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500'}`}></div>
         </div>
       </div>

       {/* Content */}
       <div className="px-2 flex flex-col flex-grow">
         <h3 className="text-xl font-bold text-stone-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">
            {item.name}
         </h3>
         <p className="text-stone-500 text-sm line-clamp-2 mb-4">
            {item.description || "A culinary masterpiece featuring fresh ingredients and bold flavors."}
         </p>
         
         <div className="mt-auto pt-2">
            {qty === 0 ? (
               <button 
                 onClick={() => onUpdate(1)}
                 className="w-full py-3 rounded-xl bg-stone-100 text-stone-900 font-bold hover:bg-stone-900 hover:text-white transition-all flex justify-center items-center gap-2"
               >
                 Add to Order <Plus size={16} />
               </button>
            ) : (
               <div className="flex items-center justify-between bg-stone-900 text-white rounded-xl p-1">
                  <button onClick={() => onUpdate(-1)} className="p-2 hover:bg-stone-700 rounded-lg transition-colors"><Minus size={18} /></button>
                  <span className="font-bold">{qty}</span>
                  <button onClick={() => onUpdate(1)} className="p-2 hover:bg-stone-700 rounded-lg transition-colors"><Plus size={18} /></button>
               </div>
            )}
         </div>
       </div>
    </div>
  );
};

export default RestaurantDetails;