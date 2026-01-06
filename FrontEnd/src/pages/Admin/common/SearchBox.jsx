import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBox = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-box">
      <FaSearch />
      <input 
        type="text" 
        placeholder="Search..." 
        value={searchTerm} 
        onChange={(e) => onSearchChange(e.target.value)} 
      />
      {searchTerm && (
        <button onClick={() => onSearchChange("")}>
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default SearchBox;