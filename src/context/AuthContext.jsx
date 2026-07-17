// context/AuthContext.jsx — CampusConnect (Supabase)
import { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const CURRENT_USER_KEY = 'cc_current_user';

const AuthContext = createContext(null);

// ─── Session helpers (localStorage for persistence) ───────────
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const storeUser = (user) => localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
const clearStoredUser = () => localStorage.removeItem(CURRENT_USER_KEY);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  // ─── LOGIN ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) return { success: false, error: 'No account found with this email.' };
    if (data.password !== password) return { success: false, error: 'Incorrect password.' };

    const { password: _pw, ...safeUser } = data;
    storeUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  // ─── SIGNUP ───────────────────────────────────────────────
  const signup = useCallback(async (userData) => {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email.toLowerCase().trim())
      .single();

    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        department: userData.department,
        year: userData.year,
        phone: userData.phone || '',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Signup error:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    const { password: _pw, ...safeUser } = data;
    storeUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────
  const logout = useCallback(() => {
    clearStoredUser();
    setCurrentUser(null);
  }, []);

  // ─── REFRESH USER (re-fetch from Supabase) ────────────────
  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) return;
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (data) {
      const { password: _pw, ...safeUser } = data;
      storeUser(safeUser);
      setCurrentUser(safeUser);
    }
  }, [currentUser?.id]);

  // ─── UPDATE USER ──────────────────────────────────────────
  const updateUser = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update profile.' };
    }

    const { password: _pw, ...safeUser } = data;
    storeUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  // ─── RESET PASSWORD ──────────────────────────────────────────
  const resetPassword = useCallback(async (email, newPassword) => {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (findError || !user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', user.id);

    if (updateError) {
      console.error('Reset password error:', updateError);
      return { success: false, error: 'Failed to reset password. Please try again.' };
    }

    return { success: true };
  }, []);

  // ─── SOCIAL LOGIN ──────────────────────────────────────────
  const socialLogin = useCallback(async (email, name) => {
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: name || email.split('@')[0],
          email: email.toLowerCase().trim(),
          password: 'social_login_no_password', 
          department: 'General',
          year: 'N/A',
          phone: '',
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Social signup error:', createError);
        return { success: false, error: 'Failed to create social account.' };
      }
      user = newUser;
    }

    const { password: _pw, ...safeUser } = user;
    storeUser(safeUser);
    setCurrentUser(safeUser);
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, refreshUser, updateUser, resetPassword, socialLogin, isLoggedIn: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
