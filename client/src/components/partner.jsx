import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Loader2, CheckCircle2, Bike, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Partner = () => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('restaurant'); // 'restaurant' or 'rider'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "", // Acts as "Full Name" for riders
    email: "",
    phone: "",
    address: "",
    vehicleType: "bike" // Specific to rider
  });

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // --- REAL API SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (modalType === 'restaurant') {
        endpoint = '/api/restaurant-request';
        payload = {
          restaurantName: formData.restaurantName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        };
      } else {
        endpoint = '/api/rider-request';
        payload = {
          fullName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          city: formData.address,
          vehicleType: formData.vehicleType
        };
      }

      await api.post(endpoint, payload);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert("Something went wrong. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        restaurantName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        vehicleType: "bike"
      });
    }, 500);
  };

  // Styles for the split-tone UI inputs to keep JSX clean
  const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-wider";
  const inputStyle = "w-full px-0 py-2 bg-transparent border-b-2 border-slate-100 text-slate-900 font-bold placeholder:font-normal placeholder:text-slate-300 focus:border-orange-500 outline-none transition-all";

  return (
    <div className="flex items-center justify-center w-[95%] bg-white m-10 font-sans mx-auto relative">

      {/* =========================================
          POPUP MODAL (Overlay)
         ========================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl pointer-events-auto relative overflow-hidden flex flex-col z-10"
            >

              {/* --- UNIQUE: Dark Header Section --- */}
              <div className="bg-slate-900 p-8 pb-12 relative overflow-hidden">
                {/* Abstract Pattern in Header */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-[50px] opacity-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {modalType === 'restaurant' ? 'Partner Application' : 'Rider Application'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 font-medium">
                    {modalType === 'restaurant' ? 'Join the culinary revolution.' : 'Join our fleet today.'}
                  </p>
                </div>

                {/* Close Button (Light on Dark) */}
                <button
                  onClick={handleClose}
                  type="button" // Good practice to prevent form submission
                  className="absolute top-5 right-5 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5 pointer-events-none" /> {/* preventing icon from interfering with click */}
                </button>
              </div>

              {/* --- UNIQUE: Content Section with Floating Badge --- */}
              <div className="px-8 pb-8 relative flex-1 bg-white">

                {/* Floating Icon Badge (Sits on the seam) */}
                <div className="absolute -top-8 left-8">
                  <div className={`h-16 w-16 rounded-2xl shadow-lg flex items-center justify-center rotate-3 border-4 border-white ${modalType === 'restaurant' ? 'bg-orange-600 shadow-orange-600/30' : 'bg-blue-600 shadow-blue-600/30'}`}>
                    {modalType === 'restaurant' ? (
                      <Store className="w-8 h-8 text-white" />
                    ) : (
                      <Bike className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>

                <div className="mt-12">
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">

                      {/* Row 1: Names */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {modalType === 'restaurant' && (
                          <div className="space-y-1">
                            <label className={labelStyle}>Business Name</label>
                            <input
                              required
                              name="restaurantName"
                              value={formData.restaurantName}
                              onChange={handleChange}
                              type="text"
                              className={inputStyle}
                              placeholder="Tasty Bites"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className={labelStyle}>
                            {modalType === 'restaurant' ? 'Owner Name' : 'Full Name'}
                          </label>
                          <input
                            required
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            type="text"
                            className={inputStyle}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      {/* Row 2: Contact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className={labelStyle}>Contact Email</label>
                          <input
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            className={inputStyle}
                            placeholder="hello@example.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelStyle}>Phone</label>
                          <input
                            required
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            type="tel"
                            className={inputStyle}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      {/* Row 3: Address / City */}
                      <div className="space-y-1">
                        <label className={labelStyle}>
                          {modalType === 'restaurant' ? 'Location' : 'City / Area'}
                        </label>
                        <textarea
                          required
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="1"
                          className={`${inputStyle} resize-none`}
                          placeholder={modalType === 'restaurant' ? "Full Restaurant Address" : "Preferred Delivery Zone"}
                        ></textarea>
                      </div>

                      {/* Row 4: Vehicle Type (Rider Only) */}
                      {modalType === 'rider' && (
                        <div className="space-y-1">
                          <label className={labelStyle}>Vehicle</label>
                          <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className={inputStyle}
                          >
                            <option value="bike">Motorcycle / Scooter</option>
                            <option value="bicycle">Bicycle</option>
                            <option value="car">Car</option>
                          </select>
                        </div>
                      )}

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full group relative overflow-hidden bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                              <>
                                Submit Request <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-10">
                      <div className="inline-block p-4 rounded-full bg-green-50 border border-green-100 mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">We hear you!</h3>
                      <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                        The Crave team has received your application. Credentials will be sent to <span className="text-slate-900 font-bold">{formData.email}</span> shortly.
                      </p>
                      <button
                        onClick={handleClose}
                        className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
                      >
                        Close Window
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          MAIN CARDS CONTAINER (Unchanged)
         ========================================= */}
      <div className="flex flex-col md:flex-row gap-6 w-full">

        {/* CARD 1: Partner with us (Chef/Business) */}
        <div className="relative w-full md:w-1/2 h-[450px] rounded-2xl overflow-hidden shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Chef in kitchen"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03081F] via-[#03081F]/60 to-transparent opacity-90"></div>

          <div className="absolute top-0 left-8 bg-white px-6 py-3 rounded-b-lg shadow-md z-10">
            <span className="text-slate-900 font-bold text-sm">Earn more with lower fees</span>
          </div>

          <div className="absolute bottom-10 left-8 z-20">
            <p className="text-orange-500 font-bold mb-1 text-lg">Signup as a business</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-tight">Partner with us</h2>

            <button
              onClick={() => openModal('restaurant')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-10 rounded-full transition-colors shadow-lg cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* CARD 2: Ride with us (Rider) */}
        <div className="relative w-full md:w-1/2 h-[450px] rounded-2xl overflow-hidden shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Delivery Rider"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#03081F]/80 via-transparent to-transparent"></div>

          <div className="absolute top-0 left-8 bg-white px-6 py-3 rounded-b-lg shadow-md z-10">
            <span className="text-slate-900 font-bold text-sm">Avail exclusive perks</span>
          </div>

          <div className="absolute bottom-10 left-8 z-20">
            <p className="text-orange-500 font-bold mb-1 text-lg">Signup as a rider</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ride with us</h2>

            <button
              onClick={() => openModal('rider')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-10 rounded-full transition-colors shadow-lg cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Partner;