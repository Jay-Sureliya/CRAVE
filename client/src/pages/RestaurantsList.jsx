import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, UtensilsCrossed, Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// --- HELPER: Lazy Load Images ---
const getImageUrl = (restaurant) => {
    const DEFAULT_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
    if (!restaurant || !restaurant.profile_image) return DEFAULT_IMG;

    // Use Base64 string directly from the Restaurant table
    if (restaurant.profile_image.startsWith("data:image")) {
        return restaurant.profile_image;
    }

    // Handle external URLs
    if (restaurant.profile_image.startsWith("http")) {
        return restaurant.profile_image;
    }

    return DEFAULT_IMG;
};

// --- COMPONENT: Skeleton Loader ---
const RestaurantSkeleton = () => (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm">
        <div className="h-48 bg-stone-200 animate-pulse" />
        <div className="p-5 space-y-4">
            <div className="flex justify-between items-start">
                <div className="h-6 bg-stone-200 rounded w-2/3 animate-pulse" />
                <div className="h-5 bg-stone-200 rounded w-10 animate-pulse" />
            </div>
            <div className="h-4 bg-stone-100 rounded w-full animate-pulse" />
            <div className="pt-4 border-t border-stone-50 flex justify-between items-center">
                <div className="h-4 bg-stone-100 rounded w-20 animate-pulse" />
                <div className="h-8 bg-stone-100 rounded-lg w-24 animate-pulse" />
            </div>
        </div>
    </div>
);

const RestaurantsList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [userLocation, setUserLocation] = useState(localStorage.getItem("user_location") || "");
    const [loading, setLoading] = useState(true);

    // 1. Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/restaurants");
                setRestaurants(res.data);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Filter Logic
    useEffect(() => {
        if (userLocation && restaurants.length > 0) {
            const filtered = restaurants.filter(r =>
                r.address && r.address.toLowerCase().includes(userLocation.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        } else {
            setFilteredRestaurants(restaurants);
        }
    }, [userLocation, restaurants]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans text-stone-900">

            {/* --- Header Section --- */}
            <div className="max-w-7xl mx-auto mb-10 mt-4">
                <h1 className="text-4xl font-black text-stone-800 tracking-tight mb-2">
                    Restaurants <span className="text-orange-500">Near You</span>
                </h1>
                <div className="flex items-center gap-2 text-stone-500 font-medium">
                    <MapPin size={18} className="text-orange-400" />
                    {userLocation ? (
                        <span>Showing results for <span className="text-stone-800 font-bold underline decoration-orange-300">{userLocation}</span></span>
                    ) : (
                        <span>Exploring all locations</span>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <RestaurantSkeleton key={n} />)}
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-stone-200 shadow-sm">
                        <div className="bg-orange-50 p-6 rounded-full mb-6">
                            <UtensilsCrossed size={48} className="text-orange-300" />
                        </div>
                        <p className="text-xl font-bold text-stone-700 mb-2">No restaurants found in this area</p>
                        <p className="text-stone-400 mb-8">We couldn't find any matches for "{userLocation}"</p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user_location');
                                window.location.reload();
                            }}
                            className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-stone-200"
                        >
                            View All Cities
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredRestaurants.map((rest, index) => (
                            <motion.div
                                key={rest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link to={`/rest/${rest.id}`} className="group block h-full">
                                    <div className="bg-white border border-stone-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col relative">

                                        {/* Image Container */}
                                        <div className="h-56 overflow-hidden relative bg-stone-100">
                                            <img
                                                src={getImageUrl(rest)}
                                                alt={rest.name}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                                                }}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                                                {rest.is_active ? (
                                                    <span className="text-green-600 text-xs font-black tracking-wider uppercase flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Open
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-400 text-xs font-black tracking-wider uppercase">Closed</span>
                                                )}
                                            </div>

                                            {/* Floating Rating Badge */}
                                            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                                                <Star size={14} className="fill-orange-500 text-orange-500" />
                                                <span className="text-xs font-bold text-stone-800">4.5</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-stone-800 group-hover:text-orange-600 transition-colors leading-tight">
                                                    {rest.name}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-stone-500 flex items-start gap-1.5 mb-6 line-clamp-2">
                                                <MapPin size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                                <span className="font-medium">{rest.address || "Address unavailable"}</span>
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between group-hover:border-orange-100 transition-colors">
                                                {/* --- DYNAMIC CUISINE --- */}
                                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                                    <TrendingUp size={14} className="text-orange-300" />
                                                    {rest.cuisine || "Multi-Cuisine"}
                                                </span>

                                                <div className="w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantsList;