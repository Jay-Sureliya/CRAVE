import React from 'react';
import { X, Trash2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FavoritesDrawer = ({ isOpen, onClose, favItems = [], onRemove }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white z-[70] shadow-2xl flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="p-5 flex items-center justify-between border-b border-stone-100 bg-white">
                            <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
                                <Heart className="fill-red-500 text-red-500" /> Favorites
                                <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-full">{favItems.length}</span>
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                                <X size={24} className="text-stone-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFBF7]">
                            {favItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <Heart size={48} className="mb-4 text-stone-300" />
                                    <p className="font-bold text-stone-400">No favorites yet</p>
                                </div>
                            ) : (
                                favItems.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-4">
                                        <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-stone-800 line-clamp-1">{item.name}</h4>
                                                <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <span className="font-bold text-stone-700">₹{item.price}</span>
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FavoritesDrawer;