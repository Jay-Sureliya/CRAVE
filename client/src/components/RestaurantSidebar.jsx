import { useNavigate, useLocation } from "react-router-dom";

const RestaurantSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check if link is active
    const isActive = (path) => location.pathname === path 
        ? "bg-orange-50 text-orange-700" 
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col min-h-screen">
            <div className="p-6 flex items-center gap-2 border-b border-gray-100">
                <span className="text-2xl">🍔</span>
                <h1 className="text-2xl font-bold text-orange-600 tracking-tight">CRAVE</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                {/* Dashboard Link */}
                <div 
                    onClick={() => navigate("/restaurant/dashboard")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${isActive('/restaurant')}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    Dashboard
                </div>

                {/* Orders Link */}
                <div 
                    onClick={() => navigate("/restaurant/orders")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${isActive('/restaurant/orders')}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    Orders
                </div>

                {/* Menu Link */}
                <div 
                    onClick={() => navigate("/restaurant/menu")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors ${isActive('/restaurant/menu')}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Menu Items
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default RestaurantSidebar;