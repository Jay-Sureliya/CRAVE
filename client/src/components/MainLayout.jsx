// src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div> {/* Add padding for fixed navbar */}
        <Outlet /> {/* This renders the child route (Home, About, etc.) */}
      </div>
    </>
  );
};

export default MainLayout;