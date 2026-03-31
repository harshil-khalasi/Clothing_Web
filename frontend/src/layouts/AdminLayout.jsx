import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-600">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-6 py-12 lg:px-12">
        <div className="animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
