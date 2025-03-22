// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import StudentLogin from './StudentLogin';

function Login() {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">College Election System</h1>
        </div>
        
        {/* Login Tabs */}
        <div className="bg-gray-200 rounded-lg p-1 mb-6">
          <div className="grid grid-cols-2 gap-1">
            <button
              className={`py-2 px-4 rounded-md text-center transition ${
                activeTab === 'admin' 
                  ? 'bg-white text-blue-900 font-medium shadow-sm' 
                  : 'bg-transparent text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
            <button
              className={`py-2 px-4 rounded-md text-center transition ${
                activeTab === 'student' 
                  ? 'bg-white text-blue-900 font-medium shadow-sm' 
                  : 'bg-transparent text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('student')}
            >
              Student
            </button>
          </div>
        </div>
        
        {/* Login Form */}
        {activeTab === 'admin' ? <AdminLogin /> : <StudentLogin />}
      </div>
    </div>
  );
}

export default Login;