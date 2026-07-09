// components/SearchBar.jsx — CampusConnect
import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Search items…', autoFocus = false }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="search-bar">
      <FiSearch className="search-icon" size={18} />
      <input
        ref={inputRef}
        type="search"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
