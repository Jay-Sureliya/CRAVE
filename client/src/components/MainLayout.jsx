import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // This Navbar contains TopBanner
import Footer from "./Footer";

const MainLayout = () => {
  // --- STATE LIFTED UP ---
  // This state controls the popup visibility globally
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Pass the state setters to Navbar -> TopBanner */}
      <Navbar isMapOpen={isMapOpen} setIsMapOpen={setIsMapOpen} />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* <Footer /> */}
      <Footer />
      
    </div>
  );
};

export default MainLayout;