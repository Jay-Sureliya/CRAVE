// import { useState, useEffect } from "react";
// import {
//     Upload,
//     IndianRupee,
//     Leaf,
//     Drumstick,
//     Tag,
//     Type,
//     FileText,
//     Loader2,
//     ImagePlus,
//     X,
//     Sparkles
// } from "lucide-react";
// import api from "../../services/api";

// const RestaurantMenu = () => {
//     const [loading, setLoading] = useState(false);
//     const [imagePreview, setImagePreview] = useState(null);

//     const [formData, setFormData] = useState({
//         name: "",
//         description: "",
//         originalPrice: "",
//         discountPrice: "",
//         isVeg: true,
//         category: "",
//         imageFile: null
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setFormData(prev => ({ ...prev, imageFile: file }));
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const removeImage = () => {
//         setFormData(prev => ({ ...prev, imageFile: null }));
//         setImagePreview(null);
//     };

//     const handleCategoryBlur = () => {
//         if (!formData.category) return;
//         let formatted = formData.category
//             .toLowerCase()
//             .trim()
//             .replace(/-/g, ' ')
//             .replace(/\s+/g, ' ')
//             .replace(/\b\w/g, (char) => char.toUpperCase());
//         setFormData(prev => ({ ...prev, category: formatted }));
//     };

//     const handleAddItem = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         const rawRestaurantId = sessionStorage.getItem("restaurant_id");

//         if (!rawRestaurantId) {
//             alert("Session Error: Please Log In again.");
//             setLoading(false);
//             return;
//         }

//         if (!formData.name || !formData.originalPrice || !formData.category) {
//             alert("Please fill in the required fields (Name, Price, Category).");
//             setLoading(false);
//             return;
//         }

//         try {
//             const data = new FormData();
//             data.append("name", formData.name);
//             data.append("description", formData.description);
//             data.append("price", formData.originalPrice);
//             data.append("discount_price", formData.discountPrice);
//             data.append("is_veg", formData.isVeg);
//             data.append("category", formData.category);
//             data.append("restaurant_id", rawRestaurantId);

//             if (formData.imageFile) {
//                 data.append("image", formData.imageFile);
//             }

//             await api.post("/api/menu/add", data);

//             alert("Item added successfully!");

//             setFormData({
//                 name: "", description: "", originalPrice: "", discountPrice: "",
//                 isVeg: true, category: "", imageFile: null
//             });
//             setImagePreview(null);

//         } catch (error) {
//             console.error("Full Error:", error);
//             const msg = error.response?.data?.detail || "Failed to add item.";
//             alert(`Error: ${JSON.stringify(msg)}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         // Theme Change: Background is now a soft orange tint
//         <div className="min-h-screen bg-orange-50/60 p-6 md:p-12 flex justify-center font-sans">
//             <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl shadow-orange-100 overflow-hidden border border-white">

//                 {/* Theme Change: Header is now a Gradient Orange */}
//                 <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
//                     {/* Decorative Circle */}
//                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

//                     <div className="relative z-10">
//                         <div className="flex items-center gap-2 mb-1">
//                             <Sparkles className="w-5 h-5 text-yellow-200" />
//                             <span className="text-orange-100 font-semibold tracking-wide text-xs uppercase">Menu Creator</span>
//                         </div>
//                         <h2 className="text-3xl font-extrabold tracking-tight">Add New Item</h2>
//                         <p className="text-orange-50 mt-1 text-sm font-medium opacity-90">Craft your culinary masterpiece</p>
//                     </div>
//                     <div className="hidden md:flex bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-inner">
//                         <Tag className="w-7 h-7 text-white" />
//                     </div>
//                 </div>

//                 <form onSubmit={handleAddItem} className="p-8 md:p-10">
//                     <div className="flex flex-col md:flex-row gap-12">

//                         {/* LEFT COLUMN: Image Upload */}
//                         <div className="w-full md:w-1/3 flex flex-col gap-5">
//                             <label className="block text-sm font-bold text-gray-700">Product Image</label>

//                             {/* Theme Change: Dashed border is orange on hover/active */}
//                             <div className={`relative h-64 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-orange-50/50
//                                 ${imagePreview ? 'border-orange-500 shadow-md shadow-orange-100' : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'}`}>

//                                 {imagePreview ? (
//                                     <>
//                                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
//                                         <button
//                                             type="button"
//                                             onClick={removeImage}
//                                             className="absolute top-2 right-2 bg-white p-2 rounded-full text-red-500 hover:text-red-600 shadow-lg transition transform hover:scale-110"
//                                         >
//                                             <X className="w-4 h-4" />
//                                         </button>
//                                     </>
//                                 ) : (
//                                     <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center group">
//                                         <div className="bg-white p-4 rounded-full mb-3 text-orange-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
//                                             <ImagePlus className="w-8 h-8" />
//                                         </div>
//                                         <span className="text-sm font-bold text-gray-600 group-hover:text-orange-600 transition-colors">Upload Photo</span>
//                                         <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG</span>
//                                         <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                                     </label>
//                                 )}
//                             </div>

//                             {/* Veg / Non-Veg Toggle */}
//                             <div className="mt-2">
//                                 <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Type</label>
//                                 <div className="flex bg-orange-50 p-1.5 rounded-2xl border border-orange-100">
//                                     <button
//                                         type="button"
//                                         onClick={() => setFormData(p => ({ ...p, isVeg: true }))}
//                                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${formData.isVeg
//                                             ? 'bg-white text-green-600 shadow-md shadow-orange-100/50'
//                                             : 'text-gray-400 hover:text-gray-600'
//                                             }`}
//                                     >
//                                         <Leaf className="w-4 h-4 fill-current" /> Veg
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => setFormData(p => ({ ...p, isVeg: false }))}
//                                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!formData.isVeg
//                                             ? 'bg-white text-red-600 shadow-md shadow-orange-100/50'
//                                             : 'text-gray-400 hover:text-gray-600'
//                                             }`}
//                                     >
//                                         <Drumstick className="w-4 h-4 fill-current" /> Non-Veg
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* RIGHT COLUMN: Details */}
//                         <div className="w-full md:w-2/3 flex flex-col gap-6">

