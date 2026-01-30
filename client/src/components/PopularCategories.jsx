import React from 'react';

const PopularCategories = () => {
    // Data array to make the component dynamic and clean
    const categories = [
        {
            id: 1,
            title: "Burgers & Fast food",
            restaurants: 21,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
            alt: "Burger and fries"
        },
        {
            id: 2,
            title: "Salads",
            restaurants: 32,
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
            alt: "Fresh salad bowl"
        },
        {
            id: 3,
            title: "Pasta & Casuals",
            restaurants: 4,
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
            alt: "Pasta dish"
        },
        {
            id: 4,
            title: "Pizza",
            restaurants: 32,
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop",
            alt: "Pepperoni pizza"
        },
        {
            id: 5,
            title: "Breakfast",
            restaurants: 4,
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop",
            alt: "Breakfast bagel"
        },
        {
            id: 6,
            title: "Soups",
            restaurants: 32,
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
            alt: "Tomato soup"
        }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto py-8">
            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#03081F]">
                    Popular Categories
                </h2>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="group cursor-pointer rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        {/* Image Area */}
                        <div className="h-40 w-full bg-[#F5F5F5] overflow-hidden relative">
                            <img
                                src={category.image}
                                alt={category.alt}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Text Area */}
                        <div className="bg-[#F9F9F9] p-4 flex flex-col gap-1">
                            <h3 className="font-bold text-[#03081F] text-lg leading-tight">
                                {category.title}
                            </h3>
                            <p className="text-[#FC8A06] text-sm font-medium">
                                {category.restaurants} Restaurants
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularCategories;