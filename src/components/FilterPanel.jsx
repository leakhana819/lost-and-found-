// components/FilterPanel.jsx — CampusConnect
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { CATEGORIES, LOCATIONS, SORT_OPTIONS } from '../utils/helpers.js';

export default function FilterPanel({ filters, onFilterChange, onReset, itemCount }) {
  const hasActiveFilters = filters.type || filters.category || filters.location || filters.sortBy !== 'newest';

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <aside className="filter-panel card">
      <div className="filter-header">
        <div className="filter-title">
          <FiFilter size={16} />
          <span>Filters</span>
          {itemCount !== undefined && (
            <span className="filter-count">{itemCount} items</span>
          )}
        </div>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm filter-reset" onClick={onReset}>
            <FiX size={14} /> Reset
          </button>
        )}
      </div>

      <div className="filter-divider" />

      {/* Type */}
      <div className="filter-group">
        <p className="filter-label">Status</p>
        <div className="filter-chips">
          {[
            { value: '', label: 'All' },
            { value: 'lost',  label: '🔍 Lost' },
            { value: 'found', label: '✅ Found' },
          ].map(opt => (
            <button
              key={opt.value}
              className={`filter-chip ${filters.type === opt.value ? 'active' : ''}`}
              onClick={() => handleChange('type', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-group">
        <p className="filter-label">Category</p>
        <div className="select-wrap">
          <select
            className="form-input form-select"
            value={filters.category}
            onChange={e => handleChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="filter-group">
        <p className="filter-label">Location</p>
        <div className="select-wrap">
          <select
            className="form-input form-select"
            value={filters.location}
            onChange={e => handleChange('location', e.target.value)}
          >
            <option value="">All Locations</option>
            {LOCATIONS.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort */}
      <div className="filter-group">
        <p className="filter-label">Sort By</p>
        <div className="select-wrap">
          <select
            className="form-input form-select"
            value={filters.sortBy}
            onChange={e => handleChange('sortBy', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resolved toggle */}
      <div className="filter-group">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={filters.hideResolved === true}
            onChange={e => handleChange('hideResolved', e.target.checked)}
          />
          <span className="toggle-label">Hide resolved items</span>
        </label>
      </div>
    </aside>
  );
}
