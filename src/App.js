// Update your App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AdminStudents from './components/AdminStudents';
import AdminCandidates from './components/AdminCandidates';
import AdminPositions from './components/AdminPositions';
import AdminResults from './components/AdminResults';
// Import student components once created
// import StudentVerify from './components/StudentVerify';
// import StudentProfile from './components/StudentProfile';
// import StudentDashboard from './components/StudentDashboard';

function ProtectedAdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedAdminRoute>
              <AdminStudents />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/candidates" element={
            <ProtectedAdminRoute>
              <AdminCandidates />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/positions" element={
            <ProtectedAdminRoute>
              <AdminPositions />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/results" element={
            <ProtectedAdminRoute>
              <AdminResults />
            </ProtectedAdminRoute>
          } />
          
          {/* Student Routes - Uncomment as you implement them */}
          {/* 
          <Route path="/student/verify" element={<StudentVerify />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} /> 
          */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;