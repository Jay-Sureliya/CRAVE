// // // import React from 'react'

// // // const TrackOrder = () => {
// // //   return (
// // //     <div>
// // //       TrackOrder
// // //     </div>
// // //   )
// // // }

// // // export default TrackOrder


// // import React, { useState, useEffect, useRef } from "react";
// // import { useNavigate } from "react-router-dom";
// // import {
// //   PhoneCall,
// //   MessageSquare,
// //   Star,
// //   MapPin,
// //   CheckCircle2,
// //   Bike,
// //   ChevronLeft,
// //   Send,
// //   X
// // } from "lucide-react";

// // const TrackOrder = () => {
// //   const navigate = useNavigate();

// //   const [order, setOrder] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const [showRatingPopup, setShowRatingPopup] = useState(false);
// //   const [rating, setRating] = useState(0);

// //   const [showMessageBox, setShowMessageBox] = useState(false);
// //   const [message, setMessage] = useState("");

// //   const lastActiveOrder = useRef(null);
// //   const intervalRef = useRef(null);

// //   /* ================= FETCH ORDER ================= */

// //   useEffect(() => {
// //     const fetchOrder = async () => {
// //       const token =
// //         localStorage.getItem("access_token") ||
// //         localStorage.getItem("token");

// //       if (!token) {
// //         navigate("/login");
// //         return;
// //       }

// //       try {
// //         const res = await fetch(
// //           "http://localhost:8000/api/orders/track",
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`
// //             }
// //           }
// //         );

// //         if (res.status === 401) {
// //           localStorage.clear();
// //           navigate("/login");
// //           return;
// //         }

// //         const data = await res.json();

// //         if (data.active) {
// //           setOrder(data);
// //           lastActiveOrder.current = data;
// //         } else {
// //           if (lastActiveOrder.current) {
// //             setShowRatingPopup(true);
// //             clearInterval(intervalRef.current);
// //           } else {
// //             setOrder(null);
// //           }
// //         }
// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchOrder();
// //     intervalRef.current = setInterval(fetchOrder, 10000);

// //     return () => clearInterval(intervalRef.current);
// //   }, []);

// //   /* ================= SEND MESSAGE ================= */

// //   const sendMessage = async () => {
// //     if (!message.trim()) return;

// //     const token =
// //       localStorage.getItem("access_token") ||
// //       localStorage.getItem("token");

// //     try {
// //       await fetch(
// //         `http://localhost:8000/api/orders/${order.id}/message-rider`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json"
// //           },
// //           body: JSON.stringify({ message })
// //         }
// //       );

// //       setMessage("");
// //       setShowMessageBox(false);
// //     } catch (err) {
// //       console.error("Message failed");
// //     }
// //   };

// //   /* ================= SUBMIT RATING ================= */

// //   const handleRatingSubmit = async () => {
// //     const token =
// //       localStorage.getItem("access_token") ||
// //       localStorage.getItem("token");

// //     try {
// //       await fetch(
// //         `http://localhost:8000/api/orders/${lastActiveOrder.current.id}/rate-rider`,
// //         {
// //           method: "POST",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             "Content-Type": "application/json"
// //           },
// //           body: JSON.stringify({ rating })
// //         }
// //       );
// //     } catch (err) {}

// //     navigate("/");
// //   };

// //   /* ================= STATUS STEP ================= */

// //   const getStep = (status) => {
// //     const steps = [
// //       "pending",
// //       "accepted",
// //       "preparing",
// //       "ready",
// //       "out_for_delivery",
// //       "delivered"
// //     ];
// //     return steps.indexOf(status);
// //   };

// //   const currentStep = order ? getStep(order.status) : 5;

// //   /* ================= LOADING ================= */

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         Loading...
// //       </div>
// //     );
// //   }

