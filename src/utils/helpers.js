// utils/helpers.js — CampusConnect
// Date formatting, string utilities, category config

// ─── DATE ────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── STRING ──────────────────────────────
export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n).trim() + '…' : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── CATEGORIES ──────────────────────────
export const CATEGORIES = [
  { value: 'electronics',  label: 'Electronics',  icon: '📱', color: '#6366f1' },
  { value: 'documents',    label: 'Documents',    icon: '📄', color: '#8b5cf6' },
  { value: 'clothing',     label: 'Clothing',     icon: '👕', color: '#06b6d4' },
  { value: 'accessories',  label: 'Accessories',  icon: '⌚', color: '#f59e0b' },
  { value: 'bags',         label: 'Bags & Wallets',icon: '🎒',color: '#10b981' },
  { value: 'keys',         label: 'Keys',         icon: '🔑', color: '#ef4444' },
  { value: 'books',        label: 'Books & Notes', icon: '📚', color: '#3b82f6' },
  { value: 'sports',       label: 'Sports Items',  icon: '⚽', color: '#14b8a6' },
  { value: 'food',         label: 'Food Items',    icon: '🍱', color: '#f97316' },
  { value: 'other',        label: 'Other',        icon: '📦', color: '#64748b' },
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

// ─── LOCATIONS ───────────────────────────
export const LOCATIONS = [
  'Library',
  'Cafeteria',
  'Main Gate',
  'Block A',
  'Block B',
  'Block C',
  'Lab 1',
  'Lab 2',
  'Sports Ground',
  'Hostel Block',
  'Admin Block',
  'Parking Area',
  'Auditorium',
  'Seminar Hall',
  'Other',
];

// ─── DEPARTMENTS ─────────────────────────
export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'MBA',
  'MCA',
  'BCA',
  'Other',
];

// ─── ITEM TYPES ──────────────────────────
export const ITEM_TYPES = ['lost', 'found'];

// ─── SORT OPTIONS ────────────────────────
export const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'category', label: 'By Category' },
  { value: 'location', label: 'By Location' },
];

// ─── GENERATE GRADIENT FROM STRING ───────
export const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
};

// ─── FILTER ITEMS ────────────────────────
export const filterItems = (items, filters) => {
  return items.filter(item => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.location && item.location !== filters.location) return false;
    if (filters.resolved !== undefined && item.resolved !== filters.resolved) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (
        !item.title?.toLowerCase().includes(q) &&
        !item.description?.toLowerCase().includes(q) &&
        !item.location?.toLowerCase().includes(q) &&
        !item.category?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });
};

export const sortItems = (items, sortBy) => {
  const arr = [...items];
  switch (sortBy) {
    case 'oldest':   return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'category': return arr.sort((a, b) => a.category?.localeCompare(b.category));
    case 'location': return arr.sort((a, b) => a.location?.localeCompare(b.location));
    default:         return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};
