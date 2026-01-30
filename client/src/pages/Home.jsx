import React from 'react';
import b1 from '../../public/b1.png';
import b2 from '../../public/b2.png';
import b3 from '../../public/b3.png';
import Recommended from '../components/Recommended';
import PopularCategories from '../components/PopularCategories';
import PopularBrand from '../components/PopularBrand';

const Home = () => {
    return (
        <div className="font-sans text-slate-900 overflow-x-hidden bg-white flex flex-col items-center justify-center">

            {/* --- MAIN HERO CONTAINER --- */}
            <main className="relative w-[95%] bg-[#F9F9F9] rounded-[10px] overflow-hidden  flex flex-col lg:flex-row min-h-[600px]">

                {/* --- LEFT SIDE: TEXT CONTENT --- */}
                <div className="p-8 lg:p-16 z-30 flex flex-col justify-center">
                    <p className="text-slate-600 text-sm font-semibold mb-4 tracking-wide">
                        Order Restaurant food, takeaway and groceries.
                    </p>
                    <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-8 text-slate-900">
                        Feast Your Senses, <br />
                        <span className="text-[#FF8A00]">Fast and Fresh</span>
                    </h1>

                    <div className="mt-2 w-full max-w-sm">
                        <p className="text-gray-500 text-xs mb-3 ml-2">Enter a postcode to see what we deliver</p>
                        <div className="relative flex items-center w-full bg-white rounded-full border border-gray-200 shadow-lg p-1.5 transition-all focus-within:ring-2 ring-orange-100">
                            <input
                                type="text"
                                placeholder="e.g. EC4R 3TE"
                                className="flex-grow bg-transparent px-6 py-3 text-slate-700 outline-none placeholder:text-slate-400"
                            />
                            <button className="bg-[#FF8A00] hover:bg-[#ff9f2e] text-white rounded-full px-8 py-3.5 font-bold text-sm transition-colors shadow-md">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: VISUALS --- */}
                <div className="flex-1 relative h-[500px] lg:h-auto w-full">

                    {/* 1. Background Orange Shape (Using uploaded image_cfb616.png) */}
                    <div className="absolute top-0 right-0 h-full w-full z-0 flex justify-end">
                        <img
                            src={b3}
                            alt="Orange Background"
                            className="h-full object-contain object-right-top opacity-90"
                        />
                    </div>

                    {/* 2. Pasta Girl Image (Using uploaded image_cfb650.jpg) */}
                    <div className="absolute top-16 right-[25%] lg:right-[35%] z-10 hidden md:block">
                        <div className="relative transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <img
                                src={b2}
                                alt="Eating Pasta"
                                className="w-[260px] h-[340px] object-cover rounded-[2rem] border-[8px] border-white shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* 3. Pizza Girl Image (Using uploaded image_cfb68c.jpg) */}
                    {/* Note: mix-blend-multiply helps hide the white/grey background of the JPG */}
                    <div className="absolute bottom-0 left-0 lg:left-[-280px] z-20 h-[85%] w-[130%] flex items-end justify-center lg:justify-start pointer-events-none">
                        <img
                            src={b1}
                            alt="Eating Pizza"
                            className="h-full object-contain mix-blend-multiply drop-shadow-xl"
                        />
                    </div>

                    {/* 4. Floating Notification Cards */}
                    <div className="absolute top-1/2 right-4 lg:right-12 -translate-y-1/2 z-30 flex flex-col gap-5">
                        <NotificationCard
                            step="1"
                            title="We've Received your order!"
                            subtitle="Awaiting Restaurant acceptance"
                        />
                        <NotificationCard
                            step="2"
                            title="Order Accepted! ✅"
                            subtitle="Your order will be delivered shortly"
                        />
                        <NotificationCard
                            step="3"
                            title="Your rider's nearby 🚴"
                            subtitle="They're almost there - get ready!"
                        />
                    </div>
                </div>
            </main>

                <Recommended />
                <PopularCategories />
                <PopularBrand />

            {/* --- GLOBAL STYLES --- */}
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

// --- HELPER COMPONENT FOR THE NOTIFICATIONS ---
const NotificationCard = ({ step, title, subtitle }) => {
    return (
        <div className="relative pl-6 group cursor-default">
            {/* The Large Number Behind */}
            <span className="absolute -left-4 -top-5 text-[80px] font-black text-white/40 z-0 select-none group-hover:text-white/60 transition-colors">
                {step}
            </span>

            {/* The Card Content */}
            <div className="relative z-10 bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl p-4 w-[280px] transition-transform hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                        Order <span className="text-[#FF8A00]">●</span>
                    </span>
                    <span className="text-[10px] text-slate-400 italic">now</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {title}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {subtitle}
                </p>
            </div>
        </div>
    );
};

export default Home;