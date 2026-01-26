// import React, { useState, useRef, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { Menu, X, User } from "lucide-react";
// import TopBanner from "./TopBanner";

// const Navbar = () => {
//     // --- STATE MANAGEMENT ---
//     const [activeIndex, setActiveIndex] = useState(-1);
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const [isMapOpen, setIsMapOpen] = useState(false);

//     // Auth State
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [userRole, setUserRole] = useState(null);

//     const itemsRef = useRef([]);
//     const navigate = useNavigate();
//     const location = useLocation();

//     const menuItems = [
//         { name: "Home", path: "/" },
//         { name: "About", path: "/about" },
//         { name: "Special Offer", path: "/special-offer" },
//         { name: "Restaurant", path: "/rest" },
//         { name: "Track Order", path: "/track-order" },
//     ];

//     // --- LOGIC ---
//     useEffect(() => {
//         const currentIndex = menuItems.findIndex(item => item.path === location.pathname);
//         setActiveIndex(currentIndex !== -1 ? currentIndex : -1);
//         setIsMenuOpen(false);

//         const token = sessionStorage.getItem("token");
//         const role = sessionStorage.getItem("role");

//         setIsLoggedIn(!!token);
//         setUserRole(role);
        
//     }, [location.pathname]);

//     const handleProfileClick = () => {
//         if (userRole === 'restaurant') {
//             navigate("/restaurant/dashboard");
//         } else if (userRole === 'admin') {
//             navigate("/admin/dashboard");
//         } else {
//             navigate("/track-order");
//         }
//         setIsMenuOpen(false);
//     };

//     return (
//         /* 'overflow-x-clip' prevents horizontal scrollbars if content is too wide */
//         <nav className="sticky top-0 z-50 w-full overflow-x-clip">

//             {/* Top Banner */}
//             <TopBanner isMapOpen={isMapOpen} setIsMapOpen={setIsMapOpen} />

//             {/* Main Nav */}
//             <div className="w-full mx-auto px-6 py-4 flex items-center justify-between bg-white shadow-sm">

//                 {/* LOGO */}
//                 <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group z-50">
//                     <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/30 transition-transform group-hover:rotate-3">
//                         C
//                     </div>
//                     <div className="flex flex-col">
//                         <span className="text-2xl tracking-widest font-bold text-slate-900 leading-none">CRAVE</span>
//                         <span className="text-[9px] font-bold text-orange-500 tracking-[0.3em] uppercase">Food Delivery</span>
//                     </div>
//                 </div>

//                 {/* DESKTOP MENU */}
//                 <div className="hidden lg:block">
//                     <ul className="flex items-center gap-6">
//                         {menuItems.map((item, index) => (
//                             <li key={index} ref={(el) => (itemsRef.current[index] = el)}>
//                                 <NavLink
//                                     to={item.path}
//                                     className={({ isActive }) =>
//                                         `px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
//                                             ? "bg-orange-500 text-white shadow-md shadow-orange-100"
//                                             : "text-slate-900 hover:bg-orange-50 hover:text-orange-600"
//                                         }`
//                                     }
//                                 >
//                                     {item.name === "Home" ? "Home" :
//                                         item.name === "Special Offer" ? "Special Offers" :
//                                             item.name === "Restaurant" ? "Restaurants" :
//                                                 item.name}
//                                 </NavLink>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 {/* --- RIGHT SECTION --- */}
//                 <div className="hidden lg:flex items-center gap-3">
//                     {isLoggedIn ? (
//                         /* LOGGED IN: Only Show Dashboard/Profile Button */
//                         <button
//                             onClick={handleProfileClick}
//                             className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-full font-bold text-sm shadow-md transition-all"
//                         >
//                             <User className="w-4 h-4" />
//                             {userRole === 'restaurant' ? 'Dashboard' : 'My Profile'}
//                         </button>
//                     ) : (
//                         /* NOT LOGGED IN */
//                         <button
//                             onClick={() => navigate("/login")}
//                             className="cursor-pointer flex items-center gap-3 bg-[#03081F] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-lg"
//                         >
//                             <div className="bg-orange-500 rounded-full p-1">
//                                 <User className="w-4 h-4 text-black fill-black" />
//                             </div>
//                             Login/Signup
//                         </button>
//                     )}
//                 </div>

//                 {/* MOBILE TOGGLE */}
//                 <button className="lg:hidden p-2 text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//                     {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
//                 </button>
//             </div>

//             {/* --- MOBILE MENU --- */}
//             <div className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center transition-transform duration-300 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
//                 <ul className="flex flex-col items-center gap-6 mb-10 w-full px-8">
//                     {menuItems.map((item, index) => (
//                         <li key={index} className="w-full text-center">
//                             <NavLink
//                                 to={item.path}
//                                 className={({ isActive }) =>
//                                     `block w-full py-4 text-xl font-bold rounded-2xl transition-all ${isActive ? "bg-orange-500 text-white" : "text-slate-900 bg-gray-50"}`
//                                 }
//                                 onClick={() => setIsMenuOpen(false)}
//                             >
//                                 {item.name}
//                             </NavLink>
//                         </li>
//                     ))}
//                 </ul>