// //   if (!order && !showRatingPopup) {
// //     return (
// //       <div className="min-h-screen flex flex-col items-center justify-center">
// //         <h2 className="text-xl font-bold mb-4">
// //           No Active Orders
// //         </h2>
// //         <button
// //           onClick={() => navigate("/")}
// //           className="bg-orange-500 text-white px-6 py-3 rounded-xl"
// //         >
// //           Go Home
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-gray-50 min-h-screen pb-32 relative">

// //       {/* HEADER */}
// //       <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0">
// //         <button onClick={() => navigate("/")}>
// //           <ChevronLeft />
// //         </button>
// //         <div className="ml-3">
// //           <h1 className="font-bold">Track Order</h1>
// //           <p className="text-xs text-gray-500">
// //             Order #{order?.id}
// //           </p>
// //         </div>
// //       </div>

// //       {/* MAP AREA */}
// //       <div className="h-[280px] bg-gray-200 flex items-center justify-center">
// //         <MapPin className="text-orange-500" />
// //         <span className="ml-2 font-semibold">
// //           Live Map Area
// //         </span>
// //       </div>

// //       {/* STATUS */}
// //       <div className="bg-white p-6 rounded-t-3xl -mt-6 shadow">
// //         <h2 className="font-bold text-lg mb-4">
// //           {currentStep >= 5
// //             ? "Order Delivered"
// //             : currentStep >= 4
// //             ? "Rider is Coming"
// //             : "Preparing your food"}
// //         </h2>

// //         <div className="space-y-4">
// //           {["Confirmed", "Preparing", "Out for Delivery"].map(
// //             (step, i) => (
// //               <div key={i} className="flex items-center">
// //                 <div
// //                   className={`w-5 h-5 rounded-full border-2 ${
// //                     currentStep >= i + 1
// //                       ? "border-green-500 bg-green-500"
// //                       : "border-gray-300"
// //                   }`}
// //                 ></div>
// //                 <span className="ml-3 text-sm">{step}</span>
// //               </div>
// //             )
// //           )}
// //         </div>
// //       </div>

// //       {/* ORDER SUMMARY */}
// //       <div className="p-4">
// //         <div className="bg-white p-4 rounded-xl shadow">
// //           <h3 className="font-bold mb-3">Order Summary</h3>
// //           {order.items.map((item, idx) => (
// //             <div key={idx} className="text-sm mb-1">
// //               {item.qty} x {item.name}
// //             </div>
// //           ))}
// //           <div className="font-bold mt-3">
// //             ₹{order.total}
// //           </div>
// //         </div>
// //       </div>

// //       {/* RIDER CARD */}
// //       {order.rider_info && !showRatingPopup && (
// //         <div className="fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-3xl shadow-lg">
// //           <div className="flex justify-between items-center">
// //             <div>
// //               <h3 className="font-bold">
// //                 {order.rider_info.name}
// //               </h3>
// //               <p className="text-xs text-gray-500">
// //                 {order.rider_info.vehicle_type}
// //               </p>
// //               <p className="text-xs text-gray-400">
// //                 📞 {order.rider_info.phone}
// //               </p>
// //             </div>

// //             <div className="flex gap-3">
// //               <a
// //                 href={`tel:${order.rider_info.phone}`}
// //                 className="bg-green-100 p-3 rounded-full"
// //               >
// //                 <PhoneCall />
// //               </a>

// //               <button
// //                 onClick={() => setShowMessageBox(true)}
// //                 className="bg-gray-100 p-3 rounded-full"
// //               >
// //                 <MessageSquare />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* MESSAGE POPUP */}
// //       {showMessageBox && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
// //           <div className="bg-white p-6 rounded-xl w-80">
// //             <div className="flex justify-between mb-3">
// //               <h3 className="font-bold">Message Rider</h3>
// //               <button onClick={() => setShowMessageBox(false)}>
// //                 <X size={18} />
// //               </button>
// //             </div>

// //             <textarea
// //               className="w-full border p-2 rounded-lg text-sm"
// //               rows="3"
// //               value={message}
// //               onChange={(e) => setMessage(e.target.value)}
// //               placeholder="Type your message..."
// //             />

