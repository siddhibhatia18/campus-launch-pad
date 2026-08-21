import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, getStudentProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clp_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load authenticated user on initial app mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('clp_token');
      if (storedToken) {
        try {
          const res = await getCurrentUser();
          setUser(res.user);
          setProfile(res.profile);
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('clp_token');
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('clp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      return { success: true, user: res.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async (formData) => {
    setError(null);
    try {
      const res = await registerUser(formData);
      localStorage.setItem('clp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      return { success: true, user: res.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please verify your details.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('clp_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setError(null);
  };

  // Refresh profile from backend
  const refreshProfile = async () => {
    try {
      if (user && user.role === 'student') {
        const res = await getStudentProfile();
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        error,
        login,
        register,
        logout,
        setProfile,
        refreshProfile,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
