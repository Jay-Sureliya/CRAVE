import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Banknote, X, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const CheckoutModal = ({ isOpen, onClose, total, address, onSuccess, userEmail, userName, userPhone }) => {
    const [method, setMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    // Load Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOrder = async () => {
        if (!address) {
            alert("Please select a delivery address first!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            // 1. Initialize Order (Status: payment_pending)
            const { data } = await api.post("/api/orders/place",
                {
                    address: address, // <--- Sent ONCE here.
                    payment_method: method
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Handle Razorpay
            if (method === 'RAZORPAY') {
                const res = await loadRazorpay();
                if (!res) {
                    alert('Razorpay SDK failed to load.');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: data.razorpay_key_id,
                    amount: data.razorpay_amount,
                    currency: data.currency,
                    name: "Crave Food Delivery",
                    description: "Order Payment",
                    order_id: data.razorpay_order_id,
                    handler: async function (response) {
                        try {
                            // 3. Verify & Activate Order
                            await api.post("/api/payments/verify", {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            }, { headers: { Authorization: `Bearer ${token}` } });

                            // 4. DONE! Just close and show success.
                            onSuccess();
                            onClose();
                        } catch (err) {
                            alert("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: userName || "",
                        email: userEmail || "",
                        contact: userPhone || ""
                    },
                    theme: { color: "#F97316" },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                            // Optional: You could call an API to cancel the 'payment_pending' order here
                            console.log("Payment cancelled by user");
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } else {
                // COD Flow
                onSuccess();
                onClose();
            }

        } catch (err) {
            console.error(err);
            alert("Failed to initiate order.");
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-[80]" onClick={onClose} />
                    <motion.div
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[90] p-6 md:max-w-md md:mx-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-stone-800">Payment Method</h2>
                            <button onClick={onClose} className="p-2 bg-stone-100 rounded-full"><X size={20} /></button>
                        </div>

                        {/* Display Address Confirmation */}
                        <div className="mb-6 bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <p className="text-xs text-stone-400 font-bold uppercase mb-1">Delivering To</p>
                            <p className="text-sm font-medium text-stone-700 line-clamp-2">{address}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div onClick={() => setMethod('COD')} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${method === 'COD' ? 'border-orange-500 bg-orange-50' : 'border-stone-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2.5 rounded-full text-green-600"><Banknote size={20} /></div>
                                    <span className="font-bold text-stone-700">Cash on Delivery</span>
                                </div>
                                {method === 'COD' && <CheckCircle className="text-orange-500" size={22} />}
                            </div>

                            <div onClick={() => setMethod('RAZORPAY')} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${method === 'RAZORPAY' ? 'border-orange-500 bg-orange-50' : 'border-stone-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-full text-blue-600"><CreditCard size={20} /></div>
                                    <span className="font-bold text-stone-700">Pay Online</span>
                                </div>
                                {method === 'RAZORPAY' && <CheckCircle className="text-orange-500" size={22} />}
                            </div>
                        </div>

                        <button onClick={handleOrder} disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin" /> : `Pay ₹${total}`}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;