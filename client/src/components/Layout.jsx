import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const location = useLocation();

  // Define paths where the Navbar/Header should be hidden
  const hideHeader = 
    location.pathname.startsWith("/admin") || 
    location.pathname.startsWith("/restaurant/");

  return (
    <>
      {/* Fixed Header */}
      {!hideHeader && (
        <div className="fixed top-0 w-full z-50 flex flex-col bg-gray-100 shadow-sm">
          <Navbar />
        </div>
      )}

      {/* Main Content */}
      <main className={`relative w-full bg-white ${!hideHeader ? 'pt-[120px]' : ''}`}>
        {children}
      </main>
    </>
  );
};

export default Layout;