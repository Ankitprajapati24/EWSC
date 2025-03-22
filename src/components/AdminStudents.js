import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import Papa from 'papaparse';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New student form state
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
    email: '',
    year: '',
    department: '',
    gender: ''
  });
  
  // Edit student state
  const [editingStudent, setEditingStudent] = useState(null);
  
  // CSV file state
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('No file selected');

  // Fetch students from Firestore
  const fetchStudents = async () => {
    try {
      const studentsCollection = collection(db, 'students');
      const studentsSnapshot = await getDocs(studentsCollection);
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle input change for new student form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value
    });
  };

  // Handle input change for edit student form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent({
      ...editingStudent,
      [name]: value
    });
  };

  // Add new student
  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), newStudent);
      setNewStudent({
        name: '',
        rollNumber: '',
        email: '',
        year: '',
        department: '',
        gender: ''
      });
      setShowForm(false);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  // Start editing student
  const startEdit = (student) => {
    setEditingStudent(student);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingStudent(null);
  };

  // Save edited student
  const saveEdit = async () => {
    try {
      const studentRef = doc(db, 'students', editingStudent.id);
      await updateDoc(studentRef, {
        name: editingStudent.name,
        rollNumber: editingStudent.rollNumber,
        email: editingStudent.email,
        year: editingStudent.year,
        department: editingStudent.department,
        gender: editingStudent.gender || ''
      });
      setEditingStudent(null);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error("Error updating student: ", error);
    }
  };

  // Delete student function
  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'students', id));
        // Remove from state
        setStudents(students.filter(student => student.id !== id));
      } catch (error) {
        console.error("Error deleting student: ", error);
      }
    }
  };

  // Handle CSV file upload
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setCsvFileName(e.target.files[0].name);
    }
  };

  // Process and upload CSV
  const uploadCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Batch add students
            const batch = [];
            results.data.forEach(student => {
              // Validate and format the student data
              const formattedStudent = {
                name: student.Name || student.name || '',
                rollNumber: student.RollNumber || student['Roll Number'] || student.rollNumber || '',
                email: student.Email || student.email || '',
                year: student.Year || student.year || '',
                department: student.Department || student.Stream || student.department || '',
                gender: student.Gender || student.gender || ''
              };
              
              if (formattedStudent.name && formattedStudent.rollNumber) {
                batch.push(addDoc(collection(db, 'students'), formattedStudent));
              }
            });
            
            await Promise.all(batch);
            alert(`Successfully imported ${batch.length} students`);
            fetchStudents(); // Refresh list
            
            // Reset file input
            setCsvFile(null);
            setCsvFileName('No file selected');
          } catch (error) {
            console.error("Error importing students: ", error);
            alert('Error importing students. Please check the console for details.');
          }
        },
        error: (error) => {
          console.error("Error parsing CSV: ", error);
          alert('Error parsing CSV file. Please check the format.');
        }
      });
    };
    reader.readAsText(csvFile);
  };

  // Search students
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const searchStudents = async () => {
    if (!searchQuery.trim()) {
      fetchStudents();
      return;
    }

    setLoading(true);
    try {
      const studentsCollection = collection(db, 'students');
      // For basic search, we'll just get all students and filter in memory
      // For more advanced search, you'd use Firestore queries
      const studentsSnapshot = await getDocs(studentsCollection);
      const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter students by search query
      const filteredStudents = allStudents.filter(student => 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setStudents(filteredStudents);
      setLoading(false);
    } catch (error) {
      console.error("Error searching students: ", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-blue-900 text-white w-64 py-7 px-2">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 px-4 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xl font-bold">Election System</span>
        </div>

        {/* Nav Links */}
        <nav>
          <Link to="/admin/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>Dashboard</span>
            </div>
          </Link>
          <Link to="/admin/candidates" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Candidates</span>
            </div>
          </Link>
          <Link to="/admin/students" className="block py-2.5 px-4 rounded bg-blue-800 text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Students</span>
            </div>
          </Link>
          <Link to="/admin/positions" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Positions</span>
            </div>
          </Link>
          <Link to="/admin/results" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Results</span>
            </div>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 w-56">
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Admin</span>
              <div className="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Students Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
            <p className="text-gray-600">View and manage student voter data</p>
          </div>

          {/* Add Student Button */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Add New Student</h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Add Student'}
              </button>
            </div>
            
            {showForm && (
              <form onSubmit={addStudent} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={newStudent.rollNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    name="year"
                    value={newStudent.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newStudent.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2 mt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Add Student
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Import Student Data</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">Upload a CSV file with student data. The file should include columns for Name, Roll Number, Email, Gender, Year, and Department.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded cursor-pointer">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                Choose CSV
              </label>
              <button 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={uploadCSV}
                disabled={!csvFile}
              >
                Upload CSV
              </button>
              <span className="text-gray-500 text-sm">{csvFileName}</span>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">All Students</h2>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                  onClick={searchStudents}
                >
                  Search
                </button>
              </div>
            </div>
            {loading ? (
              <div className="p-6 text-center">Loading students...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stream/Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No students found. Import students or add them manually.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent && editingStudent.id === student.id ? (
                              <input
                                type="text"
                                name="name"
                                value={editingStudent.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent && editingStudent.id === student.id ? (
                              <input
                                type="text"
                                name="rollNumber"
                                value={editingStudent.rollNumber}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">{student.rollNumber}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent && editingStudent.id === student.id ? (
                              <input
                                type="email"
                                name="email"
                                value={editingStudent.email}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">{student.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent && editingStudent.id === student.id ? (
                              <select
                                name="year"
                                value={editingStudent.year}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              >
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-500">{student.year}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingStudent && editingStudent.id === student.id ? (
                              <input
                                type="text"
                                name="department"
                                value={editingStudent.department}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">{student.department}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingStudent && editingStudent.id === student.id ? (
                              <div className="flex space-x-2">
                                <button 
                                  className="text-green-600 hover:text-green-900"
                                  onClick={saveEdit}
                                >
                                  Save
                                </button>
                                <button 
                                  className="text-gray-600 hover:text-gray-900"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => startEdit(student)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => deleteStudent(student.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminStudents;