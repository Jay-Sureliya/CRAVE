import React, { useState, useEffect, useRef } from "react";
import {
    Plus, X, Image as ImageIcon, Leaf, Drumstick, Edit, Trash2,
    Tag, UploadCloud, Eye, EyeOff, Check, Save, Loader2, Search
} from "lucide-react";

// --- HELPER: Lazy Load Images ---
const getImageUrl = (item) => {
    if (!item) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (typeof item === 'string' && item.startsWith('blob:')) return item;
    if (item.image && (item.image.startsWith("data:") || item.image.startsWith("http"))) {
        return item.image;
    }
    return `http://localhost:8000/api/menu/image/${item.id}`;
};

const RestaurantMenu = () => {
    const [showModal, setShowModal] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [dbCategories, setDbCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    const initialFormState = {
        name: "",
        category: "",
        description: "",
        price: "",
        discountPrice: "",
        type: "veg",
        isAvailable: true,
        image: null
    };
    const [newItem, setNewItem] = useState(initialFormState);
    const [previewImage, setPreviewImage] = useState(null);

    const getAuthData = () => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const resId = sessionStorage.getItem("restaurant_id") || localStorage.getItem("restaurant_id");
        return {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            restaurantId: resId
        };
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const { headers } = getAuthData();

            const catRes = await fetch("http://localhost:8000/api/categories", { headers });
            const catData = await catRes.json();
            setDbCategories(Array.isArray(catData) ? catData : []);

            const menuRes = await fetch("http://localhost:8000/api/menu", { headers });
            const menuData = await menuRes.json();
            setMenuItems(Array.isArray(menuData) ? menuData : []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddNew = () => {
        setNewItem(initialFormState);
        setPreviewImage(null);
        setIsEditing(false);
        setEditId(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setNewItem({
            name: item.name,
            category: item.category,
            description: item.description || "",
            price: item.price,
            discountPrice: item.discountPrice !== undefined ? item.discountPrice : (item.discount_price || ""),

            // --- FIX 1: Map boolean 'is_veg' to string 'veg'/'non-veg' for the form ---
            type: item.is_veg ? "veg" : "non-veg",

            isAvailable: item.isAvailable,
            image: null
        });

        setPreviewImage(getImageUrl(item));
        setIsEditing(true);
        setEditId(item.id);
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem({ ...newItem, [name]: value });
        if (name === "category") setShowSuggestions(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewItem({ ...newItem, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const selectCategory = (cat) => {
        setNewItem({ ...newItem, category: cat });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { headers, restaurantId } = getAuthData();

        const formData = new FormData();
        formData.append("name", newItem.name);
        formData.append("category", newItem.category);
        formData.append("description", newItem.description);
        formData.append("price", newItem.price);

        if (newItem.discountPrice !== "" && newItem.discountPrice !== null) {
            formData.append("discountPrice", newItem.discountPrice);
        }

        formData.append("type", newItem.type);
        formData.append("isAvailable", newItem.isAvailable.toString());

        if (restaurantId) {
            formData.append("restaurant_id", restaurantId);
        }

        if (newItem.image) {
            formData.append("image", newItem.image);
        }

        try {
            const url = isEditing
                ? `http://localhost:8000/api/menu/${editId}`
                : "http://localhost:8000/api/menu";

            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: formData
            });

            if (response.ok) {
                setShowModal(false);
                fetchData();
            } else {
                const err = await response.json();
                alert("Failed: " + (err.detail || "Check console"));
                console.error(err);
            }
        } catch (error) {
            console.error("Connection Error:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            const { headers } = getAuthData();
            await fetch(`http://localhost:8000/api/menu/${id}`, {
                method: "DELETE",
                headers: headers
            });
            setMenuItems(menuItems.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const toggleStatus = async (item) => {
        const updatedStatus = !item.isAvailable;
        setMenuItems(menuItems.map(i => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i));

        try {
            const { headers } = getAuthData();
            const formData = new FormData();
            formData.append("isAvailable", updatedStatus.toString());

            await fetch(`http://localhost:8000/api/menu/${item.id}`, {
                method: "PUT",
                headers: headers,
                body: formData
            });
        } catch (error) {
            console.error("Error updating status:", error);
            fetchData();
        }
    };

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Menu Items</h2>
                    <p className="text-slate-500 font-medium">Manage your dishes</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm" />
                    </div>
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-xl">
                        <Plus size={18} /> Add Item
                    </button>
                </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className={`group bg-white rounded-[2rem] p-4 border transition-all hover:shadow-xl ${!item.isAvailable ? 'opacity-75 bg-slate-50' : 'border-white'}`}>
                        <div className="h-48 bg-slate-100 rounded-[1.5rem] relative overflow-hidden mb-5">
                            {/* FAST IMAGE LOADING */}
                            <img
                                src={getImageUrl(item)}
                                alt={item.name}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                                className="w-full h-full object-cover transition-opacity duration-300"
                            />
                            <div className="absolute inset-0 hidden items-center justify-center text-slate-300 bg-slate-100">
                                <ImageIcon size={40} />
                            </div>

                            <div className="absolute top-4 left-4 flex gap-2">
                                {/* --- FIX 2: Use item.is_veg (boolean) instead of item.type (string) --- */}
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black backdrop-blur-md shadow-sm flex items-center gap-1.5 ${item.is_veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {item.is_veg ? <Leaf size={10} fill="currentColor" /> : <Drumstick size={10} fill="currentColor" />}
                                    {item.is_veg ? 'VEG' : 'NON'}
                                </span>
                            </div>
                            {!item.isAvailable && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                    <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"><EyeOff size={14} /> Offline</span>
                                </div>
                            )}
                        </div>
                        <div className="px-2 mb-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded-md">{item.category}</span>
                                <div className="text-right">
                                    <span className="block text-lg font-black text-slate-800">₹{item.price}</span>
                                    {(item.discountPrice || item.discount_price) && <span className="block text-xs font-bold text-slate-400 line-through">₹{item.discountPrice || item.discount_price}</span>}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{item.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            <button onClick={() => toggleStatus(item)} className="col-span-2 h-10 rounded-xl flex items-center justify-center gap-2 font-bold text-xs bg-slate-100 text-slate-500 hover:bg-slate-200">
                                {item.isAvailable ? <><Eye size={16} /> Live</> : <><EyeOff size={16} /> Offline</>}
                            </button>
                            <button onClick={() => handleEdit(item)} className="col-span-2 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 flex items-center justify-center gap-2"><Edit size={16} /> Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="col-span-1 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center text-white">
                            <h3 className="text-2xl font-bold">{isEditing ? "Edit Item" : "Add New Item"}</h3>
                            <button onClick={() => setShowModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
                            <div className="md:col-span-5 space-y-6">
                                <label className="border-2 border-dashed rounded-3xl h-60 flex flex-col items-center justify-center cursor-pointer relative bg-slate-50 hover:bg-slate-100 overflow-hidden">
                                    {previewImage ?
                                        <img src={previewImage} className="w-full h-full object-cover" alt="Preview" /> :
                                        <div className="flex flex-col items-center"><UploadCloud className="text-orange-500 mb-2" size={32} /><span className="text-sm font-bold text-slate-500">Upload Image</span></div>
                                    }
                                    <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setNewItem({ ...newItem, isAvailable: true })} className={`flex-1 py-3 rounded-xl text-xs font-bold ${newItem.isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>Live</button>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, isAvailable: false })} className={`flex-1 py-3 rounded-xl text-xs font-bold ${!newItem.isAvailable ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-400'}`}>Offline</button>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'veg' })} className={`flex-1 py-3 rounded-xl text-xs font-bold ${newItem.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>Veg</button>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'non-veg' })} className={`flex-1 py-3 rounded-xl text-xs font-bold ${newItem.type === 'non-veg' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-400'}`}>Non-Veg</button>
                                </div>
                            </div>
                            <div className="md:col-span-7 space-y-5">
                                <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item Name" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20" />

                                <div className="relative" ref={dropdownRef}>
                                    <input type="text" name="category" value={newItem.category} onChange={handleInputChange} placeholder="Category" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20" />
                                    {showSuggestions && newItem.category && (
                                        <div className="absolute w-full bg-white border border-slate-100 rounded-xl shadow-xl mt-2 z-10 max-h-40 overflow-y-auto">
                                            {dbCategories.filter(c => c.toLowerCase().includes(newItem.category.toLowerCase())).map((c, i) => (
                                                <div key={i} onClick={() => selectCategory(c)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm font-bold text-slate-600">{c}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <textarea name="description" value={newItem.description} onChange={handleInputChange} placeholder="Description" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-medium text-slate-600 h-32 resize-none outline-none focus:ring-2 focus:ring-orange-500/20"></textarea>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none" />
                                    <input type="number" name="discountPrice" value={newItem.discountPrice} onChange={handleInputChange} placeholder="Discount Price" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none" />
                                </div>

                                <button onClick={handleSubmit} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors shadow-xl">
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