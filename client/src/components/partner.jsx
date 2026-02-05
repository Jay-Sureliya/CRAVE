// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, Store, Loader2, CheckCircle2, Bike } from 'lucide-react';
// import api from '../services/api';

// const Partner = () => {
//   // --- STATE MANAGEMENT ---
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   // New state to track which form to show: 'restaurant' or 'rider'
//   const [modalType, setModalType] = useState('restaurant');
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);

//   const [formData, setFormData] = useState({
//     restaurantName: "",
//     ownerName: "", // Acts as "Full Name" for riders
//     email: "",
//     phone: "",
//     address: "",
//     vehicleType: "bike" // Specific to rider
//   });

//   // --- HANDLERS ---
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Helper to open specific modal
//   const openModal = (type) => {
//     setModalType(type);
//     setIsModalOpen(true);
//   };

//   // --- REAL API SUBMISSION ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Determine Endpoint and Payload based on Modal Type
//       let endpoint = '';
//       let payload = {};

//       if (modalType === 'restaurant') {
//         endpoint = '/api/restaurant-request';
//         payload = {
//           restaurantName: formData.restaurantName,
//           ownerName: formData.ownerName,
//           email: formData.email,
//           phone: formData.phone,
//           address: formData.address
//         };
//       } else {
//         endpoint = '/api/rider-request'; // Assuming you have this endpoint
//         payload = {
//           fullName: formData.ownerName, // Mapping ownerName to fullName for rider
//           email: formData.email,
//           phone: formData.phone,
//           city: formData.address, // Mapping address to city/area
//           vehicleType: formData.vehicleType
//         };
//       }

//       // Send data to the real backend
//       await api.post(endpoint, payload);
//       setSubmitted(true);
//     } catch (error) {
//       console.error("Error submitting form", error);

//       if (error.response && error.response.data && error.response.data.detail) {
//         alert(`Error: ${error.response.data.detail}`);
//       } else {
//         alert("Something went wrong. Please check your connection.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset form when closing
//   const handleClose = () => {
//     setIsModalOpen(false);
//     setTimeout(() => {
//       setSubmitted(false);
//       setFormData({
//         restaurantName: "",
//         ownerName: "",
//         email: "",
//         phone: "",
//         address: "",
//         vehicleType: "bike"
//       });
//     }, 500);
//   };

//   return (
//     <div className="flex items-center justify-center w-[95%] bg-white m-10 font-sans mx-auto relative">

//       {/* =========================================
//           POPUP MODAL (Overlay)
//          ========================================= */}
//       <AnimatePresence>
//         {isModalOpen && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={handleClose}
//               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
//             />

//             {/* Modal Content */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 20 }}
//               className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
//             >
//               {/* Close Button */}
//               <button
//                 onClick={handleClose}
//                 className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//               >
//                 <X className="w-5 h-5 text-gray-600" />
//               </button>

//               {/* Logic: Show Form or Success Message */}
//               {!submitted ? (
//                 <>
//                   <div className="text-center mb-6">
//                     {/* DYNAMIC ICON */}
//                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalType === 'restaurant' ? 'bg-orange-100' : 'bg-blue-100'}`}>
//                       {modalType === 'restaurant' ? (
//                         <Store className="w-8 h-8 text-orange-600" />
//                       ) : (
//                         <Bike className="w-8 h-8 text-blue-600" />
//                       )}
//                     </div>

//                     {/* DYNAMIC TITLE */}
//                     <h2 className="text-2xl font-bold text-gray-900">
//                       {modalType === 'restaurant' ? 'Partner with CRAVE' : 'Become a Rider'}
//                     </h2>
//                     <p className="text-gray-500 text-sm mt-2">
//                       {modalType === 'restaurant'
//                         ? 'Fill out the details below to list your restaurant.'
//                         : 'Join our fleet and start earning today.'}
//                     </p>
//                   </div>

//                   <form onSubmit={handleSubmit} className="space-y-4">

//                     {/* RESTAURANT NAME (Only for Restaurant) */}
//                     {modalType === 'restaurant' && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
//                         <input required name="restaurantName" value={formData.restaurantName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="Tasty Bites" />
//                       </div>
//                     )}

//                     {/* OWNER NAME / RIDER NAME */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {modalType === 'restaurant' ? 'Owner Name' : 'Full Name'}
//                       </label>
//                       <input required name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="John Doe" />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//                         <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="john@example.com" />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                         <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="+1 234 567 890" />
//                       </div>
//                     </div>

//                     {/* ADDRESS (Context changes based on type) */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {modalType === 'restaurant' ? 'Restaurant Address' : 'City / Area'}
//                       </label>
//                       <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder={modalType === 'restaurant' ? "123 Food Street, City" : "Downtown Area, NY"}></textarea>
//                     </div>

//                     {/* VEHICLE TYPE (Only for Rider) */}
//                     {modalType === 'rider' && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
//                         <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white">
//                           <option value="bike">Motorcycle / Scooter</option>
//                           <option value="bicycle">Bicycle</option>
//                           <option value="car">Car</option>
//                         </select>
//                       </div>
//                     )}

