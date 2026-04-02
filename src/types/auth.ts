export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isActive?: boolean;
}

export interface AdminPortalUser extends User {
  isActive: boolean;
  hasActiveSession?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type LoginErrorCode = 'INVALID_CREDENTIALS' | 'ALREADY_ACTIVE_ELSEWHERE' | 'ACCOUNT_DISABLED';

export interface LoginResult {
  user: User | null;
  error?: LoginErrorCode;
}
