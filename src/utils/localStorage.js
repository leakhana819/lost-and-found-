// utils/localStorage.js — CampusConnect
// Centralized LocalStorage read/write helpers

const KEYS = {
  USERS:        'cc_users',
  CURRENT_USER: 'cc_current_user',
  ITEMS:        'cc_items',
  NOTIFICATIONS:'cc_notifications',
  CLAIMS:       'cc_claims',
  THEME:        'cc_theme',
  SEEDED:       'cc_seeded',
  DEVICE_SOCIAL:'cc_device_social',
};

export { KEYS };

// Generic helpers
export const lsGet = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
};

export const lsRemove = (key) => {
  localStorage.removeItem(key);
};

// ─── USERS ───────────────────────────────
export const getUsers = () => lsGet(KEYS.USERS, []);
export const saveUsers = (users) => lsSet(KEYS.USERS, users);

export const getCurrentUser = () => lsGet(KEYS.CURRENT_USER, null);
export const saveCurrentUser = (user) => lsSet(KEYS.CURRENT_USER, user);
export const clearCurrentUser = () => lsRemove(KEYS.CURRENT_USER);

export const findUserByEmail = (email) =>
  getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

export const createUser = (userData) => {
  const users = getUsers();
  const newUser = { ...userData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  saveUsers([...users, newUser]);
  return newUser;
};

export const updateUserById = (id, updates) => {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsers(users);
  const currentUser = getCurrentUser();
  if (currentUser?.id === id) saveCurrentUser({ ...currentUser, ...updates });
  return users.find(u => u.id === id);
};

// ─── ITEMS ───────────────────────────────
export const getItems = () => lsGet(KEYS.ITEMS, []);
export const saveItems = (items) => lsSet(KEYS.ITEMS, items);

export const getItemById = (id) => getItems().find(i => i.id === id);

export const createItem = (itemData) => {
  const items = getItems();
  const newItem = {
    ...itemData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolved: false,
    claimedBy: null,
    claimRequests: [],
    comments: [],
  };
  saveItems([newItem, ...items]);
  return newItem;
};

export const updateItem = (id, updates) => {
  const items = getItems().map(i =>
    i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
  );
  saveItems(items);
  return items.find(i => i.id === id);
};

export const deleteItem = (id) => {
  saveItems(getItems().filter(i => i.id !== id));
};

// ─── NOTIFICATIONS ───────────────────────
export const getNotifications = () => lsGet(KEYS.NOTIFICATIONS, []);
export const saveNotifications = (n) => lsSet(KEYS.NOTIFICATIONS, n);

export const createNotification = (data) => {
  const notifications = getNotifications();
  const n = { ...data, id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString() };
  saveNotifications([n, ...notifications]);
  return n;
};

export const markNotificationRead = (id) => {
  const notifications = getNotifications().map(n =>
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(notifications);
};

export const markAllNotificationsRead = (userId) => {
  const notifications = getNotifications().map(n =>
    n.toUser === userId ? { ...n, read: true } : n
  );
  saveNotifications(notifications);
};

export const deleteNotification = (id) => {
  saveNotifications(getNotifications().filter(n => n.id !== id));
};

export const getUnreadCount = (userId) =>
  getNotifications().filter(n => n.toUser === userId && !n.read).length;

// ─── CLAIMS ──────────────────────────────
export const getClaims = () => lsGet(KEYS.CLAIMS, []);
export const saveClaims = (claims) => lsSet(KEYS.CLAIMS, claims);

export const createClaim = (claimData) => {
  const claims = getClaims();
  const c = { ...claimData, id: crypto.randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
  saveClaims([c, ...claims]);
  return c;
};

export const updateClaim = (id, updates) => {
  const claims = getClaims().map(c => c.id === id ? { ...c, ...updates } : c);
  saveClaims(claims);
};

// ─── THEME ───────────────────────────────
export const getTheme = () => lsGet(KEYS.THEME, 'light');
export const saveTheme = (theme) => lsSet(KEYS.THEME, theme);

// ─── SEED FLAG ───────────────────────────
export const isSeeded = () => lsGet(KEYS.SEEDED, false);
export const markSeeded = () => lsSet(KEYS.SEEDED, true);

// ─── DEVICE SOCIAL ACCOUNTS ──────────────
export const getDeviceSocialAccounts = (provider) => {
  const accounts = lsGet(KEYS.DEVICE_SOCIAL, {});
  return accounts[provider] || [];
};

export const addDeviceSocialAccount = (provider, email) => {
  const accounts = lsGet(KEYS.DEVICE_SOCIAL, {});
  if (!accounts[provider]) accounts[provider] = [];
  if (!accounts[provider].includes(email)) {
    accounts[provider].push(email);
    lsSet(KEYS.DEVICE_SOCIAL, accounts);
  }
};
