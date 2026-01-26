import { useState } from "react";
import RestaurantSidebar from "../../components/RestaurantSidebar";

const RestaurantOrders = () => {
    const [activeTab, setActiveTab] = useState("pending");

    // Dummy data for now (we will connect API later)
    const orders = [
        { id: 101, item: "Spicy Burger", status: "pending", total: "$15" },
        { id: 102, item: "Cheese Pizza", status: "completed", total: "$22" },
        { id: 103, item: "Coke & Fries", status: "pending", total: "$8" },
    ];

    const filteredOrders = orders.filter(order => order.status === activeTab);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">

            <main className="flex-1 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders Manager</h2>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button 
                        className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-orange-500 text-orange-600 font-bold' : 'text-gray-500'}`}
                        onClick={() => setActiveTab("pending")}
                    >
                        Pending Orders
                    </button>
                    <button 
                        className={`pb-2 px-1 ${activeTab === 'completed' ? 'border-b-2 border-green-500 text-green-600 font-bold' : 'text-gray-500'}`}
                        onClick={() => setActiveTab("completed")}
                    >
                        Completed Orders
                    </button>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <p className="p-6 text-gray-400">No {activeTab} orders found.</p>
                    ) : (
                        filteredOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-800">Order #{order.id}</p>
                                    <p className="text-sm text-gray-500">{order.item}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{order.total}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default RestaurantOrders;