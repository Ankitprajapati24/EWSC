import React, { useState } from 'react';

function CandidateForm({ addCandidate }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [year, setYear] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    addCandidate({
      name,
      position,
      year,
      status: 'Active' // Default status
    });
    // Reset form
    setName('');
    setPosition('');
    setYear('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input 
          type="text" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Position</label>
        <input 
          type="text" 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <select 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>
      </div>
      <button 
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Add Candidate
      </button>
    </form>
  );
}

export default CandidateForm;