//                             {/* Name & Category Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div className="group">
//                                     <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
//                                         <Type className="w-4 h-4 text-orange-500" /> Item Name
//                                     </label>
//                                     <input
//                                         name="name"
//                                         value={formData.name}
//                                         onChange={handleChange}
//                                         placeholder="e.g. Butter Paneer"
//                                         className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-gray-700 placeholder-gray-300 shadow-sm"
//                                     />
//                                 </div>

//                                 <div className="group">
//                                     <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
//                                         <Tag className="w-4 h-4 text-orange-500" /> Category
//                                     </label>
//                                     <input
//                                         name="category"
//                                         value={formData.category}
//                                         onChange={handleChange}
//                                         onBlur={handleCategoryBlur}
//                                         placeholder="e.g. Punjabi"
//                                         className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-gray-700 placeholder-gray-300 shadow-sm"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Description */}
//                             <div>
//                                 <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
//                                     <FileText className="w-4 h-4 text-orange-500" /> Short Description
//                                 </label>
//                                 <textarea
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleChange}
//                                     rows="3"
//                                     placeholder="Describe the flavors..."
//                                     className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all resize-none text-gray-700 placeholder-gray-300 shadow-sm"
//                                 ></textarea>
//                             </div>

//                             {/* Pricing Row */}
//                             <div className="grid grid-cols-2 gap-6 bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100">
//                                 <div>
//                                     <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
//                                         Original Price
//                                     </label>
//                                     <div className="relative group">
//                                         <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-orange-500 transition-colors">₹</span>
//                                         <input
//                                             type="number"
//                                             name="originalPrice"
//                                             value={formData.originalPrice}
//                                             onChange={handleChange}
//                                             placeholder="00"
//                                             className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-transparent bg-white focus:border-orange-300 focus:ring-0 outline-none font-bold text-gray-700 transition-all shadow-sm"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">
//                                         Discount Price
//                                     </label>
//                                     <div className="relative group">
//                                         <span className="absolute left-4 top-3.5 text-orange-500 font-bold">₹</span>
//                                         <input
//                                             type="number"
//                                             name="discountPrice"
//                                             value={formData.discountPrice}
//                                             onChange={handleChange}
//                                             placeholder="00"
//                                             className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-orange-100 bg-white focus:border-orange-400 focus:ring-0 outline-none font-bold text-orange-600 transition-all shadow-sm"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             {/* Theme Change: Gradient Orange Button */}
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
//                             >
//                                 {loading ? (
//                                     <>
//                                         <Loader2 className="animate-spin w-5 h-5" /> Publishing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Upload className="w-5 h-5" /> Publish to Menu
//                                     </>
//                                 )}
//                             </button>

//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default RestaurantMenu;

import { useState, useEffect } from "react";
import {
    Upload,
    IndianRupee,
    Leaf,
    Drumstick,
    Tag,
    Type,
    FileText,
    Loader2,
    ImagePlus,
    X,
    Sparkles
} from "lucide-react";
import api from "../../services/api";