//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
//                     >
//                       {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
//                     </button>
//                   </form>
//                 </>
//               ) : (
//                 <div className="text-center py-10">
//                   <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//                     <CheckCircle2 className="w-10 h-10 text-green-600" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h3>
//                   <p className="text-gray-500">
//                     Thank you for your interest. We have received your details.
//                     Once approved, you will receive your <strong>Login Credentials</strong> via email at <span className="font-semibold text-gray-900">{formData.email}</span>.
//                   </p>
//                   <button onClick={onClose} className="mt-8 px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
//                     Close
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* =========================================
//           MAIN CARDS CONTAINER
//          ========================================= */}
//       <div className="flex flex-col md:flex-row gap-6 w-full">

//         {/* CARD 1: Partner with us (Chef/Business) */}
//         <div className="relative w-full md:w-1/2 h-[450px] rounded-2xl overflow-hidden shadow-lg group">
//           <img
//             src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
//             alt="Chef in kitchen"
//             className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-[#03081F] via-[#03081F]/60 to-transparent opacity-90"></div>

//           <div className="absolute top-0 left-8 bg-white px-6 py-3 rounded-b-lg shadow-md z-10">
//             <span className="text-slate-900 font-bold text-sm">Earn more with lower fees</span>
//           </div>

//           <div className="absolute bottom-10 left-8 z-20">
//             <p className="text-orange-500 font-bold mb-1 text-lg">Signup as a business</p>
//             <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-tight">Partner with us</h2>

//             {/* CLICK EVENT: RESTAURANT FORM */}
//             <button
//               onClick={() => openModal('restaurant')}
//               className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-10 rounded-full transition-colors shadow-lg cursor-pointer"
//             >
//               Get Started
//             </button>
//           </div>
//         </div>

//         {/* CARD 2: Ride with us (Rider) */}
//         <div className="relative w-full md:w-1/2 h-[450px] rounded-2xl overflow-hidden shadow-lg group">
//           <img
//             src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
//             alt="Delivery Rider"
//             className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
//           <div className="absolute inset-0 bg-gradient-to-t from-[#03081F]/80 via-transparent to-transparent"></div>

//           <div className="absolute top-0 left-8 bg-white px-6 py-3 rounded-b-lg shadow-md z-10">
//             <span className="text-slate-900 font-bold text-sm">Avail exclusive perks</span>
//           </div>

//           <div className="absolute bottom-10 left-8 z-20">
//             <p className="text-orange-500 font-bold mb-1 text-lg">Signup as a rider</p>
//             <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ride with us</h2>

//             {/* CLICK EVENT: RIDER FORM */}
//             <button
//               onClick={() => openModal('rider')}
//               className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-10 rounded-full transition-colors shadow-lg cursor-pointer"
//             >
//               Get Started
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Partner;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Loader2, CheckCircle2, Bike } from 'lucide-react';
import api from '../services/api';

const Partner = () => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // New state to track which form to show: 'restaurant' or 'rider'
  const [modalType, setModalType] = useState('restaurant');
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

  // Helper to open specific modal
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // --- REAL API SUBMISSION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine Endpoint and Payload based on Modal Type
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
        endpoint = '/api/rider-request'; // Assuming you have this endpoint
        payload = {
          fullName: formData.ownerName, // Mapping ownerName to fullName for rider
          email: formData.email,
          phone: formData.phone,
          city: formData.address, // Mapping address to city/area
          vehicleType: formData.vehicleType
        };
      }

      // Send data to the real backend
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

  // Reset form when closing
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
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Logic: Show Form or Success Message */}
              {!submitted ? (
                <>
                  <div className="text-center mb-6">
                    {/* DYNAMIC ICON */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalType === 'restaurant' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      {modalType === 'restaurant' ? (
                        <Store className="w-8 h-8 text-orange-600" />
                      ) : (
                        <Bike className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    
                    {/* DYNAMIC TITLE */}
                    <h2 className="text-2xl font-bold text-gray-900">
                        {modalType === 'restaurant' ? 'Partner with CRAVE' : 'Become a Rider'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">
                        {modalType === 'restaurant' 
                            ? 'Fill out the details below to list your restaurant.' 
                            : 'Join our fleet and start earning today.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* RESTAURANT NAME (Only for Restaurant) */}
                    {modalType === 'restaurant' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                        <input required name="restaurantName" value={formData.restaurantName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="Tasty Bites" />
                        </div>
                    )}

                    {/* OWNER NAME / RIDER NAME */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {modalType === 'restaurant' ? 'Owner Name' : 'Full Name'}
                      </label>
                      <input required name="ownerName" value={formData.ownerName} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="John Doe" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder="+1 234 567 890" />
                      </div>
                    </div>

                    {/* ADDRESS (Context changes based on type) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {modalType === 'restaurant' ? 'Restaurant Address' : 'City / Area'}
                      </label>
                      <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" placeholder={modalType === 'restaurant' ? "123 Food Street, City" : "Downtown Area, NY"}></textarea>
                    </div>

                    {/* VEHICLE TYPE (Only for Rider) */}
                    {modalType === 'rider' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-white">
                                <option value="bike">Motorcycle / Scooter</option>
                                <option value="bicycle">Bicycle</option>
                                <option value="car">Car</option>
                            </select>
                        </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h3>
                  <p className="text-gray-500">
                    Thank you for your interest. We have received your details.
                    Once approved, you will receive your <strong>Login Credentials</strong> via email at <span className="font-semibold text-gray-900">{formData.email}</span>.
                  </p>
                  <button onClick={handleClose} className="mt-8 px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          MAIN CARDS CONTAINER
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

            {/* CLICK EVENT: RESTAURANT FORM */}
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

            {/* CLICK EVENT: RIDER FORM */}
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