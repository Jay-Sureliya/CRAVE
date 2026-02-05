import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

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
                setLoading(false);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Filter Logic (Runs whenever location or data changes)
    useEffect(() => {
        if (userLocation && restaurants.length > 0) {
            const filtered = restaurants.filter(r => 
                r.address && r.address.toLowerCase().includes(userLocation.toLowerCase())
            );
            setFilteredRestaurants(filtered);
        } else {
            // If no location set yet, maybe show nothing or all (your choice)
            // Currently showing all if no location is enforced, but modal will force it.
            setFilteredRestaurants(restaurants); 
        }
    }, [userLocation, restaurants]);

    // 3. Handle Location Update from Modal
    const handleLocationSet = (location) => {
        setUserLocation(location);
        localStorage.setItem("user_location", location);
        // The useEffect above will handle the filtering automatically
    };

    return (
        <div className="p-8 min-h-screen">
            

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading restaurants...</div>
            ) : filteredRestaurants.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-lg">No restaurants found in <span className="font-bold text-gray-600">{userLocation}</span>.</p>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('user_location');
                            window.location.reload();
                        }}
                        className="mt-4 text-orange-500 font-bold hover:underline"
                    >
                        Try a different city
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRestaurants.map((rest) => (
                        <Link to={`/rest/${rest.id}`} key={rest.id} className="group block">
                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                
                                {/* Image Container */}
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={rest.profile_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"} 
                                        alt={rest.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        {rest.is_active ? (
                                            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">OPEN</span>
                                        ) : (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">CLOSED</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">{rest.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                                        <MapPin size={14} className="text-orange-400" /> 
                                        <span className="truncate">{rest.address}</span>
                                    </p>
                                    
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-yellow-400 text-sm">★</span>
                                            <span className="text-xs font-bold text-gray-700">4.5</span>
                                            <span className="text-xs text-gray-400">(50+)</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">View Menu →</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantsList;