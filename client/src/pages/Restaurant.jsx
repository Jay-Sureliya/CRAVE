import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const Restaurant = () => {
    const { id } = useParams(); // restaurant_id from URL
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/menu/restaurant/${id}`)
            .then(res => setMenu(res.data))
            .catch(() => setLoading(false));
    }, [id]);


    if (loading) {
        return <div className="p-10 text-center">Loading menu...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <h1 className="text-3xl font-bold mb-8">Restaurant Menu</h1>

            {menu.length === 0 && (
                <p className="text-gray-500">No items available yet.</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {menu.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl border p-5 shadow-sm"
                    >
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-orange-500 font-bold mt-2">
                            ₹{item.price}
                        </p>

                        <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Restaurant;