// //             <button
// //               onClick={sendMessage}
// //               className="bg-orange-500 text-white w-full mt-3 py-2 rounded-lg flex items-center justify-center gap-2"
// //             >
// //               <Send size={16} /> Send
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* RATING POPUP */}
// //       {showRatingPopup && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
// //           <div className="bg-white p-6 rounded-xl w-80 text-center">
// //             <h2 className="font-bold mb-4">
// //               Rate your rider
// //             </h2>

// //             <div className="flex justify-center gap-2 mb-4">
// //               {[1, 2, 3, 4, 5].map((s) => (
// //                 <Star
// //                   key={s}
// //                   size={28}
// //                   onClick={() => setRating(s)}
// //                   className={
// //                     s <= rating
// //                       ? "text-yellow-400 fill-yellow-400 cursor-pointer"
// //                       : "text-gray-300 cursor-pointer"
// //                   }
// //                 />
// //               ))}
// //             </div>

// //             <button
// //               onClick={handleRatingSubmit}
// //               className="bg-orange-500 text-white px-6 py-2 rounded-lg"
// //             >
// //               Submit
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default TrackOrder;


// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   PhoneCall,
//   MessageSquare,
//   Star,
//   MapPin,
//   CheckCircle2,
//   Bike,
//   ChevronLeft,
//   Send,
//   X
// } from "lucide-react";

// const TrackOrder = () => {
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [showRatingPopup, setShowRatingPopup] = useState(false);
//   const [rating, setRating] = useState(0);

//   const [showMessageBox, setShowMessageBox] = useState(false);
//   const [message, setMessage] = useState("");

//   const lastActiveOrder = useRef(null);
//   const intervalRef = useRef(null);

//   /* ================= FETCH ORDER ================= */

//   useEffect(() => {
//     const fetchOrder = async () => {
//       // 🚨 FIX: Now looking in sessionStorage 🚨
//       const token = sessionStorage.getItem("token");

//       if (!token) {
//         navigate("/login");
//         return;
//       }

//       try {
//         const res = await fetch(
//           "http://localhost:8000/api/orders/track",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Cache-Control": "no-cache"
//             }
//           }
//         );

//         if (res.status === 401) {
//           // 🚨 FIX: Clear sessionStorage if token expired 🚨
//           sessionStorage.removeItem("token");
//           navigate("/login");
//           return;
//         }

//         const data = await res.json();

//         if (data && data.active) {
//           setOrder(data);
//           lastActiveOrder.current = data;
//         } else {
//           if (lastActiveOrder.current) {
//             setShowRatingPopup(true);
//             clearInterval(intervalRef.current);
//           } else {
//             setOrder(null);
//           }
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//     intervalRef.current = setInterval(fetchOrder, 10000);

//     return () => clearInterval(intervalRef.current);
//   }, [navigate]);

//   /* ================= SEND MESSAGE ================= */

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     // 🚨 FIX: Now looking in sessionStorage 🚨
//     const token = sessionStorage.getItem("token");

//     try {
//       await fetch(
//         `http://localhost:8000/api/orders/${order.id}/message-rider`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ message })
//         }
//       );

//       setMessage("");
//       setShowMessageBox(false);
//     } catch (err) {
//       console.error("Message failed");
//     }
//   };

//   /* ================= SUBMIT RATING ================= */

//   const handleRatingSubmit = async () => {
//     // 🚨 FIX: Now looking in sessionStorage 🚨
//     const token = sessionStorage.getItem("token");

//     try {
//       await fetch(
//         `http://localhost:8000/api/orders/${lastActiveOrder.current.id}/rate-rider`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ rating })
//         }
//       );
//     } catch (err) {
//       console.error(err);
//     }

//     navigate("/");
//   };

//   /* ================= STATUS STEP ================= */

//   const getStep = (status) => {
//     const steps = [
//       "pending",
//       "accepted",
//       "preparing",
//       "ready",
//       "out_for_delivery",
//       "delivered"
//     ];
//     return steps.indexOf(status);
//   };

