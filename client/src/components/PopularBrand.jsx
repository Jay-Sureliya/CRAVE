import React from 'react';

const PopularBrand = () => {
  const brands = [
    {
      id: 1,
      name: "McDonald’s London",
      image: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
      bgColor: "bg-[#DA291C]", // McDonald's Red
      padding: "p-4"
    },
    {
      id: 2,
      name: "Papa Johns",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Papa_John%27s_Pizza_logo.svg/1200px-Papa_John%27s_Pizza_logo.svg.png",
      bgColor: "bg-[#007A33]", // Papa John's Green
      padding: "p-6"
    },
    {
      id: 3,
      name: "KFC West London",
      image: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1024px-KFC_logo.svg.png",
      bgColor: "bg-[#DA291C]", // KFC Red
      padding: "p-6"
    },
    {
      id: 4,
      name: "Texas Chicken",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Texas_Chicken_logo.svg/2560px-Texas_Chicken_logo.svg.png",
      bgColor: "bg-white", // Texas Chicken White
      padding: "p-4"
    },
    {
      id: 5,
      name: "Burger King",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png",
      bgColor: "bg-[#F58020]", // BK Orange
      padding: "p-6"
    },
    {
      id: 6,
      name: "Shaurma 1",
      image: "https://cdn-icons-png.flaticon.com/512/6122/6122851.png", // Placeholder for Shaurma
      bgColor: "bg-[#FFC72C]", // Yellow/Orange
      padding: "p-6"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#03081F]">
          Popular Restaurants
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map((brand) => (
          <div 
            key={brand.id} 
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
          >
            {/* Logo/Image Container */}
            <div className={`h-32 w-full flex items-center justify-center ${brand.bgColor} ${brand.padding}`}>
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-full object-contain filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Bottom Label */}
            <div className="bg-[#FC8A06] p-4 flex items-center justify-center h-16">
              <h3 className="text-white font-bold text-center text-sm md:text-base leading-tight">
                {brand.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularBrand;