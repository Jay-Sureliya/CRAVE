// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Search, Star, Clock, MapPin, Truck, Heart, ChevronRight, SlidersHorizontal, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../services/api";

// const RestaurantsList = () => {
//   const [restaurants, setRestaurants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeCategory, setActiveCategory] = useState("All");

//   // Category Data
//   const categories = [
//     { id: "All", label: "All", icon: "🍽️" },
//     { id: "Pizza", label: "Pizza", icon: "🍕" },
//     { id: "Burger", label: "Burger", icon: "🍔" },
//     { id: "Asian", label: "Asian", icon: "🍜" },
//     { id: "Healthy", label: "Healthy", icon: "🥗" },
//     { id: "Dessert", label: "Desserts", icon: "🍩" },
//     { id: "Coffee", label: "Coffee", icon: "☕" },
//   ];

//   useEffect(() => {
//     setLoading(true);
//     api.get("/restaurants")
//       .then((res) => {
//         // --- DEMO LOGIC: Injecting mock cuisines so filters work visually ---
//         const enhancedData = res.data.map(r => ({
//           ...r,
//           cuisine: r.cuisine || categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
//           rating: r.rating || (3.5 + Math.random() * 1.5).toFixed(1)
//         }));
//         setRestaurants(enhancedData);
//         setLoading(false);
//       })
//       .catch((err) => { 
//         console.error(err); 
//         setLoading(false); 
//       });
//   }, []);

//   // --- 🔍 FILTERING LOGIC ---
//   const filteredRestaurants = restaurants.filter((r) => {
//     // 1. Search Filter
//     const matchesSearch = 
//       r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()));

//     // 2. Category Filter
//     const matchesCategory = 
//       activeCategory === "All" || 
//       (r.cuisine && r.cuisine.toLowerCase().includes(activeCategory.toLowerCase())) ||
//       r.name.toLowerCase().includes(activeCategory.toLowerCase());

//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20">
      
//       {/* --- 1. STICKY SEARCH BAR (Replaces Navbar) --- */}
//       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 px-4 md:px-8 shadow-sm">
//         <div className="max-w-3xl mx-auto relative group">
//             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
//                 <Search size={20} />
//             </div>
//             <input 
//               type="text"
//               placeholder="Search restaurants, cuisines..."
//               className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white border-2 border-transparent focus:border-orange-100 rounded-2xl py-3 pl-12 pr-10 outline-none transition-all font-medium text-gray-700 shadow-sm focus:shadow-md"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button 
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-200 transition-colors"
//               >
//                 <X size={16} />
//               </button>
//             )}
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
//         {/* --- 2. HERO TEXT (Clean, No Search Box here) --- */}
//         <section className="mb-10 text-center md:text-left">
//           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
//             Hungry? <span className="text-orange-600">Let's handle that.</span>
//           </h1>
//           <p className="text-gray-500 font-medium">Order from the top rated restaurants near you.</p>
//         </section>

//         {/* --- 3. CATEGORY FILTER SCROLL --- */}
//         <section className="mb-10 overflow-x-auto no-scrollbar pb-4">
//           <div className="flex gap-3 min-w-max md:flex-wrap">
//             {categories.map((cat) => (
//               <button
//                 key={cat.id}
//                 onClick={() => setActiveCategory(cat.id)}
//                 className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 border ${
//                   activeCategory === cat.id
//                     ? "bg-black text-white border-black shadow-lg transform scale-105"
//                     : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 <span>{cat.icon}</span>
//                 <span>{cat.label}</span>
//               </button>
//             ))}
//           </div>
//         </section>

//         {/* --- 4. RESTAURANT GRID --- */}
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold flex items-center gap-2">
//             Top Restaurants 
//             <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//               {filteredRestaurants.length}
//             </span>
//           </h2>
//           <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black bg-white px-4 py-2 rounded-lg border border-gray-200 transition-colors shadow-sm">
//             <SlidersHorizontal size={14} /> Filters
//           </button>
//         </div>

//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
//           </div>
//         ) : (
//           <motion.div 
//             layout 
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
//           >
//             <AnimatePresence>
//               {filteredRestaurants.map((r, index) => (
//                 <RestaurantCard key={r.id} restaurant={r} index={index} />
//               ))}
//             </AnimatePresence>
//           </motion.div>
//         )}