//   const currentStep = order ? getStep(order.status) : 5;

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   if (!order && !showRatingPopup) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center">
//         <h2 className="text-xl font-bold mb-4">
//           No Active Orders
//         </h2>
//         <button
//           onClick={() => navigate("/")}
//           className="bg-orange-500 text-white px-6 py-3 rounded-xl"
//         >
//           Go Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen pb-32 relative">

//       {/* HEADER */}
//       <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0">
//         <button onClick={() => navigate("/")}>
//           <ChevronLeft />
//         </button>
//         <div className="ml-3">
//           <h1 className="font-bold">Track Order</h1>
//           <p className="text-xs text-gray-500">
//             Order #{order?.id || lastActiveOrder.current?.id}
//           </p>
//         </div>
//       </div>

//       {/* MAP AREA */}
//       <div className="h-[280px] bg-gray-200 flex items-center justify-center">
//         <MapPin className="text-orange-500" />
//         <span className="ml-2 font-semibold">
//           Live Map Area
//         </span>
//       </div>

//       {/* STATUS */}
//       <div className="bg-white p-6 rounded-t-3xl -mt-6 shadow relative z-10">
//         <h2 className="font-bold text-lg mb-4">
//           {currentStep >= 5
//             ? "Order Delivered"
//             : currentStep >= 4
//               ? "Rider is Coming"
//               : "Preparing your food"}
//         </h2>

//         <div className="space-y-4">
//           {["Confirmed", "Preparing", "Out for Delivery"].map(
//             (step, i) => (
//               <div key={i} className="flex items-center">
//                 <div
//                   className={`w-5 h-5 rounded-full border-2 ${currentStep >= i + 1
//                       ? "border-green-500 bg-green-500"
//                       : "border-gray-300"
//                     }`}
//                 ></div>
//                 <span className="ml-3 text-sm">{step}</span>
//               </div>
//             )
//           )}
//         </div>
//       </div>

//       {/* ORDER SUMMARY */}
//       <div className="p-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-bold mb-3">Order Summary</h3>
//           {(order?.items || lastActiveOrder.current?.items || []).map((item, idx) => (
//             <div key={idx} className="text-sm mb-1">
//               {item.qty} x {item.name}
//             </div>
//           ))}
//           <div className="font-bold mt-3 border-t pt-2">
//             ₹{order?.total || lastActiveOrder.current?.total}
//           </div>
//         </div>
//       </div>

//       {/* RIDER CARD */}
//       {order?.rider_info && !showRatingPopup && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40">
//           <div className="flex justify-between items-center max-w-md mx-auto">
//             <div>
//               <h3 className="font-bold text-lg">
//                 {order.rider_info.name}
//               </h3>
//               <p className="text-sm text-gray-500">
//                 {order.rider_info.vehicle_type}
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <a
//                 href={`tel:${order.rider_info.phone}`}
//                 className="bg-green-100 text-green-600 p-3 rounded-full flex items-center justify-center"
//               >
//                 <PhoneCall size={20} />
//               </a>

//               <button
//                 onClick={() => setShowMessageBox(true)}
//                 className="bg-gray-100 text-gray-700 p-3 rounded-full flex items-center justify-center"
//               >
//                 <MessageSquare size={20} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MESSAGE POPUP */}
//       {showMessageBox && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
//           <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm shadow-xl">
//             <div className="flex justify-between mb-4 items-center">
//               <h3 className="font-bold text-lg">Message Rider</h3>
//               <button onClick={() => setShowMessageBox(false)} className="text-gray-400 hover:text-gray-800">
//                 <X size={20} />
//               </button>
//             </div>

//             <textarea
//               className="w-full border-2 border-gray-200 focus:border-orange-500 focus:outline-none p-3 rounded-xl text-sm transition-colors"
//               rows="3"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type your message..."
//             />

