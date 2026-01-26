import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar"
import TopBanner from "../components/TopBanner.jsx";

const Home = () => {
    return (
        <div className="font-sans text-slate-900 overflow-x-hidden bg-white">

            {/* --- MAIN CONTENT --- */}
            {/* Added pt-40 to prevent content from hiding behind the fixed headers */}
            <main >
                {/* Your other components like Hero, RestaurantGrid, etc. go here */}
                ssm
            </main>

            <style>{`
                html, body {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default Home;