//         {/* --- NO RESULTS STATE --- */}
//         {!loading && filteredRestaurants.length === 0 && (
//           <motion.div 
//             initial={{ opacity: 0 }} 
//             animate={{ opacity: 1 }}
//             className="py-20 text-center flex flex-col items-center"
//           >
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
//                 🥗
//             </div>
//             <h3 className="text-xl font-bold text-gray-800">No restaurants found</h3>
//             <p className="text-gray-500 mt-2 max-w-xs mx-auto">
//               We couldn't find any results for "{searchTerm}" in {activeCategory}. Try changing your filters.
//             </p>
//             <button 
//               onClick={() => {setSearchTerm(""); setActiveCategory("All");}}
//               className="mt-6 text-orange-600 font-bold hover:underline"
//             >
//               Clear all filters
//             </button>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- COMPONENT: MODERN CARD ---
// const RestaurantCard = ({ restaurant, index }) => {
//   const images = [
//     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
//     "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
//     "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
//     "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80"
//   ];

//   const displayImage = restaurant.image || images[index % images.length];
//   const cuisineType = restaurant.cuisine || "Continental"; 

//   return (
//     <Link to={`/rest/${restaurant.id}`} className="group">
//       <motion.div
//         layout
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{ duration: 0.2 }}
//         className="bg-white p-3 rounded-[24px] border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 h-full flex flex-col"
//       >
//         {/* Image Container */}
//         <div className="relative h-48 overflow-hidden rounded-[20px] shrink-0">
//           <img
//             src={displayImage}
//             alt={restaurant.name}
//             className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
//           />
          
//           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
//             <Clock size={12} className="text-orange-600" /> 30 min
//           </div>
//           <button className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
//             <Heart size={16} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity" />
//             <Heart size={16} className="absolute group-hover:opacity-0 transition-opacity" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="pt-4 px-2 pb-2 flex-grow flex flex-col">
//           <div className="flex justify-between items-start mb-1">
//             <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
//               {restaurant.name}
//             </h3>
//             <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap">
//               {restaurant.rating} <Star size={10} fill="currentColor" />
//             </div>
//           </div>

//           <p className="text-sm text-gray-500 mb-4 line-clamp-1 capitalize">
//             {cuisineType} • Fast Food
//           </p>

//           <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
//             <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
//               <Truck size={14} className="text-gray-400" /> Free Delivery
//             </div>
//             <div className="bg-gray-100 p-1.5 rounded-full text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
//               <ChevronRight size={16} />
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </Link>
//   );
// };

// // --- COMPONENT: SKELETON LOADER ---
// const SkeletonCard = () => (
//   <div className="bg-white p-3 rounded-[24px] border border-gray-100">
//     <div className="h-48 bg-gray-200 rounded-[20px] animate-pulse mb-4" />
//     <div className="px-2">
//       <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
//       <div className="h-4 bg-gray-100 rounded w-1/2 mb-4 animate-pulse" />
//       <div className="h-8 bg-gray-50 rounded-lg w-full animate-pulse" />
//     </div>
//   </div>
// );

// export default RestaurantsList;




