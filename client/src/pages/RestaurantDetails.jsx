import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const RestaurantDetails = () => {
    const { id } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch the menu for this specific restaurant
        api.get(`/api/menu/${id}`)
            .then((res) => {
                setMenuItems(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load menu.");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading menu...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Link to="/rest" className="flex items-center text-gray-500 hover:text-orange-500 mb-6">
                <ArrowLeft size={20} className="mr-2" /> Back to Restaurants
            </Link>

            <h1 className="text-3xl font-bold mb-6">Menu</h1>

            {menuItems.length === 0 ? (
                <p className="text-gray-500">No items available yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                <p className="text-orange-500 font-bold mt-2">₹{item.price}</p>
                            </div>
                            <button className="bg-orange-100 text-orange-600 p-3 rounded-full hover:bg-orange-200 transition-colors">
                                <ShoppingBag size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;