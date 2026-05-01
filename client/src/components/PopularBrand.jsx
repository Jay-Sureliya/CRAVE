import React from 'react';
const PopularBrand = () => {
  const brands = [
    {
      id: 1,
      name: "McDonald’s London",
      image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/McDonald%27s_logo.svg",
      bgColor: "bg-[#DA291C]",
      labelColor: "bg-[#C42519]",
      padding: "p-8",
    },
    {
      id: 2,
      name: "Papa Johns",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Papa_Johns_logo.svg/500px-Papa_Johns_logo.svg.png?20211123195756",
      bgColor: "bg-[#007A33]",
      labelColor: "bg-[#00662B]",
      padding: "p-6",
    },
    {
      id: 3,
      name: "KFC West London",
      image: "https://upload.wikimedia.org/wikipedia/sco/b/bf/KFC_logo.svg",
      bgColor: "bg-[#DA291C]",
      labelColor: "bg-[#C42519]",
      padding: "p-6",
    },
    {
      id: 4,
      name: "Texas Chicken",
      image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
      bgColor: "bg-[#FFC20E]",
      labelColor: "bg-[#E5AE0D]",
      padding: "p-6",
    },
    {
      id: 5,
      name: "Burger King",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Burger_King_2020.svg",
      bgColor: "bg-[#F58020]",
      labelColor: "bg-[#D9711C]",
      padding: "p-6",
    },
    {
      id: 6,
      name: "Shaurma 1",
      image: "https://cdn-icons-png.flaticon.com/512/3480/3480618.png",
      bgColor: "bg-[#5C3D2E]",
      labelColor: "bg-[#4A3125]",
      padding: "p-10",
    },
  ];


  return (
    <div className="w-[95%] mx-auto py-8 px-4 font-sans">
      <h2 className="text-2xl md:text-3xl font-black mb-8 text-[#03081F]">
        Popular Restaurants
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="group cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`h-36 flex items-center justify-center ${brand.bgColor} ${brand.padding}`}>
              <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className={`${brand.labelColor} p-4 h-14 flex items-center justify-center`}>
              <h3 className="text-white font-bold text-center text-[10px] md:text-xs uppercase tracking-widest">
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
