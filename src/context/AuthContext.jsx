// context/AuthContext.jsx — CampusConnect
import { createContext, useContext, useState, useCallback } from 'react';
import {
  getCurrentUser, saveCurrentUser, clearCurrentUser,
  findUserByEmail, createUser,
} from '../utils/localStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser);

  // Login — returns { success, error }
  const login = useCallback((email, password) => {
    const user = findUserByEmail(email);
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.password !== password) return { success: false, error: 'Incorrect password.' };

    const { password: _pw, ...safeUser } = user;
    saveCurrentUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  // Signup — returns { success, error }
  const signup = useCallback((userData) => {
    const existing = findUserByEmail(userData.email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const newUser = createUser(userData);
    const { password: _pw, ...safeUser } = newUser;
    saveCurrentUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearCurrentUser();
    setCurrentUser(null);
  }, []);

  // Refresh currentUser from LS (e.g. after profile update)
  const refreshUser = useCallback(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, refreshUser, isLoggedIn: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