//             <button
//               onClick={sendMessage}
//               className="bg-orange-500 hover:bg-orange-600 transition-colors text-white w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
//             >
//               <Send size={18} /> Send
//             </button>
//           </div>
//         </div>
//       )}

//       {/* RATING POPUP */}
//       {showRatingPopup && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
//           <div className="bg-white p-6 rounded-3xl w-full max-w-sm text-center shadow-2xl">
//             <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
//               <CheckCircle2 size={32} />
//             </div>

//             <h2 className="text-2xl font-black mb-2 text-gray-900">
//               Order Delivered!
//             </h2>
//             <p className="text-gray-500 text-sm mb-6">
//               Rate your experience with {lastActiveOrder.current?.rider_info?.name || 'the rider'}.
//             </p>

//             <div className="flex justify-center gap-2 mb-8">
//               {[1, 2, 3, 4, 5].map((s) => (
//                 <Star
//                   key={s}
//                   size={36}
//                   onClick={() => setRating(s)}
//                   className={`transition-colors duration-200 ${s <= rating
//                       ? "text-yellow-400 fill-yellow-400 cursor-pointer drop-shadow-sm"
//                       : "text-gray-200 fill-gray-100 cursor-pointer"
//                     }`}
//                 />
//               ))}
//             </div>

//             <div className="flex flex-col gap-3">
//               <button
//                 onClick={handleRatingSubmit}
//                 disabled={rating === 0}
//                 className={`w-full font-bold py-3.5 rounded-2xl transition-all ${rating > 0
//                     ? 'bg-orange-500 text-white shadow-md'
//                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   }`}
//               >
//                 Submit Rating
//               </button>
//               <button
//                 onClick={() => {
//                   setShowRatingPopup(false);
//                   navigate('/');
//                 }}
//                 className="w-full text-gray-500 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
//               >
//                 Skip
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TrackOrder;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PhoneCall,
  MessageSquare,
  Star,
  MapPin,
  CheckCircle2,
  Bike,
  ChevronLeft,
  Send,
  X,
  ChefHat,
  Receipt,
  Clock,
  Check,
  ShoppingBag
} from "lucide-react";

