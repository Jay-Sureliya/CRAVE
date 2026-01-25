// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/login/login.jsx";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";

// const ProtectedRoute = ({ role, children }) => {
//   const token = localStorage.getItem("token");
//   const userRole = localStorage.getItem("role");

//   if (!token || userRole !== role) {
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route
//           path="/admin/dashboard"
//           element={
//             <ProtectedRoute role="admin">
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/restaurant/dashboard"
//           element={
//             <ProtectedRoute role="restaurant">
//               <RestaurantDashboard />
//             </ProtectedRoute>
//           }
//         />
        
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Restaurant Pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";

const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Restaurant */}
        <Route
          path="/restaurant"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/orders"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/restaurant/menu"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantMenu />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
