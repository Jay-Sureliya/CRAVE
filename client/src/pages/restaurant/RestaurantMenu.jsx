import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Image as ImageIcon, Leaf, Drumstick, Edit, Trash2, UploadCloud, Eye, EyeOff, Loader2, ListPlus } from "lucide-react";

// --- HELPER: Lazy Load Images ---
const getImageUrl = (item) => {
    if (!item) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (typeof item === 'string' && item.startsWith('blob:')) return item;
    if (item.image && (item.image.startsWith("data:") || item.image.startsWith("http"))) return item.image;
    return `http://localhost:8000/api/menu/image/${item.id}`;
};

// --- MASSIVE PRESET CATEGORY SUGGESTIONS ---
const DEFAULT_CATEGORIES = [
    // General Courses
    "Starters", "Appetizers", "Main Course", "Side Dishes", "Desserts", "Beverages",
    // Meal Types
    "Breakfast", "Brunch", "Lunch", "Dinner", "Snacks", "Late Night Cravings",
    // Indian
    "North Indian", "South Indian", "Biryani", "Thalis", "Mughlai", "Tandoori",
    "Kebabs", "Chaat", "Street Food", "Gujarati", "Punjabi", "Bengali", "Maharashtrian",
    // Global Cuisines
    "Chinese", "Mexican", "Thai", "Japanese", "Lebanese", "Continental",
    "American", "Asian", "Mediterranean",
    // Fast Food & Cafe
    "Pizzas", "Burgers", "Sandwiches", "Wraps & Rolls", "Pasta", "Noodles",
    "Momos & Dim Sum", "Fries & Sides", "Coffee", "Tea", "Mocktails", "Shakes & Juices",
    // Dietary & Specifics
    "Healthy Food", "Vegan", "Salads", "Soups", "Seafood", "Sizzlers", "Barbecue",
    // Sweets & Bakery
    "Sweets", "Ice Cream", "Bakery", "Cakes & Pastries", "Waffles", "Pancakes",
    // Combos
    "Combos", "Value Meals", "Family Packs", "Kids Menu"
];

