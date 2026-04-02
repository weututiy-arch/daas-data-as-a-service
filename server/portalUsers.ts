import type { User, UserRole } from '../src/types/auth';

export interface PortalUserRecord extends User {
  passwordSalt: string;
  passwordHash: string;
}

export const PORTAL_USERS: PortalUserRecord[] = [
  {
    id: 'ADMIN-001',
    name: 'System Admin',
    role: 'admin',
    email: 'admin@daas.ai',
    passwordSalt: '7b329392957bf16cf9e3b68733b58307',
    passwordHash: '75284871e068ea996b7ccbbf56f4b75f483a16975a17635866be6f11a1846977f8b56cddee2a3cddc51aba7d545f7145c3b4ed6c4238219eead3a0437c7ca63b',
  },
  {
    id: 'EMP-101',
    name: 'John Doe',
    role: 'employee',
    email: 'john.doe@daas.ai',
    passwordSalt: '3bc78c4ba1b145e0ed1a48fcdcef83f1',
    passwordHash: '673ae2e3e7661da1f649d1bbfde417d5f44ffb0a3f3af68ea2e43a9f31c7b03e0bcdb16876350c439ca58e6644d0f14f4db8575bfbe84bfe3a62e2c32811f3d7',
  },
  {
    id: 'EMP-102',
    name: 'Jane Smith',
    role: 'employee',
    email: 'jane.smith@daas.ai',
    passwordSalt: '0833e3a60a6edcd5567602ae9bc3c853',
    passwordHash: 'ee8876e711116f0f2530f3b8ba068c84885cfb965fc262730fc3533ae5a5b5513cc6bb5f451c538a5364aabf852afaaac5a4700403a23722ec9cb6b92170b058',
  },
  {
    id: 'EMP-103',
    name: 'Aisha Khan',
    role: 'employee',
    email: 'aisha.khan@daas.ai',
    passwordSalt: 'f1eed01d89ef92436d24c5da0ac1fddd',
    passwordHash: '66ee925cf261d8ec17e7a133872ddfb0656b2020d9497edeea7248a8fef513063e0f417b0e23420d84bdfdc94d91ba24ac8714737f208082793a194cc2cdc446',
  },
];

export const toPublicUser = (user: PortalUserRecord | (User & { isActive?: boolean })): User => ({
  id: user.id,
  name: user.name,
  role: user.role,
  email: user.email,
  isActive: user.isActive ?? true,
});
