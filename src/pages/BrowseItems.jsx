// pages/BrowseItems.jsx — CampusConnect
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiGrid, FiList } from 'react-icons/fi';
import { useItems } from '../context/ItemContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { filterItems, sortItems } from '../utils/helpers.js';
import './BrowseItems.css';

const ITEMS_PER_PAGE = 12;

const DEFAULT_FILTERS = {
  type: '', category: '', location: '', sortBy: 'newest', hideResolved: false, query: '',
};

export default function BrowseItems() {
  const { items } = useItems();
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    return location.state ? { ...DEFAULT_FILTERS, ...location.state } : DEFAULT_FILTERS;
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Serialize state to prevent re-runs on every navigation (location.state is a new ref each time)
  const stateKey = JSON.stringify(location.state);
  useEffect(() => {
    if (location.state) {
      setFilters(prev => ({ ...prev, ...location.state }));
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const processedItems = useMemo(() => {
    let result = filterItems(items, filters);
    if (filters.hideResolved) result = result.filter(i => !i.resolved);
    return sortItems(result, filters.sortBy);
  }, [items, filters]);

  const totalPages = Math.ceil(processedItems.length / ITEMS_PER_PAGE);
  const pagedItems = processedItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="page-wrapper browse-page">
      <div className="container">
        {/* ─── PAGE HEADER ─── */}
        <div className="browse-header animate-fadeInDown">
          <div>
            <h1>Browse Items</h1>
            <p>{processedItems.length} item{processedItems.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="browse-header-right">
            {/* Mobile filter toggle */}
            <button
              className="btn btn-secondary mobile-filter-btn"
              onClick={() => setMobileFiltersOpen(o => !o)}
            >
              🔧 Filters {mobileFiltersOpen ? '▲' : '▼'}
            </button>
            {/* View mode */}
            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="browse-search animate-fadeInDown" style={{ animationDelay: '0.1s' }}>
          <SearchBar
            value={filters.query}
            onChange={q => handleFilterChange({ ...filters, query: q })}
            placeholder="Search by title, category, location…"
          />
        </div>

        {/* ─── LAYOUT ─── */}
        <div className="browse-layout">
          {/* Filter Sidebar */}
          <div className={`filter-sidebar ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              itemCount={processedItems.length}
            />
          </div>

          {/* Items Grid */}
          <div className="browse-results">
            {pagedItems.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No items found"
                message="Try adjusting your search or filters to find what you're looking for."
                action={{ label: 'Reset Filters', onClick: handleReset }}
              />
            ) : (
              <>
                <div className={`items-grid ${viewMode === 'list' ? 'items-list' : ''}`}>
                  {pagedItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${(i % ITEMS_PER_PAGE) * 0.04}s` }}
                    >
                      <ItemCard item={item} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination animate-fadeInUp">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ← Prev
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === '...'
                            ? <span key={`e-${i}`} className="page-ellipsis">…</span>
                            : <button
                                key={p}
                                className={`page-btn ${page === p ? 'active' : ''}`}
                                onClick={() => setPage(p)}
                              >{p}</button>
                        )
                      }
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
