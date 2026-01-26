import RestaurantSidebar from "../../components/RestaurantSidebar";

const RestaurantMenu = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">

            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                        + Add New Item
                    </button>
                </div>

                <div className="bg-white p-10 text-center rounded-xl border border-gray-200 text-gray-500">
                    <p>No menu items yet. Click "Add New Item" to start!</p>
                </div>
            </main>
        </div>
    );
};

export default RestaurantMenu;