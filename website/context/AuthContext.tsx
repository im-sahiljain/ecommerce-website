'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  User,
  setUser as reduxSetUser,
  updateUser as reduxUpdateUser,
  logout as reduxLogout,
  setIsAuthOpen as reduxSetIsAuthOpen,
} from '../store/slices/authSlice';

export interface UserAddress {
  id: string;
  userIdentifier: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  addresses: UserAddress[];
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  login: (identifier: string, password?: string, name?: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  fetchAddresses: () => Promise<UserAddress[]>;
  addAddress: (addressData: Omit<UserAddress, 'id' | 'userIdentifier'>) => Promise<UserAddress | null>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthOpen = useAppSelector((state) => state.auth.isAuthOpen);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [token]);

  const fetchAddresses = async (): Promise<UserAddress[]> => {
    if (!token) return [];
    try {
      const res = await fetch('http://localhost:5000/api/users/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddresses(data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend fetchAddresses notice:', err);
    }
    return [];
  };

  const addAddress = async (addressData: Omit<UserAddress, 'id' | 'userIdentifier'>): Promise<UserAddress | null> => {
    if (!token) return null;
    try {
      const res = await fetch('http://localhost:5000/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      if (res.ok) {
        const newAddr = await res.json();
        setAddresses(prev => {
          if (newAddr.isDefault) {
            return [...prev.map(a => ({ ...a, isDefault: false })), newAddr];
          }
          return [...prev, newAddr];
        });
        return newAddr;
      }
    } catch (err) {
      console.warn('Backend addAddress notice:', err);
    }
    return null;
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`http://localhost:5000/api/users/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addressId })));
        return true;
      }
    } catch (err) {
      console.warn('Backend setDefaultAddress notice:', err);
    }
    return false;
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`http://localhost:5000/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a.id !== addressId));
        return true;
      }
    } catch (err) {
      console.warn('Backend deleteAddress notice:', err);
    }
    return false;
  };

  const login = async (identifier: string, password?: string, name?: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, name }),
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        dispatch(reduxSetUser({ user: data.user, token: data.token }));
        dispatch(reduxSetIsAuthOpen(false));
        return true;
      }
    } catch (err) {
      const fallbackUser = { id: `usr-${Date.now()}`, identifier, name: name || identifier.split('@')[0] };
      const fallbackToken = btoa(JSON.stringify(fallbackUser));
      dispatch(reduxSetUser({ user: fallbackUser, token: fallbackToken }));
      dispatch(reduxSetIsAuthOpen(false));
      return true;
    }
    return false;
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    dispatch(reduxUpdateUser(profileData));
    if (!token) return true;

    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        dispatch(reduxUpdateUser(data.user));
        return true;
      }
    } catch (err) {
      console.warn('Backend profile update notice:', err);
    }
    return true;
  };

  const logout = () => {
    dispatch(reduxLogout());
    setAddresses([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        addresses,
        isAuthOpen,
        openAuth: () => dispatch(reduxSetIsAuthOpen(true)),
        closeAuth: () => dispatch(reduxSetIsAuthOpen(false)),
        login,
        updateProfile,
        fetchAddresses,
        addAddress,
        setDefaultAddress,
        deleteAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
