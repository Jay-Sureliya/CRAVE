import { useEffect, useState } from "react";
import api from "../../services/api";
import RestaurantSidebar from "../../components/RestaurantSidebar";

const RestaurantDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get("/restaurant/dashboard")
            .then(res => setData(res.data))
            .catch(err => {
                console.error("Dashboard error:", err);
            });
    }, []);

    if (!data) return <div className="p-10">Loading...</div>;

    const stats = data.stats || {};
    const restaurantName = data.message?.split(" ")[2] || "Restaurant";

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <RestaurantSidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                    <p className="text-gray-500">
                        Welcome back, {restaurantName}!
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <p className="text-gray-500">Pending Orders</p>
                        <p className="text-3xl font-bold">
                            {stats.pending_orders ?? 0}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <p className="text-gray-500">Earnings</p>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{stats.todays_earnings ?? 0}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <p className="text-gray-500">Popular Item</p>
                        <p className="text-xl font-bold text-orange-600">
                            {stats.popular_item ?? "N/A"}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RestaurantDashboard;
