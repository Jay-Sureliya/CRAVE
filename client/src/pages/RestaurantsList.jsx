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
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
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
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
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
                        <button onClick={() => { setSearchTerm(""); setActiveCategory("All") }} className="text-orange-600 font-bold mt-2 hover:underline">Clear Filters</button>
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
                        <span className="text-gray-500 flex items-center gap-1"><Truck size={12} /> Free Delivery</span>
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