const RestaurantMenu = ({ searchQuery }) => {
    const [showModal, setShowModal] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [dbCategories, setDbCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    const initialFormState = { name: "", category: "", description: "", price: "", discountPrice: "", type: "veg", isAvailable: true, image: null, addons: [] };
    const [newItem, setNewItem] = useState(initialFormState);
    const [previewImage, setPreviewImage] = useState(null);
    const [tempAddon, setTempAddon] = useState({ name: "", price: "" });

    const getAuthData = () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const resId = sessionStorage.getItem("restaurant_id") || localStorage.getItem("restaurant_id");
        return { headers: token ? { "Authorization": `Bearer ${token}` } : {}, restaurantId: resId };
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const { headers } = getAuthData();

            try {
                const catRes = await fetch("http://localhost:8000/api/categories", { headers });
                if (catRes.ok) {
                    const fetchedCats = await catRes.json();
                    setDbCategories(fetchedCats);
                }
            } catch (e) { console.error("Could not fetch DB categories", e); }

            const menuRes = await fetch("http://localhost:8000/api/menu", { headers });
            if (menuRes.ok) setMenuItems(await menuRes.json());
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // --- CLICK OUTSIDE HANDLER ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddNew = () => { setNewItem(initialFormState); setPreviewImage(null); setIsEditing(false); setEditId(null); setShowModal(true); setTempAddon({ name: "", price: "" }); };

    const handleEdit = (item) => {
        let parsedAddons = [];
        if (item.addons) { try { parsedAddons = typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons; } catch { parsedAddons = []; } }
        setNewItem({
            name: item.name, category: item.category, description: item.description || "", price: item.price,
            discountPrice: item.discountPrice !== undefined ? item.discountPrice : (item.discount_price || ""),
            type: item.is_veg ? "veg" : "non-veg", isAvailable: item.isAvailable, image: null, addons: Array.isArray(parsedAddons) ? parsedAddons : []
        });
        setPreviewImage(getImageUrl(item)); setIsEditing(true); setEditId(item.id); setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem({ ...newItem, [name]: value });

        if (name === "category") {
            setShowSuggestions(true);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setNewItem({ ...newItem, image: file }); setPreviewImage(URL.createObjectURL(file)); }
    };

    const addAddon = () => {
        if (!tempAddon.name || !tempAddon.price) return;
        setNewItem({ ...newItem, addons: [...newItem.addons, { id: Date.now(), name: tempAddon.name, price: parseFloat(tempAddon.price) }] });
        setTempAddon({ name: "", price: "" });
    };

    const removeAddon = (id) => { setNewItem({ ...newItem, addons: newItem.addons.filter(a => a.id !== id) }); };

    const selectCategory = (cat) => {
        setNewItem({ ...newItem, category: cat });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { headers, restaurantId } = getAuthData();
        const formData = new FormData();
        Object.keys(newItem).forEach(key => {
            if (key === 'addons') formData.append(key, JSON.stringify(newItem[key]));
            else if (key === 'image') { if (newItem.image) formData.append(key, newItem.image); }
            else if (key === 'isAvailable') formData.append(key, newItem.isAvailable.toString());
            else if (newItem[key] !== null && newItem[key] !== "") formData.append(key, newItem[key]);
        });
        if (restaurantId) formData.append("restaurant_id", restaurantId);

        try {
            const url = isEditing ? `http://localhost:8000/api/menu/${editId}` : "http://localhost:8000/api/menu";
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(url, { method, headers, body: formData });
            if (response.ok) { setShowModal(false); fetchData(); } else { alert("Failed"); }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        const { headers } = getAuthData();
        const response = await fetch(`http://localhost:8000/api/menu/${id}`, { method: "DELETE", headers });
        if (response.ok) setMenuItems(prev => prev.filter(item => item.id !== id));
    };

    const toggleStatus = async (item) => {
        const updatedStatus = !item.isAvailable;
        setMenuItems(menuItems.map(i => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i));
        const { headers } = getAuthData();
        const formData = new FormData(); formData.append("isAvailable", updatedStatus.toString());
        await fetch(`http://localhost:8000/api/menu/${item.id}`, { method: "PUT", headers, body: formData });
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
        item.category.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    // Combine DB categories and default categories, then remove duplicates
    const allPossibleCategories = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])];

    // Filter suggestions based on what the user has typed
    const categorySuggestions = allPossibleCategories.filter(c =>
        c.toLowerCase().includes((newItem.category || "").toLowerCase())
    );

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{filteredItems.length} Dishes Found</p>
                <button onClick={handleAddNew} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg">
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className={`bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all flex flex-col ${!item.isAvailable ? 'opacity-70 grayscale' : ''}`}>
                        <div className="h-44 w-full bg-gray-100 rounded-xl relative overflow-hidden mb-4">
                            <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase shadow-sm ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}>{item.is_veg ? 'VEG' : 'NON'}</span>
                            </div>
                        </div>

                        <div className="flex-1 px-1">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-wide">{item.category}</span>
                                <span className="font-black text-lg text-gray-900">₹{item.price}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{item.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">{item.description}</p>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 mt-auto">
                            <button onClick={() => toggleStatus(item)} className={`col-span-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${item.isAvailable ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                                {item.isAvailable ? <><Eye size={14} /> Live</> : <><EyeOff size={14} /> Offline</>}
                            </button>
                            <button onClick={() => handleEdit(item)} className="col-span-1 p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 flex items-center justify-center"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="col-span-1 p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex items-center justify-center"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
                        <div className="bg-white px-8 py-6 border-b border-gray-100 sticky top-0 z-10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Menu Item" : "Create New Item"}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Image Section */}
                            <div className="md:col-span-5 space-y-4">
                                <label className="border-2 border-dashed border-gray-200 rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50 overflow-hidden relative">
                                    {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><UploadCloud size={32} className="mx-auto mb-2 text-orange-400" />Upload Photo</div>}
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setNewItem({ ...newItem, isAvailable: !newItem.isAvailable })} className={`py-3 rounded-xl text-xs font-bold transition-all ${newItem.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {newItem.isAvailable ? 'Status: Live' : 'Status: Hidden'}
                                    </button>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: newItem.type === 'veg' ? 'non-veg' : 'veg' })} className={`py-3 rounded-xl text-xs font-bold transition-all ${newItem.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {newItem.type === 'veg' ? 'Veg' : 'Non-Veg'}
                                    </button>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="md:col-span-7 space-y-4">
                                <input name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item Name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-gray-800" />

                                {/* CATEGORY DROPDOWN WRAPPER */}
                                <div className="relative" ref={dropdownRef}>
                                    <input
                                        name="category"
                                        value={newItem.category}
                                        onChange={handleInputChange}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="Category (e.g. Starters, Main Course)"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm font-bold text-gray-800"
                                    />

                                    {/* DROPDOWN MENU */}
                                    {showSuggestions && categorySuggestions.length > 0 && (
                                        <div className="absolute w-full bg-white border border-gray-100 rounded-xl shadow-2xl mt-2 z-50 max-h-48 overflow-y-auto">
                                            {categorySuggestions.map((c, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => selectCategory(c)}
                                                    className="px-5 py-3 hover:bg-orange-50 cursor-pointer text-sm font-bold text-gray-700 border-b border-gray-50 last:border-b-0 transition-colors"
                                                >
                                                    {c}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <textarea name="description" value={newItem.description} onChange={handleInputChange} placeholder="Description" rows="3" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-sm font-medium text-gray-600 resize-none"></textarea>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price (₹)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold" />
                                    <input type="number" name="discountPrice" value={newItem.discountPrice} onChange={handleInputChange} placeholder="Discount (Optional)" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold" />
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ListPlus size={14} /> Add-ons</h4>
                                    <div className="flex gap-2 mb-3">
                                        <input type="text" placeholder="Name" value={tempAddon.name} onChange={(e) => setTempAddon({ ...tempAddon, name: e.target.value })} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500" />
                                        <input type="number" placeholder="₹" value={tempAddon.price} onChange={(e) => setTempAddon({ ...tempAddon, price: e.target.value })} className="w-24 p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500" />
                                        <button type="button" onClick={addAddon} className="p-3 bg-black text-white rounded-xl hover:bg-gray-800"><Plus size={20} /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {newItem.addons.map(addon => (
                                            <div key={addon.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <span className="font-bold text-gray-700 text-sm">{addon.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-green-600 text-sm">+₹{addon.price}</span>
                                                    <button type="button" onClick={() => removeAddon(addon.id)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleSubmit} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
                                    {isEditing ? "Update Item" : "Save Item"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantMenu;