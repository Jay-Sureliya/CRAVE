import { useState } from "react";
import api from "../../services/api"; 

const RestaurantMenu = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const handleAddItem = async (e) => {
        e.preventDefault();

        // 1. Get raw ID from session
        const rawRestaurantId = sessionStorage.getItem("restaurant_id");

        // 2. Validate Session
        // Checks for null, empty string, or the string "undefined" or "null"
        if (!rawRestaurantId || rawRestaurantId === "undefined" || rawRestaurantId === "null") {
            alert("Session Error: Restaurant ID missing. Please Log Out and Log In again.");
            return;
        }

        // 3. Validate Inputs
        if (!name || !price) {
            alert("Please enter both name and price.");
            return;
        }

        try {
            console.log("Submitting Item:", { name, price, restaurant_id: rawRestaurantId });

            // 4. Send Request
            await api.post("/api/menu/add", {
                name: name,
                price: parseFloat(price), // Ensure number
                restaurant_id: parseInt(rawRestaurantId) // Ensure integer
            });

            // 5. Success
            alert("Item added successfully!");
            setName("");
            setPrice("");

        } catch (error) {
            console.error("Full Error:", error);
            
            if (error.response && error.response.data) {
                // Show exact backend error
                const msg = JSON.stringify(error.response.data.detail || error.response.data);
                alert(`Backend Error: ${msg}`);
            } else {
                alert("Failed to connect to server.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1 p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Menu</h2>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
                    <form onSubmit={handleAddItem}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                            <input
                                placeholder="e.g. Pepperoni Pizza"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 299"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                        >
                            + Add New Item
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RestaurantMenu;