//                 <div className="w-full px-8 space-y-3">
//                     {isLoggedIn ? (
//                         <button
//                             onClick={handleProfileClick}
//                             className="w-full flex justify-center items-center gap-3 bg-orange-500 text-white py-4 rounded-full font-bold text-lg"
//                         >
//                             <User className="w-5 h-5" />
//                             {userRole === 'restaurant' ? 'Open Dashboard' : 'My Profile'}
//                         </button>
//                     ) : (
//                         <button
//                             onClick={() => { navigate("/login"); setIsMenuOpen(false); }}
//                             className="w-full flex justify-center items-center gap-3 bg-[#03081F] text-white py-4 rounded-full font-bold text-lg"
//                         >
//                             <User className="w-5 h-5" />
//                             Login/Signup
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;

import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import TopBanner from "./TopBanner";

const Navbar = () => {
    // --- STATE MANAGEMENT ---
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const itemsRef = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Special Offer", path: "/special-offer" },
        { name: "Restaurant", path: "/rest" },
        { name: "Track Order", path: "/track-order" },
    ];

    // --- LOGIC ---
    useEffect(() => {
        // 1. Update Active Menu Item based on URL
        const currentIndex = menuItems.findIndex(item => item.path === location.pathname);
        setActiveIndex(currentIndex !== -1 ? currentIndex : -1);
        
        // 2. Close mobile menu on route change
        setIsMenuOpen(false);

        // 3. CHECK SESSION STORAGE (Fixes the multiple tab issue)
        const token = sessionStorage.getItem("token");
        const role = sessionStorage.getItem("role");

        setIsLoggedIn(!!token);
        setUserRole(role);
        
    }, [location.pathname]);

    // Handle Dashboard Navigation
    const handleProfileClick = () => {
        if (userRole === 'restaurant') {
            navigate("/restaurant/dashboard");
        } else if (userRole === 'admin') {
            navigate("/admin/dashboard");
        } else {
            navigate("/track-order");
        }
        setIsMenuOpen(false);
    };

    return (
        /* 'overflow-x-clip' prevents horizontal scrollbars */
        <nav className="sticky top-0 z-50 w-full overflow-x-clip">

            {/* Top Banner */}
            <TopBanner isMapOpen={isMapOpen} setIsMapOpen={setIsMapOpen} />

            {/* Main Nav */}
            <div className="w-full mx-auto px-6 py-4 flex items-center justify-between bg-white ">

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
                            <li key={index} ref={(el) => (itemsRef.current[index] = el)}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
                                            ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                                            : "text-slate-900 hover:bg-orange-50 hover:text-orange-600"
                                        }`
                                    }
                                >
                                    {item.name === "Home" ? "Home" :
                                     item.name === "Special Offer" ? "Special Offers" :
                                     item.name === "Restaurant" ? "Restaurants" :
                                     item.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- RIGHT SECTION --- */}
                <div className="hidden lg:flex items-center gap-3">
                    {isLoggedIn ? (
                        /* LOGGED IN: Only Show Dashboard/Profile Button */
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-full font-bold text-sm shadow-md transition-all"
                        >
                            <User className="w-4 h-4" />
                            {userRole === 'restaurant' ? 'Dashboard' : 'My Profile'}
                        </button>
                    ) : (
                        /* NOT LOGGED IN */
                        <button
                            onClick={() => navigate("/login")}
                            className="cursor-pointer flex items-center gap-3 bg-[#03081F] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-lg"
                        >
                            <div className="bg-orange-500 rounded-full p-1">
                                <User className="w-4 h-4 text-black fill-black" />
                            </div>
                            Login/Signup
                        </button>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button className="lg:hidden p-2 text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* --- MOBILE MENU --- */}
            <div className={`fixed inset-0 bg-white z-40 flex flex-col items-center justify-center transition-transform duration-300 lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <ul className="flex flex-col items-center gap-6 mb-10 w-full px-8">
                    {menuItems.map((item, index) => (
                        <li key={index} className="w-full text-center">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block w-full py-4 text-xl font-bold rounded-2xl transition-all ${isActive ? "bg-orange-500 text-white" : "text-slate-900 bg-gray-50"}`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="w-full px-8 space-y-3">
                    {isLoggedIn ? (
                        <button
                            onClick={handleProfileClick}
                            className="w-full flex justify-center items-center gap-3 bg-orange-500 text-white py-4 rounded-full font-bold text-lg"
                        >
                            <User className="w-5 h-5" />
                            {userRole === 'restaurant' ? 'Open Dashboard' : 'My Profile'}
                        </button>
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