const RestaurantMenu = () => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        originalPrice: "",
        discountPrice: "",
        isVeg: true,
        category: "",
        imageFile: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageFile: null }));
        setImagePreview(null);
    };

    const handleCategoryBlur = () => {
        if (!formData.category) return;
        let formatted = formData.category
            .toLowerCase()
            .trim()
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        setFormData(prev => ({ ...prev, category: formatted }));
    };

    // --- FIXED HANDLER ---
    const handleAddItem = async (e) => {
        e.preventDefault();
        setLoading(true);

        const rawRestaurantId = sessionStorage.getItem("restaurant_id");

        if (!rawRestaurantId) {
            alert("Session Error: Please Log In again.");
            setLoading(false);
            return;
        }

        if (!formData.name || !formData.originalPrice || !formData.category) {
            alert("Please fill in the required fields (Name, Price, Category).");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();

            // 1. Text Fields
            data.append("name", formData.name);
            data.append("description", formData.description || "");
            data.append("category", formData.category);
            data.append("restaurant_id", rawRestaurantId);

            // 2. Boolean (Convert to string for FormData)
            data.append("is_veg", formData.isVeg);

            // 3. Numbers (CRITICAL FIX: Ensure they aren't empty strings)
            // If originalPrice is text, convert to float.
            data.append("price", parseFloat(formData.originalPrice));

            // If discountPrice is empty, send '0' or don't send it at all. 
            // Sending "" causes the 500 error on backend.
            if (formData.discountPrice) {
                data.append("discount_price", parseFloat(formData.discountPrice));
            }

            // 4. File
            if (formData.imageFile) {
                data.append("image", formData.imageFile);
            }

            // 5. Send Request (No manual Content-Type header needed)
            await api.post("/api/menu/add", data);

            alert("Item added successfully!");

            // Reset Form
            setFormData({
                name: "", description: "", originalPrice: "", discountPrice: "",
                isVeg: true, category: "", imageFile: null
            });
            setImagePreview(null);

        } catch (error) {
            console.error("Full Error:", error);
            // Check if it's a backend response error
            if (error.response && error.response.data) {
                const msg = error.response.data.detail || JSON.stringify(error.response.data);
                alert(`Server Error: ${msg}`);
            } else {
                alert("Failed to connect to server. Check console for details.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/60 p-6 md:p-12 flex justify-center font-sans">
            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl shadow-orange-100 overflow-hidden border border-white">

                <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-yellow-200" />
                            <span className="text-orange-100 font-semibold tracking-wide text-xs uppercase">Menu Creator</span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Add New Item</h2>
                        <p className="text-orange-50 mt-1 text-sm font-medium opacity-90">Craft your culinary masterpiece</p>
                    </div>
                    <div className="hidden md:flex bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-inner">
                        <Tag className="w-7 h-7 text-white" />
                    </div>
                </div>

                <form onSubmit={handleAddItem} className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-12">

                        {/* LEFT COLUMN: Image Upload */}
                        <div className="w-full md:w-1/3 flex flex-col gap-5">
                            <label className="block text-sm font-bold text-gray-700">Product Image</label>

                            <div className={`relative h-64 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-orange-50/50
                                ${imagePreview ? 'border-orange-500 shadow-md shadow-orange-100' : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'}`}>

                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-white p-2 rounded-full text-red-500 hover:text-red-600 shadow-lg transition transform hover:scale-110"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center group">
                                        <div className="bg-white p-4 rounded-full mb-3 text-orange-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <ImagePlus className="w-8 h-8" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-orange-600 transition-colors">Upload Photo</span>
                                        <span className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* Veg / Non-Veg Toggle */}
                            <div className="mt-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Type</label>
                                <div className="flex bg-orange-50 p-1.5 rounded-2xl border border-orange-100">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isVeg: true }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${formData.isVeg
                                            ? 'bg-white text-green-600 shadow-md shadow-orange-100/50'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Leaf className="w-4 h-4 fill-current" /> Veg
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isVeg: false }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!formData.isVeg
                                            ? 'bg-white text-red-600 shadow-md shadow-orange-100/50'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Drumstick className="w-4 h-4 fill-current" /> Non-Veg
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Details */}
                        <div className="w-full md:w-2/3 flex flex-col gap-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Type className="w-4 h-4 text-orange-500" /> Item Name
                                    </label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Butter Paneer"
                                        className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-gray-700 placeholder-gray-300 shadow-sm"
                                    />
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Tag className="w-4 h-4 text-orange-500" /> Category
                                    </label>
                                    <input
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        onBlur={handleCategoryBlur}
                                        placeholder="e.g. Punjabi"
                                        className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-gray-700 placeholder-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-orange-500" /> Short Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe the flavors..."
                                    className="w-full bg-white border border-gray-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all resize-none text-gray-700 placeholder-gray-300 shadow-sm"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                        Original Price
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold group-focus-within:text-orange-500 transition-colors">₹</span>
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            placeholder="00"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-transparent bg-white focus:border-orange-300 focus:ring-0 outline-none font-bold text-gray-700 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">
                                        Discount Price
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-3.5 text-orange-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            name="discountPrice"
                                            value={formData.discountPrice}
                                            onChange={handleChange}
                                            placeholder="00"
                                            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-orange-100 bg-white focus:border-orange-400 focus:ring-0 outline-none font-bold text-orange-600 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" /> Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" /> Publish to Menu
                                    </>
                                )}
                            </button>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantMenu;