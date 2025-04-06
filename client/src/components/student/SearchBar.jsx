import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ data }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(data || '');

  const onSearchHandler = (e) => {
    e.preventDefault();
    navigate('/course-list/'+input);
  };

  return (
    <form
      onSubmit={onSearchHandler}
      className="max-w-xl w-full h-10 md:h-14 flex items-center bg-white border border-gray-300 rounded-3xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition"
    >
      <div className="px-3">
        <img
          src={assets.search_icon}
          alt="search icon"
          className="w-5 h-5 md:w-6 md:h-6 opacity-70"
        />
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for courses"
        aria-label="Search for courses"
        className="flex-grow h-full px-2 text-gray-700 placeholder-gray-400 focus:outline-none text-sm md:text-base"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 md:px-8 py-2 rounded-full transition-all duration-200 mx-2"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
