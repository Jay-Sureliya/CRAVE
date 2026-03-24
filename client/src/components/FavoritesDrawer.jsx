import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FavoritesDrawer = ({ isOpen, onClose, favItems = [], onRemove }) => {
    const navigate = useNavigate();

    const handleViewItem = (id) => {
        navigate(`/menu-item/${id}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Favorites Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#F9F9F9] z-[110] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* --- FROSTED HEADER --- */}
                        <div className="bg-white/80 backdrop-blur-md px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                    Saved for Later
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {favItems.length} {favItems.length === 1 ? 'dish' : 'dishes'} you loved
                                </p>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors border border-zinc-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- SCROLLABLE CONTENT --- */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">
                            {favItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-300">
                                        <Heart size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-zinc-800">Your heart is empty</h3>
                                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                                        Tap the heart on any dish to save it here for later.
                                    </p>
                                    <button 
                                        onClick={onClose}
                                        className="mt-8 px-8 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all active:scale-95 shadow-lg"
                                    >
                                        Explore Menu
                                    </button>
                                </div>
                            ) : (
                                favItems.map((item, index) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={item.id} 
                                        className="bg-white p-4 rounded-[2rem] border border-zinc-100 shadow-sm flex gap-4 group hover:shadow-md transition-all duration-300"
                                    >
                                        {/* Image Container */}
                                        <div 
                                            onClick={() => handleViewItem(item.id)}
                                            className="w-24 h-24 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 cursor-pointer relative"
                                        >
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        
                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div 
                                                    onClick={() => handleViewItem(item.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <h4 className="font-black text-zinc-900 leading-tight text-sm group-hover:text-red-500 transition-colors">
                                                        {item.name}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter line-clamp-1">
                                                        {item.description || 'No description available'}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => onRemove(item.id)} 
                                                    className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                                                    title="Remove from favorites"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-black text-zinc-900 text-base tracking-tighter">
                                                    ₹{item.price}
                                                </span>
                                                <button 
                                                    onClick={() => handleViewItem(item.id)}
                                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors"
                                                >
                                                    Order <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* --- FOOTER ACTION (Only if items exist) --- */}
                        {favItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[1.2rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    <ShoppingBag size={18} className="text-red-400" />
                                    <span className="text-xs uppercase tracking-widest">Continue Shopping</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FavoritesDrawer;