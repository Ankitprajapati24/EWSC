import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCandidates: 0,
    votesCast: 0,
    voterTurnout: 0,
    electionStatus: 'Inactive',
    positions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total students
        const studentsCollection = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsCollection);
        const totalStudents = studentsSnapshot.docs.length;

        // Get total candidates
        const candidatesCollection = collection(db, 'candidates');
        const candidatesSnapshot = await getDocs(candidatesCollection);
        const totalCandidates = candidatesSnapshot.docs.length;

        // Get votes cast
        const votesCollection = collection(db, 'votes');
        const votesSnapshot = await getDocs(votesCollection);
        const votesCast = votesSnapshot.docs.length;

        // Calculate voter turnout
        const voterTurnout = totalStudents > 0 ? ((votesCast / totalStudents) * 100).toFixed(1) : 0;

        // Get election status
        const settingsDoc = doc(db, 'settings', 'election');
        const settingsSnapshot = await getDoc(settingsDoc);
        const electionStatus = settingsSnapshot.exists() ? 
          settingsSnapshot.data().active ? 'Active' : 'Inactive' : 'Inactive';

        // Get positions
        const positionsCollection = collection(db, 'positions');
        const positionsSnapshot = await getDocs(positionsCollection);
        const positions = positionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalStudents,
          totalCandidates,
          votesCast,
          voterTurnout,
          electionStatus,
          positions
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <Link to="/admin/dashboard" className="block py-2.5 px-4 rounded bg-blue-800 text-white">
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome to the College Election System Admin Panel</p>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading dashboard data...</div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Students */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h2>
                      <p className="text-gray-600">Total Students</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Candidates */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{stats.totalCandidates}</h2>
                      <p className="text-gray-600">Total Candidates</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Votes Cast */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{stats.votesCast}</h2>
                      <p className="text-gray-600">Votes Cast</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Voter Turnout */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{stats.voterTurnout}%</h2>
                      <p className="text-gray-600">Voter Turnout</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Election Status and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Election Status */}
                <div className="bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Election Status</h2>
                    <button className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded">
                      {stats.electionStatus === 'Active' ? 'End Election' : 'Start Election'}
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`h-3 w-3 rounded-full ${stats.electionStatus === 'Active' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                      <span className={stats.electionStatus === 'Active' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                        Election {stats.electionStatus}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">Time Remaining:</span>
                      <span className="font-semibold text-gray-800">
                        {stats.electionStatus === 'Active' ? '8 hours' : 'Not Started'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                    <Link to="#" className="text-blue-700 hover:underline text-sm">View All</Link>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center min-h-[140px]">
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No recent activity to display</p>
                  </div>
                </div>
              </div>

              {/* Positions Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Election Positions</h2>
                  <Link to="/admin/positions" className="text-blue-700 hover:underline text-sm">Manage</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Candidates
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
                      {stats.positions.length > 0 ? (
                        stats.positions.map((position) => (
                          <tr key={position.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{position.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{position.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{position.candidateCount || '0'} / {position.vacancies}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {position.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link to={`/admin/positions/edit/${position.id}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No positions found. Add positions from the Positions page.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;