import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Star, Clock, Truck, Heart, ArrowRight, X, Sparkles, MapPin, Filter, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { id: "All", label: "All", icon: "🍱" },
    { id: "Pizza", label: "Pizza", icon: "🍕" },
    { id: "Burger", label: "Burger", icon: "🍔" },
    { id: "Asian", label: "Asian", icon: "🍣" },
    { id: "Healthy", label: "Healthy", icon: "🥗" },
    { id: "Dessert", label: "Sweet", icon: "🍩" },
    { id: "Coffee", label: "Coffee", icon: "☕" },
  ];

  useEffect(() => {
    setLoading(true);
    api.get("/restaurants")
      .then((res) => {
        const enhancedData = res.data.map(r => ({
          ...r,
          cuisine: r.cuisine || categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
          rating: r.rating || (3.8 + Math.random() * 1.2).toFixed(1),
          reviews: Math.floor(Math.random() * 500) + 50
        }));
        setRestaurants(enhancedData);
        setLoading(false);
      })
      .catch((err) => { 
        console.error(err); 
        setLoading(false); 
      });
  }, []);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.cuisine && r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = 
      activeCategory === "All" || 
      (r.cuisine && r.cuisine.toLowerCase().includes(activeCategory.toLowerCase())) ||
      r.name.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    // CHANGED: bg-white
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24">
      
      {/* --- 2. HERO SECTION WITH CENTRAL SEARCH --- */}
      <div className="pb-8 pt-12 px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-gray-900">
                  Time to eat.
              </h1>
              
              {/* BIG CENTRAL SEARCH BAR */}
              <div className="relative group max-w-xl mx-auto">
                <div className="absolute inset-0 bg-orange-200 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-full flex items-center p-2 transition-all group-focus-within:border-orange-500 group-focus-within:ring-4 group-focus-within:ring-orange-50">
                    <div className="pl-4 text-gray-400">
                        <Search size={24} />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for taco, pizza, burger..."
                        className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg font-medium text-gray-700 placeholder-gray-400"
                    />
                    <button className="bg-black text-white p-3.5 rounded-full hover:bg-orange-600 transition-colors">
                        <ArrowRight size={20} />
                    </button>
                </div>
              </div>
          </motion.div>
      </div>

      {/* --- 3. STICKY CATEGORY BAR (Sticks on Scroll) --- */}
      <div className="sticky top-0 z-40 bg-white backdrop-blur-md border-gray-100 py-4 ">
        {/* CHANGED: w-[90%] mx-auto */}
        <div className="w-[90%] mx-auto flex items-center gap-4">
            
            <button className="hidden md:flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
                <Filter size={16} /> Filters
            </button>
            <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            activeCategory === cat.id
                            ? "bg-black text-white shadow-lg"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- 4. CONTENT GRID --- */}
      {/* CHANGED: w-[90%] mx-auto */}
      <div className="w-[90%] mx-auto py-10">
        
        <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Nearby Favorites</h2>
            <span className="text-sm font-medium text-gray-500">{filteredRestaurants.length} places found</span>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                 {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
        ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                <AnimatePresence>
                    {filteredRestaurants.map((r, i) => (
                        <RestaurantCard key={r.id} restaurant={r} index={i} />
                    ))}
                </AnimatePresence>
            </motion.div>
        )}
        
        {!loading && filteredRestaurants.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="bg-gray-100 p-6 rounded-full mb-4 text-4xl">🍳</div>
                <p className="text-xl font-bold text-gray-800">No restaurants found</p>
                <button onClick={() => {setSearchTerm(""); setActiveCategory("All")}} className="text-orange-600 font-bold mt-2 hover:underline">Clear Filters</button>
             </div>
        )}

      </div>
    </div>
  );
};

// --- COMPONENT: PREMIUM CARD UI ---
const RestaurantCard = ({ restaurant, index }) => {
  const images = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
  ];
  
  const displayImage = restaurant.image || images[index % images.length];

  return (
    <Link to={`/rest/${restaurant.id}`} className="group block h-full">
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            // Added border border-gray-100 since main background is now white
            className="flex flex-col h-full bg-white rounded-[20px] border border-gray-100 hover:border-orange-100 hover:shadow-xl transition-all duration-300"
        >
            {/* Image Container */}
            <div className="relative h-60 rounded-t-[20px] overflow-hidden">
                <img 
                    src={displayImage} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                <button className="absolute top-3 right-3 bg-white/30 hover:bg-white backdrop-blur-md p-2 rounded-full text-white hover:text-red-500 transition-all shadow-sm">
                    <Heart size={18} fill="currentColor" className="opacity-0 absolute hover:opacity-100" />
                    <Heart size={18} />
                </button>

                <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                    <Clock size={12} className="text-orange-500" /> 20-30 min
                </div>
            </div>

            {/* Content - Added Padding since we have a border now */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md text-xs font-bold">
                        {restaurant.rating} <Star size={10} fill="currentColor" />
                    </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-2 gap-2">
                    <span className="capitalize">{restaurant.cuisine}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>$$$</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <div className="flex items-center gap-1 text-orange-600/80 bg-orange-50 px-2 py-1 rounded-full">
                         <Sparkles size={12} /> Promoted
                    </div>
                    <span>•</span>
                    <span className="text-gray-500 flex items-center gap-1"><Truck size={12}/> Free Delivery</span>
                </div>
            </div>
        </motion.div>
    </Link>
  );
};

const SkeletonCard = () => (
    <div className="h-full border border-gray-100 rounded-[20px] overflow-hidden">
        <div className="h-60 bg-gray-200 animate-pulse" />
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
        </div>
    </div>
);

export default RestaurantsList;