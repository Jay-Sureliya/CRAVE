import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Login from "./pages/login/login.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import Restaurant from "./pages/Restaurant.jsx";
import SpecialOffer from "./pages/SpecialOffer.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Profile from "./pages/Profile.jsx";
import RestaurantsList from "./pages/RestaurantsList.jsx";
import RestaurantDetails from "./pages/RestaurantDetails.jsx";
import RiderDashboard from "./pages/RiderDashboard.jsx";
import FoodItemDetails from "./pages/FoodItemDetails.jsx";

// --- PLACEHOLDERS ---
const OrderFood = () => <div className="p-20 text-center text-2xl">🍔 Customer Menu (Order Now Page)</div>;

// --- PROTECTED ROUTE WRAPPER ---
const ProtectedRoute = ({ role, children }) => {
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");

  if (!token || userRole !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (

    <BrowserRouter>
      {/* <Navbar /> */}
      <Routes>
        <Route element={<MainLayout />}>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          {/* <Route path="/home"  */}
          <Route path="/about" element={<About />} />
          <Route path="/special-offer" element={<SpecialOffer />} />

          {/* Public Restaurant Listing */}
          <Route path="/rest" element={<RestaurantsList />} />
          <Route path="/rest/:id" element={<RestaurantDetails />} />
          <Route path="/menu-item/:id" element={<FoodItemDetails />} /> {/* Add this line */}

          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/order-food" element={<OrderFood />} />
          <Route path="/login" element={<Login />} />
        </Route>
        {/* --- PROTECTED: ADMIN --- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* --- PROTECTED: RESTAURANT --- */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="customer">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute role="driver">
              <RiderDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;