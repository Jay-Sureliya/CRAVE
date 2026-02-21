import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from './CheckoutModal';

const Cart = ({ isOpen, onClose, cartItems = [], onUpdate }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- FETCH SAVED ADDRESS ON OPEN ---
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!isOpen) return;

      // Check both storages, prioritizing sessionStorage
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');

      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.address) {
            setAddress(userData.address);
          }
        }
      } catch (error) {
        console.error("Failed to fetch address", error);
      }
    };

    fetchUserAddress();
  }, [isOpen]);

  // --- CALCULATIONS ---
  const itemTotal = cartItems.reduce((acc, item) => {
    const dPrice = item.discount_price || item.discountPrice;
    const finalPrice = (dPrice > 0 && dPrice < item.price) ? dPrice : item.price;
    return acc + (finalPrice * item.quantity);
  }, 0);

  const tax = Math.round(itemTotal * 0.05);
  const grandTotal = itemTotal + tax;

  // --- SAVE ADDRESS MANUALLY TO DATABASE ---
  const handleUpdateAddress = async () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (!token) {
      alert("Please login to save your address.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter an address first.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('http://localhost:8000/api/update-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: address })
      });

      if (response.ok) {
        alert("Address saved to your profile!");
      } else {
        alert("Failed to save address.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- PROCEED TO PAY (Saves address and opens checkout) ---
  const handleProceedToPay = async () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (!token) {
      alert("Please login to place an order.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/update-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address: address })
      });

      if (response.status === 401) {
        alert("Your session has expired. Please login again.");
        return;
      }

      if (response.ok) {
        setShowCheckout(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Update failed"}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FDFBF7]">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <ShoppingBag size={48} className="mb-4 text-stone-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Address Section */}
                  <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <div className="flex items-center gap-2 text-orange-600 font-bold">
                        <MapPin size={18} />
                        <span>Delivery Address</span>
                      </div>

                      {/* NEW SAVE BUTTON */}
                      <button
                        onClick={handleUpdateAddress}
                        disabled={isUpdating}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        {isUpdating ? "Saving..." : "Save to Profile"}
                      </button>
                    </div>

                    <textarea
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-[90px] transition-all"
                      placeholder="Enter House No, Street, Landmark, Pincode..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Cart Items List */}
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const dPrice = item.discount_price || item.discountPrice;
                      const hasDiscount = dPrice > 0 && dPrice < item.price;
                      const finalDisplayPrice = hasDiscount ? dPrice : item.price;

                      return (
                        <div key={item.id || item.cart_id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-4">
                          <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-stone-800 line-clamp-1">{item.name}</h4>
                              <button onClick={() => onUpdate(item.id, -1000)} className="text-stone-300 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="font-bold text-stone-700">₹{finalDisplayPrice * item.quantity}</span>
                              <div className="flex items-center bg-stone-50 rounded-lg p-1 border border-stone-100">
                                <button onClick={() => onUpdate(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded"><Minus size={12} /></button>
                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => onUpdate(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white shadow-sm rounded"><Plus size={12} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bill Details */}
                  <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                    <h3 className="font-black text-sm uppercase tracking-wider text-stone-400 mb-4">Bill Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-stone-600"><span>Item Total</span><span>₹{itemTotal}</span></div>
                      <div className="flex justify-between text-stone-600"><span>Delivery Fee</span><span className="text-green-600 font-bold">FREE</span></div>
                      <div className="flex justify-between text-stone-600"><span>Taxes (5%)</span><span>₹{tax}</span></div>
                      <div className="border-t border-dashed border-stone-200 my-2 pt-2 flex justify-between font-black text-lg text-stone-800">
                        <span>To Pay</span><span>₹{grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 bg-white border-t border-stone-100">
                <button
                  disabled={isSaving}
                  onClick={handleProceedToPay}
                  className={`w-full ${isSaving ? 'bg-stone-400' : 'bg-[#1a1a1a] hover:bg-orange-600'} text-white h-14 rounded-xl font-bold flex items-center justify-between px-6 transition-all shadow-lg group`}
                >
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xs font-normal text-white/60">Total</span>
                    <span>₹{grandTotal}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {isSaving ? "Saving..." : "Proceed to Pay"}
                    {!isSaving && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
                </button>
              </div>
            )}
          </motion.div>

          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            total={grandTotal}
            address={address}
            onSuccess={() => {
              alert("Order Placed Successfully!");
              onClose();
              window.location.reload();
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;