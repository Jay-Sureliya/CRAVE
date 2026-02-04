import React from 'react';
import a1 from "../../public/a1.png"

const Ad = () => {
    return (
        <div className="flex items-center justify-center w-[95%] bg-white m-10 font-sans">

            {/* Main Card 
         Background set to #EBEDF0 to blend with the grey background of your photo 
      */}
            <div className="relative w-full bg-[#EBEDF0] rounded-[10px] flex flex-col md:flex-row overflow-hidden shadow-sm items-center">

                {/* Left Side: Image Section */}
                <div className="w-full md:w-5/12 h-full flex items-end justify-center relative">
                    {/* Using the exact file name you provided.
             Ensure this file is in your project's public folder.
          */}
                    <img
                        src={a1}
                        alt="Happy couple using phones"
                        className="object-cover w-full h-[350px] md:h-auto md:min-h-[450px]"
                        style={{ objectPosition: 'center top' }}
                    />
                </div>

                {/* Right Side: Content Section */}
                <div className="w-full md:w-7/12 p-6 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left z-20">

                    {/* Headline: Order[.uk]ing is more */}
                    <div className="flex flex-col md:flex-row items-center md:items-baseline mb-4">
                        <div className="flex items-baseline">
                            {/* 'Order' text */}
                            <span className="text-3xl md:text-6xl font-extrabold text-[#03081F] tracking-tighter">
                                Order
                            </span>

                            {/* '.uk' Logo Box */}
                            <div className="relative mx-1 transform -translate-y-1 md:-translate-y-2">
                                <div className="bg-white/20 absolute inset-0 rounded-md transform rotate-3"></div>
                                <span className="block text-sm md:text-xl font-bold text-white bg-orange-500 px-2 py-0.5 md:py-1 rounded-md transform rotate-0 border-2 border-white/40">
                                    .uk
                                </span>
                            </div>

                            {/* 'ing is more' text */}
                            <span className="text-3xl md:text-6xl font-extrabold text-[#03081F] tracking-tighter">
                                ing is more
                            </span>
                        </div>
                    </div>

                    {/* Dark Pill: Personalised & Instant */}
                    {/* Note: Rounded-full on left, rounded-full on right, matches the "capsule" look */}
                    <div className="bg-[#03081F] rounded-full pl-8 pr-10 py-3 md:py-4 mb-6 shadow-xl flex items-center gap-3">
                        <span className="text-orange-500 font-bold text-xl md:text-3xl underline decoration-orange-500 underline-offset-4 decoration-2">
                            Personalised
                        </span>
                        <span className="text-white text-xl md:text-3xl font-light">
                            & Instant
                        </span>
                    </div>

                    {/* Subtext */}
                    <p className="text-[#03081F] text-sm md:text-lg mb-8 font-medium tracking-wide">
                        Download the Order.uk app for faster ordering
                    </p>

                    {/* Store Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">

                        {/* App Store */}
                        <button className="flex items-center bg-black text-white px-4 py-2.5 rounded-lg border border-gray-800 hover:opacity-80 transition-opacity min-w-[170px] shadow-lg">
                            <div className="mr-3">
                                <svg viewBox="0 0 384 512" width="28" height="28" fill="white">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 79.9c14.2 35.2 39 85.1 69 85.1 27.2 0 31.2-16.7 68.3-16.7 37 0 39.4 16.7 68.3 16.7 30 0 51.8-43.3 69-85.1 12.7-27.9 17.5-49.1 17.5-50.6-.1-.3-41-14.7-41.7-65.1zm-75-154.2c16.3-18.3 26.2-41.6 23.6-67.6-25.3 1.3-51.3 15.6-66.9 33.7-14.3 16.1-23.7 41.6-20.9 66.8 28.5 2.3 49.3-14.8 64.2-32.9z" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-gray-400 font-medium mb-1">Download on the</span>
                                <span className="text-lg font-bold font-sans">App Store</span>
                            </div>
                        </button>

                        {/* Google Play */}
                        <button className="flex items-center bg-black text-white px-4 py-2.5 rounded-lg border border-gray-800 hover:opacity-80 transition-opacity min-w-[170px] shadow-lg">
                            <div className="mr-3">
                                <svg viewBox="0 0 512 512" width="26" height="26" fill="white">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                </svg>
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] text-gray-400 font-medium mb-1">GET IT ON</span>
                                <span className="text-lg font-bold font-sans">Google Play</span>
                            </div>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ad;