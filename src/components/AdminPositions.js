import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function AdminPositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState(null);
  
  // New position form state
  const [newPosition, setNewPosition] = useState({
    name: '',
    category: '',
    vacancies: 1,
    gender: '',
    status: 'Active'
  });

  // Fetch positions from Firestore
  const fetchPositions = async () => {
    try {
      const positionsCollection = collection(db, 'positions');
      const positionsSnapshot = await getDocs(positionsCollection);
      const positionsList = positionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPositions(positionsList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching positions: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // Handle input change for new position form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPosition({
      ...newPosition,
      [name]: name === 'vacancies' ? parseInt(value) : value
    });
  };

  // Handle input change for edit position form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPosition({
      ...editingPosition,
      [name]: name === 'vacancies' ? parseInt(value) : value
    });
  };

  // Add new position
  const addPosition = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'positions'), newPosition);
      setNewPosition({
        name: '',
        category: '',
        vacancies: 1,
        gender: '',
        status: 'Active'
      });
      fetchPositions(); // Refresh list
    } catch (error) {
      console.error("Error adding position: ", error);
    }
  };

  // Start editing position
  const startEdit = (position) => {
    setEditingPosition(position);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingPosition(null);
  };

  // Save edited position
  const saveEdit = async () => {
    try {
      const positionRef = doc(db, 'positions', editingPosition.id);
      await updateDoc(positionRef, {
        name: editingPosition.name,
        category: editingPosition.category,
        vacancies: editingPosition.vacancies,
        gender: editingPosition.gender,
        status: editingPosition.status
      });
      setEditingPosition(null);
      fetchPositions(); // Refresh list
    } catch (error) {
      console.error("Error updating position: ", error);
    }
  };

  // Delete position function
  const deletePosition = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await deleteDoc(doc(db, 'positions', id));
        // Remove from state
        setPositions(positions.filter(position => position.id !== id));
      } catch (error) {
        console.error("Error deleting position: ", error);
      }
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
          <Link to="/admin/students" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Students</span>
            </div>
          </Link>
          <Link to="/admin/positions" className="block py-2.5 px-4 rounded bg-blue-800 text-white">
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

        {/* Positions Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Positions</h1>
            <p className="text-gray-600">Configure election positions and eligibility criteria</p>
          </div>

          {/* Add Position Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Position</h2>
            <form onSubmit={addPosition} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={newPosition.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="e.g. Class Representative" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  name="category"
                  value={newPosition.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Vacancies</label>
                <input 
                  type="number" 
                  name="vacancies"
                  value={newPosition.vacancies}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  min="1" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender Requirement</label>
                <select 
                  name="gender"
                  value={newPosition.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="1 Male, 1 Female">1 Male, 1 Female</option>
                  <option value="Gender Neutral">Gender Neutral</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Add Position
                </button>
              </div>
            </form>
          </div>

          {/* Positions List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">All Positions</h2>
            </div>
            {loading ? (
              <div className="p-6 text-center">Loading positions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vacancies
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {positions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No positions found. Add your first position above.
                        </td>
                      </tr>
                    ) : (
                      positions.map((position) => (
                        <tr key={position.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPosition && editingPosition.id === position.id ? (
                              <input
                                type="text"
                                name="name"
                                value={editingPosition.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">{position.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPosition && editingPosition.id === position.id ? (
                              <select
                                name="category"
                                value={editingPosition.category}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              >
                                <option value="">Select Category</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-500">{position.category}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPosition && editingPosition.id === position.id ? (
                              <input
                                type="number"
                                name="vacancies"
                                value={editingPosition.vacancies}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                min="1"
                              />
                            ) : (
                              <div className="text-sm text-gray-500">{position.vacancies}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPosition && editingPosition.id === position.id ? (
                              <select
                                name="gender"
                                value={editingPosition.gender}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              >
                                <option value="">Any Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="1 Male, 1 Female">1 Male, 1 Female</option>
                                <option value="Gender Neutral">Gender Neutral</option>
                              </select>
                            ) : (
                              <div className="text-sm text-gray-500">{position.gender || 'Any Gender'}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingPosition && editingPosition.id === position.id ? (
                              <select
                                name="status"
                                value={editingPosition.status}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                              >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            ) : (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${position.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {position.status || 'Active'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingPosition && editingPosition.id === position.id ? (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={saveEdit}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={cancelEdit}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => startEdit(position)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => deletePosition(position.id)}
                                  className="text-red-600 hover:text-red-900"
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

export default AdminPositions;