import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto fetch user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('sam-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          // Token expired
          localStorage.removeItem('sam-token');
        }
      } catch (err) {
        console.error('Failed to restore session:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return false;
      }
      localStorage.setItem('sam-token', data.token);
      
      // Fetch full profile info (e.g. coordinates, favorites, ratings)
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const fullProfile = await profileRes.json();
      setUser(fullProfile);
      return true;
    } catch (err) {
      setError('Network connection error');
      return false;
    }
  };

  const register = async (name, email, password, role, location) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, location })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return false;
      }
      localStorage.setItem('sam-token', data.token);
      
      // Get full profile
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const fullProfile = await profileRes.json();
      setUser(fullProfile);
      return true;
    } catch (err) {
      setError('Network connection error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('sam-token');
    setUser(null);
  };

  // Top up / Withdraw wallet credits
  const updateWallet = async (amount, type) => {
    const token = localStorage.getItem('sam-token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, type })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, walletBalance: data.walletBalance }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Toggle favorite farmer profiles
  const toggleFavorite = async (farmerId) => {
    const token = localStorage.getItem('sam-token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/favorite/${farmerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        // Reload user details
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const updated = await meRes.json();
        setUser(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateWallet, toggleFavorite, apiUrl: API_URL }}>
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
