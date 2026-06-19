'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '@/services/api';
import ThemeInjector from '@/components/ThemeInjector';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  organizationId?: string | null;
  subscriptionTier?: string | null;
}

interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const fetchOrganization = async () => {
    try {
      const res = await axiosInstance.get('/organizations');
      if (res.data.success && res.data.data.length > 0) {
        setOrganization(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch organization');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const verifySession = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        if (res.data.success && res.data.user && isMounted) {
          setUser(res.data.user);
          setStatus('authenticated');
          timeoutId = setTimeout(fetchOrganization, 100);
        } else if (isMounted) {
          setStatus('unauthenticated');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('unauthenticated');
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    setStatus('authenticated');
    setTimeout(fetchOrganization, 100);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    setUser(null);
    setOrganization(null);
    setStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ user, organization, status, login, logout }}>
      <ThemeInjector primaryColor={organization?.primaryColor} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
