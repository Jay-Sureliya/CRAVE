import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MapPin, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = ({ isOpen, onClose, cartItems = [], onUpdate }) => {

  // --- 1. CALCULATE ITEM TOTAL (Using Discount Price) ---
  const itemTotal = cartItems.reduce((acc, item) => {
    const finalPrice = item.discount_price || item.discountPrice || item.price;
    return acc + (finalPrice * item.quantity);
  }, 0);

  // --- 2. CALCULATE FEES (Updated Logic) ---
  const deliveryFee = 0; // Always Free
  const platformFee = 0; // Removed
  const tax = Math.round(itemTotal * 0.05); // 5% Tax on Subtotal

  // --- 3. FINAL GRAND TOTAL ---
  const grandTotal = itemTotal + deliveryFee + tax + platformFee;

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

          {/* Side Drawer */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-white z-[70] shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-stone-100 bg-white">
              <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
                Your Cart <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{cartItems.length} Items</span>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} className="text-stone-500" />
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FDFBF7]">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag size={48} className="mb-4 text-stone-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const price = item.discount_price || item.discountPrice || item.price;
                    const hasDiscount = price < item.price;

                    return (
                      <div key={item.id || item.cart_id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-4">
                        <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"} alt={item.name} className="w-full h-full object-cover" />
                          {hasDiscount && <div className="absolute top-0 left-0 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg">%</div>}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-stone-800 line-clamp-1">{item.name}</h4>
                            <button onClick={() => onUpdate(item.id, -1000)} className="text-stone-300 hover:text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              {hasDiscount && <span className="text-[10px] line-through text-stone-400">₹{item.price * item.quantity}</span>}
                              <span className="font-bold text-stone-700">₹{price * item.quantity}</span>
                            </div>
                            <div className="flex items-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                              <button onClick={() => onUpdate(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-stone-600 hover:text-orange-500"><Minus size={12} /></button>
                              <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => onUpdate(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded text-stone-600 hover:text-orange-500"><Plus size={12} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bill Details */}
              {cartItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <h3 className="font-black text-sm uppercase tracking-wider text-stone-400 mb-4">Bill Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600"><span>Item Total</span><span>₹{itemTotal}</span></div>

                    {/* Delivery Fee Row */}
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee</span>
                      <span className="text-green-600 font-bold">FREE</span>
                    </div>

                    <div className="flex justify-between text-stone-600"><span>Taxes (5%)</span><span>₹{tax}</span></div>

                    {/* Platform Fee Row Removed (since it is 0) */}

                    <div className="border-t border-dashed border-stone-200 my-2 pt-2 flex justify-between font-black text-lg text-stone-800">
                      <span>To Pay</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-white border-t border-stone-100 shadow-negative-lg">
                <button onClick={() => alert("Proceeding to Payment...")} className="w-full bg-[#1a1a1a] text-white h-14 rounded-xl font-bold flex items-center justify-between px-6 hover:bg-orange-600 transition-all duration-300 shadow-lg group">
                  <span className="flex flex-col items-start leading-none"><span className="text-xs font-normal text-white/60">Total</span><span>₹{grandTotal}</span></span>
                  <span className="flex items-center gap-2">Proceed to Pay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;