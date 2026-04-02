import type { AdminPortalUser, UserRole } from '../types/auth';

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const request = async (input: string, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    const error = payload?.error || 'REQUEST_FAILED';
    throw new Error(error);
  }

  return payload;
};

export const fetchAdminUsers = async (): Promise<AdminPortalUser[]> => {
  const payload = await request('/api/admin/users');
  return payload?.users || [];
};

export const createAdminUser = async (input: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}): Promise<AdminPortalUser> => {
  const payload = await request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      id: input.id.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
    }),
  });

  return payload.user;
};

export const updateAdminUserStatus = async (id: string, isActive: boolean): Promise<AdminPortalUser> => {
  const payload = await request(`/api/admin/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });

  return payload.user;
};

export const resetAdminUserPassword = async (id: string, password: string): Promise<AdminPortalUser> => {
  const payload = await request(`/api/admin/users/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

  return payload.user;
};

export const revokeAdminUserSession = async (id: string): Promise<void> => {
  await request(`/api/admin/users/${encodeURIComponent(id)}/revoke-session`, {
    method: 'POST',
  });
};