const TrackOrder = () => {
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [rating, setRating] = useState(0);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");

  const lastActiveOrder = useRef(null);
  const intervalRef = useRef(null);

  /* ================= FETCH ORDER LOGIC ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      // Safely check sessionStorage
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/orders/track", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });

        if (res.status === 401) {
          sessionStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (data && data.active) {
          setOrder(data);
          lastActiveOrder.current = data;
        } else {
          if (lastActiveOrder.current) {
            setShowRatingPopup(true);
            clearInterval(intervalRef.current);
          } else {
            setOrder(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 10000);

    return () => clearInterval(intervalRef.current);
  }, [navigate]);

  /* ================= SEND MESSAGE ================= */
  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!message.trim()) return;

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8000/api/orders/${order.id}/message-rider`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // We are explicitly sending "message" here. The backend must match this.
        body: JSON.stringify({ message: message }),
      });

      if (response.ok) {
        alert("Message sent to rider!");
        setMessage("");
        setShowMessageBox(false);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Message failed:", err);
      alert("Network error. Could not send message.");
    }
  };

  /* ================= SUBMIT RATING ================= */
  const handleRatingSubmit = async () => {
    const token = sessionStorage.getItem("token");

    try {
      await fetch(
        `http://localhost:8000/api/orders/${lastActiveOrder.current.id}/rate-rider`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating }),
        }
      );
    } catch (err) {
      console.error(err);
    }

    navigate("/");
  };

  /* ================= STATUS LOGIC ================= */
  const getStep = (status) => {
    const steps = ["pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered"];
    return steps.indexOf(status);
  };

  const currentStep = order ? getStep(order.status) : 5;

  /* ================= RENDER HELPERS ================= */
  const getStatusDisplay = () => {
    if (currentStep >= 5) return { title: "Order Delivered!", subtitle: "Enjoy your meal", icon: <CheckCircle2 size={32} /> };
    if (currentStep >= 4) return { title: "Rider is nearby", subtitle: "Arriving in 10-15 mins", icon: <Bike size={32} /> };
    if (currentStep >= 3) return { title: "Food is Ready", subtitle: "Waiting for rider pickup", icon: <ShoppingBag size={32} /> };
    if (currentStep >= 2) return { title: "Preparing your food", subtitle: "Kitchen is busy cooking", icon: <ChefHat size={32} /> };
    if (currentStep >= 1) return { title: "Order Accepted", subtitle: "Restaurant confirmed your order", icon: <Receipt size={32} /> };
    return { title: "Awaiting Restaurant", subtitle: "Waiting for confirmation", icon: <Clock size={32} /> };
  };

  const statusDisplay = getStatusDisplay();

  /* ================= LOADING & EMPTY STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF8A00]/20 border-t-[#FF8A00] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Locating your order...</p>
      </div>
    );
  }

  if (!order && !showRatingPopup) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-[#FF8A00]/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#FF8A00]/20">
          <Receipt size={40} className="text-[#FF8A00]" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">No Active Orders</h2>
        <p className="text-slate-500 text-center max-w-xs mb-8">You don't have any ongoing deliveries at the moment.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#FF8A00] hover:bg-[#E67A00] text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#FF8A00]/30 transition-all active:scale-95"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="bg-[#FFFDFB] min-h-screen pb-40 relative font-sans selection:bg-[#FF8A00]/20">

      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-orange-100 shadow-sm">
        <div className="flex items-center gap-3 w-[90%] max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-orange-50 rounded-full transition-colors text-slate-700"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight">Track Order</h1>
            <p className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider">
              ID: #{order?.id || lastActiveOrder.current?.id}
            </p>
          </div>
          <div className="bg-[#FF8A00]/10 text-[#FF8A00] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-[#FF8A00]/20 shadow-sm">
            <Clock size={14} className="animate-pulse" /> Live
          </div>
        </div>
      </div>

      {/* MAP PLACEHOLDER */}
      <div className="h-[28vh] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#FF8A00 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute w-full h-full bg-gradient-to-t from-white to-transparent bottom-0 z-0"></div>

        <div className="relative z-10 bg-white/80 backdrop-blur-md border border-[#FF8A00]/30 px-6 py-3 rounded-full text-slate-800 font-bold flex items-center gap-3 shadow-xl">
          <MapPin className="text-[#FF8A00] drop-shadow-[0_0_8px_rgba(255,138,0,0.5)]" />
          <span>Interactive Map Tracking</span>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER - 90% WIDTH */}
      <div className="w-[90%] max-w-4xl mx-auto -mt-6 relative z-20 space-y-5">

        {/* LIVE STATUS CARD */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(255,138,0,0.08)] border border-[#FF8A00]/10">
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 shadow-inner">
              {statusDisplay.icon}
            </div>
            <div className="pt-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{statusDisplay.title}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">{statusDisplay.subtitle}</p>
            </div>
          </div>

          {/* GRANULAR TIMELINE */}
          <div className="pl-3">
            {[
              { label: "Order Accepted", stepIdx: 1 },
              { label: "Preparing Food", stepIdx: 2 },
              { label: "Order Ready", stepIdx: 3 },
              { label: "Out for Delivery", stepIdx: 4 },
            ].map((step, i, arr) => {
              const isCompleted = currentStep >= step.stepIdx;
              const isLast = i === arr.length - 1;

              return (
                <div key={i} className="flex relative pb-8 last:pb-0">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className={`absolute left-[11px] top-7 bottom-[-8px] w-[2px] transition-colors duration-500 ${isCompleted ? 'bg-[#FF8A00]' : 'bg-slate-200 border-l-2 border-dashed border-slate-200 bg-transparent'}`}></div>
                  )}

                  {/* Circle Indicator */}
                  <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${isCompleted
                    ? "border-[#FF8A00] bg-[#FF8A00] ring-4 ring-[#FF8A00]/20 shadow-lg shadow-[#FF8A00]/40"
                    : "border-slate-300 bg-white"
                    }`}>
                    {isCompleted && <Check size={12} strokeWidth={4} className="text-white" />}
                  </div>

                  {/* Label */}
                  <div className={`ml-5 text-[15px] font-bold pt-0.5 transition-colors duration-500 ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER SUMMARY (RECEIPT STYLE) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] [background-size:12px_12px] -mt-1"></div>

          <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2 text-lg">
            <Receipt size={20} className="text-[#FF8A00]" /> Bill Details
          </h3>

          <div className="space-y-4 mb-5">
            {(order?.items || lastActiveOrder.current?.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[15px]">
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#FF8A00] bg-[#FF8A00]/10 px-2.5 py-1 rounded-lg text-sm border border-[#FF8A00]/20">{item.qty}x</span>
                  <span className="text-slate-700 font-bold">{item.name}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-5 flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-sm">Total Paid</span>
            <span className="text-2xl font-black text-[#FF8A00]">₹{order?.total || lastActiveOrder.current?.total}</span>
          </div>
        </div>

      </div>

      {/* FLOATING RIDER CARD */}
      {order?.rider_info && !showRatingPopup && (
        <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none">
          {/* Constrain Rider Card to 90% Width */}
          <div className="w-[90%] max-w-4xl pointer-events-auto bg-white/95 backdrop-blur-xl border border-[#FF8A00]/20 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(255,138,0,0.15)] flex justify-between items-center">

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FF8A00] to-[#E67A00] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/20">
                {order.rider_info.name.charAt(0)}
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">
                  {order.rider_info.name}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                  {order.rider_info.vehicle_type}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowMessageBox(true)}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
              >
                <MessageSquare size={20} />
              </button>
              <a
                href={`tel:${order.rider_info.phone}`}
                className="w-12 h-12 bg-[#FF8A00] hover:bg-[#E67A00] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF8A00]/40 transition-all active:scale-95"
              >
                <PhoneCall size={20} className="fill-white" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE POPUP */}
      {showMessageBox && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-[2rem] w-[90%] max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-xl text-slate-900">Message Rider</h3>
              <button onClick={() => setShowMessageBox(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <textarea
              className="w-full bg-slate-50 border-2 border-slate-100 focus:border-[#FF8A00] focus:bg-white focus:ring-4 focus:ring-[#FF8A00]/10 outline-none p-4 rounded-2xl text-sm font-medium transition-all resize-none"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g. Please leave the package at the door..."
            />

            <button
              onClick={sendMessage}
              className="bg-[#FF8A00] hover:bg-[#E67A00] text-white w-full mt-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#FF8A00]/30"
            >
              <Send size={18} /> Send Message
            </button>
          </div>
        </div>
      )}

      {/* RATING POPUP */}
      {showRatingPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-[90%] max-w-sm text-center shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border border-white/20">

            <div className="w-20 h-20 bg-[#FF8A00]/10 text-[#FF8A00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#FF8A00]/20">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>

            <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">
              Delivered!
            </h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              How was your experience with <br /><span className="text-slate-800 font-black text-lg">{lastActiveOrder.current?.rider_info?.name || 'the rider'}</span>?
            </p>

            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="outline-none transform transition-transform hover:scale-110 active:scale-90"
                >
                  <Star
                    size={42}
                    className={`transition-all duration-300 ${s <= rating
                      ? "text-[#FF8A00] fill-[#FF8A00] drop-shadow-[0_4px_10px_rgba(255,138,0,0.5)]"
                      : "text-slate-200 fill-slate-100"
                      }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRatingSubmit}
                disabled={rating === 0}
                className={`w-full font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 ${rating > 0
                  ? 'bg-[#FF8A00] hover:bg-[#E67A00] text-white shadow-lg shadow-[#FF8A00]/30'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => {
                  setShowRatingPopup(false);
                  navigate('/');
                }}
                className="w-full text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;