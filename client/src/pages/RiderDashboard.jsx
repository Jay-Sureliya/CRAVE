import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, MapPin, CheckCircle, LogOut, Bell } from 'lucide-react';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleStatus = () => setIsOnline(!isOnline);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            <Bike size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Crave Fleet</h1>
            <p className="text-xs text-gray-500">Welcome, {user.username || 'Rider'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleStatus}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
          >
            {isOnline ? '● Online' : '○ Offline'}
          </button>
          <button onClick={handleLogout} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-lg mx-auto">
        
        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Today's Earnings</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹0.00</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase">Completed Trips</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">0</h3>
          </div>
        </div>

        {/* ACTIVE ORDER (Placeholder) */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100 relative overflow-hidden">
          {isOnline ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="text-blue-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Searching for orders...</h3>
              <p className="text-gray-500 text-sm mt-2">Stay in high demand areas to get orders faster.</p>
            </div>
          ) : (
            <div className="text-center py-10 opacity-50">
              <h3 className="text-xl font-bold text-gray-900">You are Offline</h3>
              <p className="text-gray-500 text-sm mt-2">Go online to start receiving orders.</p>
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="mt-8">
          <h4 className="font-bold text-gray-900 mb-4 px-2">Recent Activity</h4>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center text-gray-400 text-sm">
            No recent activity
          </div>
        </div>

      </main>
    </div>
  );
};

export default RiderDashboard;