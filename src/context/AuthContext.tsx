import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login, logout } from '../services/authService';
import type { LoginResult, User } from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  sessionMessage: string;
  loginAction: (id: string, password: string) => Promise<LoginResult>;
  logoutAction: () => Promise<void>;
  refreshSession: (options?: { silent?: boolean }) => Promise<User | null>;
  clearSessionMessage: () => void;
}

const SESSION_POLL_INTERVAL_MS = 15 * 1000;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [sessionMessage, setSessionMessage] = useState('');

  const refreshSession = async ({ silent = false }: { silent?: boolean } = {}) => {
    const previousUser = user;

    try {
      const nextUser = await getCurrentUser();
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');

      if (!nextUser && previousUser && !silent) {
        setSessionMessage('Your session ended because this ID is active elsewhere or your server session expired.');
      }

      return nextUser;
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  };

  useEffect(() => {
    void refreshSession();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    const syncSession = () => {
      void refreshSession();
    };

    const interval = window.setInterval(() => {
      void refreshSession({ silent: true });
    }, SESSION_POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status, user]);

  const loginAction = async (id: string, password: string) => {
    const result = await login(id, password);
    if (result.user) {
      setUser(result.user);
      setStatus('authenticated');
      setSessionMessage('');
    }

    return result;
  };

  const logoutAction = async () => {
    await logout();
    setUser(null);
    setStatus('unauthenticated');
    setSessionMessage('');
  };

  const clearSessionMessage = () => {
    setSessionMessage('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        sessionMessage,
        loginAction,
        logoutAction,
        refreshSession,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
