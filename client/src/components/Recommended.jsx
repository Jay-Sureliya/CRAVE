import React from 'react';

const Recommended = () => {
    // Data for the 3 cards shown in the design
    const deals = [
        {
            id: 1,
            discount: "-40%",
            restaurant: "Chef Burgers London",
            category: "Restaurant",
            image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=800", // Burger flatlay
        },
        {
            id: 2,
            discount: "-20%",
            restaurant: "Grand Ai Cafe London",
            category: "Restaurant",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800", // Steak/Salad flatlay
        },
        {
            id: 3,
            discount: "-17%",
            restaurant: "Butterbrot Caf'e London",
            category: "Restaurant",
            image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=800", // Burger/Sandwich flatlay
        },
    ];

    return (
        <section className="w-[95%] mx-auto py-12 bg-white">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
                {/* Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                    Recommended for you
                </h2>

            </div>

            {/* --- CARDS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.map((deal) => (
                    <div
                        key={deal.id}
                        className="group relative h-[320px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                        {/* Background Image */}
                        <img
                            src={deal.image}
                            alt={deal.restaurant}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Dark Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Discount Badge (Top Right) */}
                        <div className="absolute top-0 right-0 bg-[#03081F] text-white font-bold px-6 py-3 rounded-bl-2xl text-lg z-10">
                            {deal.discount}
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 p-6 w-full z-10">
                            <p className="text-[#FF8A00] font-bold text-sm mb-1">
                                {deal.category}
                            </p>
                            <h3 className="text-white text-2xl font-bold tracking-wide">
                                {deal.restaurant}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Recommended;