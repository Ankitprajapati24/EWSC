// src/components/StudentLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import emailjs from 'emailjs-com';

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    emailjs.init("5W5A5iIpAjJ2OzR6a"); // Replace with your EmailJS User ID
  }, []);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    
    try {
      // Verify if student email exists in database
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Email not registered. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Generate OTP and store it
      const generatedOTP = generateOTP();
      await addDoc(collection(db, 'otps'), {
        email: email,
        otp: generatedOTP,
        createdAt: new Date(),
        used: false
      });
      
      // Send email using EmailJS
      await emailjs.send(
        'service_whag3zs',  // Replace with your Service ID
        'template_i5zkhfl', // Replace with your Template ID
        {
          to_email: email,
          otp: generatedOTP
        },
        '5W5A5iIpAjJ2OzR6a'      // Replace with your User ID
      );
      
      setOtpSent(true);
      setLoading(false);
    } catch (error) {
      console.error("Error generating OTP: ", error);
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Verify OTP against stored OTPs
      const otpsRef = collection(db, 'otps');
      const q = query(
        otpsRef, 
        where("email", "==", email),
        where("otp", "==", otp),
        where("used", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }

      // Set OTP as used
      const otpDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'otps', otpDoc.id), {
        used: true
      });
      
      // Store student session info
      localStorage.setItem('studentEmail', email);
      
      // Navigate to student dashboard or profile
      navigate('/student/profile');
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      setError('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      {!otpSent ? (
        <form onSubmit={handleRequestOTP}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOTP}>
          <div className="mb-4">
            <p className="text-center text-gray-600 mb-4">
              We've sent an OTP to <strong>{email}</strong>
            </p>
            <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => setOtpSent(false)}
            >
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default StudentLogin;