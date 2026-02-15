import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import TopBanner from "./TopBanner";
import api from "../services/api";

const Navbar = () => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);

    const itemsRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    // --- IMAGE FORMATTER & COMPRESSION ---
    const getProfileImage = (userData) => {
        // Check all possible keys
        const img = userData?.profile_image || userData?.image || userData?.logo;

        if (!img) return DEFAULT_AVATAR;

        // If it's already a base64 string, return it exactly as is
        if (img.startsWith('data:image')) return img;

        // If it's a path, handle it
        return img.startsWith('http') ? img : `${api.defaults.baseURL}${img}`;
    };

    const menuItems = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact Us", path: "/Contact-us" },
        { name: "Restaurant", path: "/rest" },
        { name: "Track Order", path: "/track-order" },
    ];

    // Navbar.jsx snippet
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        const storedUserId = sessionStorage.getItem("user_id");

        // Important: check if storedUserId is "undefined" (string) or null
        const hasValidId = storedUserId && storedUserId !== "undefined" && storedUserId !== "null";

        setIsLoggedIn(!!storedToken && hasValidId);

        const fetchUser = async () => {
            // Only fetch if we have valid credentials and no user data yet
            if (storedToken && hasValidId && !user) {
                try {
                    const res = await api.get(`/users/${storedUserId}`);
                    setUser(res.data);
                    setUserRole(res.data.role);
                } catch (err) {
                    if (err.response?.status === 404) {
                        console.warn("User not found in DB. Cleaning up...");
                        handleLogout();
                    }
                }
            }
        };

        fetchUser();
    }, [location.pathname, navigate]); // Removed token/userId from here as they are inside

    const handleProfileClick = () => {
        if (userRole === 'restaurant') navigate("/restaurant/dashboard");
        else if (userRole === 'admin') navigate("/admin/dashboard");
        else if (userRole === 'customer') navigate("/profile");
        else navigate("/");
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        setIsLoggedIn(false);
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white overflow-x-clip">
            <TopBanner isMapOpen={isMapOpen} setIsMapOpen={setIsMapOpen} />

            <div className="w-[95%] mx-auto py-4 pb-6 flex items-center justify-between">
                {/* LOGO */}
                <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group z-50">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30 transition-transform group-hover:rotate-3">
                        C
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl tracking-widest font-bold text-slate-900 leading-none">CRAVE</span>
                        <span className="text-[9px] font-bold text-orange-500 tracking-[0.3em] uppercase">Food Delivery</span>
                    </div>
                </div>

                {/* DESKTOP MENU */}
                <div className="hidden lg:block">
                    <ul className="flex items-center gap-6">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                                            : "text-slate-900 hover:bg-orange-50 hover:text-orange-600"
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT SECTION */}
                <div className="hidden lg:flex items-center gap-8">
                    {isLoggedIn ? (
                        <button
                            onClick={handleProfileClick}
                            className="group relative flex items-center gap-4 p-1.5 pr-6 rounded-[1.25rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md"
                        >
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md group-hover:shadow-orange-100 transition-all bg-slate-100">
                                <img
                                    src={getProfileImage(user)}
                                    alt="Profile"
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                />
                            </div>

                            <div className="text-left hidden lg:block">
                                <p className="text-[12px] font-black text-slate-900 leading-none uppercase tracking-wider">
                                    {user?.username || "Account"}
                                </p>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.1em] mt-1.5">
                                    {/* {userRole === 'restaurant' ? 'Merchant Dashboard' : 'View Account'} */}
                                    {user?.email || "Email"}
                                </p>
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="cursor-pointer flex items-center gap-4 bg-[#03081F] text-white px-3.5 py-2.5 rounded-full font-bold text-base hover:bg-slate-900 transition-all shadow-xl hover:scale-[1.02] active:scale-95"
                        >
                            <div className="bg-orange-500 rounded-full p-2">
                                <User className="w-4 h-4 text-black fill-black" />
                            </div>
                            Login / Signup
                        </button> 
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button className="lg:hidden p-2 text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* MOBILE MENU */}
            <div className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center transition-transform duration-300 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="w-full px-8 space-y-3">
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={handleProfileClick}
                                className="w-full flex justify-center items-center gap-3 bg-orange-500 text-white py-4 rounded-full font-bold text-lg"
                            >
                                <img
                                    src={getProfileImage(user)}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-lg object-cover border-2 border-white"
                                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                />
                                {userRole === 'restaurant' ? 'Open Dashboard' : 'My Profile'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex justify-center items-center gap-3 bg-slate-100 text-red-500 py-4 rounded-full font-bold text-lg"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
                            className="w-full flex justify-center items-center gap-3 bg-[#03081F] text-white py-4 rounded-full font-bold text-lg"
                        >
                            <User className="w-5 h-5" />
                            Login/Signup
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;