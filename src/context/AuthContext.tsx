import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getUsers, saveUsers } from '../lib/storage';
import { fetchUsersFromSupabase, insertUserToSupabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isEmployee: boolean;
  hasAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  registerAdmin: (userData: {
    full_name: string;
    username: string;
    password: string;
    mobile_number: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkAdminExists: () => Promise<boolean>;
}

const AUTH_SESSION_KEY = 'plant_app_current_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [hasAdmin, setHasAdmin] = useState<boolean>(true);

  const checkAdminExists = async () => {
    const sbUsers = await fetchUsersFromSupabase();
    const users = sbUsers || getUsers();
    const exists = users.some((u) => u.role === 'admin');
    setHasAdmin(exists);
    return exists;
  };

  useEffect(() => {
    checkAdminExists();
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isEmployee = currentUser?.role === 'employee';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, [currentUser]);

  const refreshUser = async () => {
    if (!currentUser) return;
    const sbUsers = await fetchUsersFromSupabase();
    const users = sbUsers || getUsers();
    const updated = users.find((u) => u.id === currentUser.id);
    if (updated) {
      if (updated.status === 'inactive') {
        setCurrentUser(null);
      } else {
        setCurrentUser(updated);
      }
    }
    checkAdminExists();
  };

  const login = async (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const sbUsers = await fetchUsersFromSupabase();
    const users = sbUsers || getUsers();

    const found = users.find(
      (u) => u.username.toLowerCase() === trimmedUser && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (found.status === 'inactive') {
      return {
        success: false,
        error: 'Account is deactivated. Please contact the Administrator.',
      };
    }

    setCurrentUser(found);
    checkAdminExists();
    return { success: true, user: found };
  };

  const registerAdmin = async (userData: {
    full_name: string;
    username: string;
    password: string;
    mobile_number: string;
  }) => {
    const sbUsers = await fetchUsersFromSupabase();
    const users = sbUsers || getUsers();

    if (users.some((u) => u.role === 'admin')) {
      setHasAdmin(true);
      return {
        success: false,
        error: 'An Administrator account already exists. Admin registration is permanently closed.',
      };
    }

    const trimmedUser = userData.username.trim().toLowerCase();
    const existing = users.find((u) => u.username.toLowerCase() === trimmedUser);
    if (existing) {
      return { success: false, error: 'User with this username already exists.' };
    }

    const newUser: User = {
      id: `user-admin-${Date.now()}`,
      full_name: userData.full_name.trim(),
      username: userData.username.trim(),
      password: userData.password,
      mobile_number: userData.mobile_number.trim(),
      status: 'active',
      role: 'admin',
      created_at: new Date().toISOString(),
    };

    // Save to LocalStorage
    const updatedUsers = [newUser, ...users];
    saveUsers(updatedUsers);

    // Sync to Supabase
    await insertUserToSupabase(newUser);

    // Auto login
    setCurrentUser(newUser);
    setHasAdmin(true);

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isEmployee,
        hasAdmin,
        login,
        registerAdmin,
        logout,
        refreshUser,
        checkAdminExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
