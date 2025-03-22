import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, setDoc, query, where } from 'firebase/firestore';

function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [publishStatus, setPublishStatus] = useState(false);
  const [calculatingResults, setCalculatingResults] = useState(false);

  // Fetch results and settings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if results are published
        const settingsDoc = await getDoc(doc(db, 'settings', 'election'));
        if (settingsDoc.exists()) {
          setPublishStatus(settingsDoc.data().resultsPublished || false);
        }

        // Get saved results if they exist
        const resultsCollection = collection(db, 'results');
        const resultsSnapshot = await getDocs(resultsCollection);
        
        if (!resultsSnapshot.empty) {
          const resultsList = resultsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setResults(resultsList);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching results data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate results from votes
  const generateResults = async () => {
    setCalculatingResults(true);
    try {
      // Get all positions
      const positionsQuery = selectedCategory 
        ? query(collection(db, 'positions'), where("category", "==", selectedCategory))
        : collection(db, 'positions');
      
      const positionsSnapshot = await getDocs(positionsQuery);
      const positions = positionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process each position
      const calculatedResults = [];
      
      for (const position of positions) {
        // Get all candidates for this position
        const candidatesQuery = query(
          collection(db, 'candidates'), 
          where("position", "==", position.name)
        );
        const candidatesSnapshot = await getDocs(candidatesQuery);
        const candidates = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Get votes for this position
        const votesQuery = query(
          collection(db, 'votes'), 
          where("positionId", "==", position.id)
        );
        const votesSnapshot = await getDocs(votesQuery);
        const votes = votesSnapshot.docs.map(doc => doc.data());

        // Count votes for each candidate
        const candidateVotes = {};
        candidates.forEach(candidate => {
          candidateVotes[candidate.id] = 0;
        });

        votes.forEach(vote => {
          if (candidateVotes.hasOwnProperty(vote.candidateId)) {
            candidateVotes[vote.candidateId]++;
          }
        });

        // Calculate percentages and find winner
        const totalVotes = votes.length;
        const candidateResults = [];
        
        for (const candidate of candidates) {
          const voteCount = candidateVotes[candidate.id] || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          
          candidateResults.push({
            candidateId: candidate.id,
            name: candidate.name,
            gender: candidate.gender || '',
            votes: voteCount,
            percentage
          });
        }

        // Sort by votes (descending)
        candidateResults.sort((a, b) => b.votes - a.votes);
        
        // Mark winners based on vacancies
        const vacancies = position.vacancies || 1;
        candidateResults.forEach((candidate, index) => {
          candidate.isWinner = index < vacancies;
        });

        calculatedResults.push({
          positionId: position.id,
          positionName: position.name,
          category: position.category,
          totalVotes,
          candidates: candidateResults
        });
      }

      // Save results to Firestore
      for (const result of calculatedResults) {
        await setDoc(doc(db, 'results', result.positionId), result);
      }

      // Update state with new results
      setResults(calculatedResults);
      setCalculatingResults(false);
    } catch (error) {
      console.error("Error generating results: ", error);
      setCalculatingResults(false);
    }
  };

  // Toggle result publication status
  const togglePublishResults = async () => {
    try {
      const settingsRef = doc(db, 'settings', 'election');
      await setDoc(settingsRef, { 
        resultsPublished: !publishStatus 
      }, { merge: true });
      
      setPublishStatus(!publishStatus);
    } catch (error) {
      console.error("Error publishing results: ", error);
    }
  };

  // Filter results by category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter displayed results
  const filteredResults = selectedCategory
    ? results.filter(result => result.category === selectedCategory)
    : results;

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
          <Link to="/admin/positions" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-800 hover:text-white">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Positions</span>
            </div>
          </Link>
          <Link to="/admin/results" className="block py-2.5 px-4 rounded bg-blue-800 text-white">
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

        {/* Results Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Election Results</h1>
            <p className="text-gray-600">View and publish election results</p>
          </div>

          {/* Results Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Positions</option>
                  <option value="1st Year">1st Year Positions</option>
                  <option value="2nd Year">2nd Year Positions</option>
                  <option value="3rd Year">3rd Year Positions</option>
                  <option value="4th Year">4th & 5th Year Positions</option>
                  <option value="Other">Additional Positions</option>
                </select>
                <button 
                  className={`${calculatingResults ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded`}
                  onClick={generateResults}
                  disabled={calculatingResults}
                >
                  {calculatingResults ? 'Calculating...' : 'Generate Results'}
                </button>
              </div>
              <div>
                <button 
                  className={`${publishStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded`}
                  onClick={togglePublishResults}
                >
                  {publishStatus ? 'Unpublish Results' : 'Publish Results'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              Loading results data...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center md:col-span-2">
                  No results found. Use the "Generate Results" button to calculate election results.
                </div>
              ) : (
                filteredResults.map((result) => (
                  <div key={result.positionId} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">{result.positionName} ({result.category})</h2>
                      <p className="text-sm text-gray-500">Total Votes: {result.totalVotes}</p>
                    </div>
                    <div className="p-6">
                      {result.candidates.map((candidate, index) => (
                        <div key={candidate.candidateId} className={`space-y-4 ${index > 0 ? 'mt-8' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">{candidate.name} {candidate.gender ? `(${candidate.gender})` : ''}</div>
                                <div className="text-sm text-gray-500">{candidate.votes} votes</div>
                              </div>
                            </div>
                            {candidate.isWinner && (
                              <div className="text-green-600 font-medium">
                                Winner
                              </div>
                            )}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${candidate.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-500 text-right">{candidate.percentage}% of total votes</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminResults;