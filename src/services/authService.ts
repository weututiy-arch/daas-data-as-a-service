import type { LoginErrorCode, LoginResult, User } from '../types/auth';

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const getDashboardPath = (user: User) => user.role === 'admin' ? '/admin' : '/portal';

export const getLoginErrorMessage = (error?: LoginErrorCode) => {
  switch (error) {
    case 'ACCOUNT_DISABLED':
      return 'This account is disabled. Please contact your portal administrator.';
    case 'ALREADY_ACTIVE_ELSEWHERE':
      return 'This ID is already active in another device or browser. Please sign out there first.';
    case 'INVALID_CREDENTIALS':
    default:
      return 'Invalid ID or password. Only registered account owners can access the portal.';
  }
};

export const login = async (id: string, password: string): Promise<LoginResult> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      id: id.trim().toUpperCase(),
      password,
    }),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    return {
      user: null,
      error: payload?.error as LoginErrorCode | undefined,
    };
  }

  return {
    user: payload?.user || null,
  };
};

export const logout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await fetch('/api/auth/session', {
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJsonSafely(response);
  return payload?.user || null;
};
