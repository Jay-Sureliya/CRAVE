// import React from 'react';

// const PopularBrand = () => {
//   const brands = [
//     {
//       id: 1,
//       name: "McDonald’s London",
//       image: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
//       bgColor: "bg-[#DA291C]", // McDonald's Red
//       padding: "p-4"
//     },
//     {
//       id: 2,
//       name: "Papa Johns",
//       image: "data:image/png;base64,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",
//       bgColor: "bg-[#007A33]", // Papa John's Green
//       padding: "p-6"
//     },
//     {
//       id: 3,
//       name: "KFC West London",
//       image: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/1024px-KFC_logo.svg.png",
//       bgColor: "bg-[#DA291C]", // KFC Red
//       padding: "p-6"
//     },
//     {
//       id: 4,
//       name: "Texas Chicken",
//       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Texas_Chicken_logo.svg/2560px-Texas_Chicken_logo.svg.png",
//       bgColor: "bg-white", // Texas Chicken White
//       padding: "p-4"
//     },
//     {
//       id: 5,
//       name: "Burger King",
//       image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png",
//       bgColor: "bg-[#F58020]", // BK Orange
//       padding: "p-6"
//     },
//     {
//       id: 6,
//       name: "Shaurma 1",
//       image: "https://cdn-icons-png.flaticon.com/512/6122/6122851.png", // Placeholder for Shaurma
//       bgColor: "bg-[#FFC72C]", // Yellow/Orange
//       padding: "p-6"
//     }
//   ];

//   return (
//     <div className="w-[95%] mx-auto py-8 px-4 font-sans">
//       {/* Header */}
//       <div className="mb-6">
//         <h2 className="text-2xl md:text-3xl font-extrabold text-[#03081F]">
//           Popular Restaurants
//         </h2>
//       </div>

//       {/* Grid Layout */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         {brands.map((brand) => (
//           <div 
//             key={brand.id} 
//             className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
//           >
//             {/* Logo/Image Container */}
//             <div className={`h-40 w-full flex items-center justify-center ${brand.bgColor} ${brand.padding}`}>
//               <img
//                 src={brand.image}
//                 alt={brand.name}
//                 className="w-full h-full object-contain filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
//               />
//             </div>

//             {/* Bottom Label */}
//             <div className="bg-[#FC8A06] p-5 flex items-center justify-center h-16">
//               <h3 className="text-white font-bold text-center text-sm md:text-base leading-tight">
//                 {brand.name}
//               </h3>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PopularBrand;

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
