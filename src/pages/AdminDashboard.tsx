import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  KeyRound,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  UserPlus,
  Users,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  createAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  revokeAdminUserSession,
  updateAdminUserStatus,
} from '../services/adminService';
import type { AdminPortalUser, UserRole } from '../types/auth';

const formatTimestamp = (value: number) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);

const describeError = (error: unknown) => {
  if (error instanceof Error) {
    switch (error.message) {
      case 'USER_EXISTS':
        return 'That portal ID already exists. Choose a unique ID.';
      case 'INVALID_INPUT':
        return 'Please complete all fields with a strong password of at least 8 characters.';
      case 'CANNOT_DISABLE_SELF':
        return 'You cannot disable your own active admin account.';
      case 'UNAUTHORIZED':
        return 'Your admin session expired. Please sign in again.';
      case 'FORBIDDEN':
        return 'Only admin accounts can manage portal users.';
      default:
        return 'Something went wrong while updating the portal users.';
    }
  }

  return 'Something went wrong while updating the portal users.';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logoutAction } = useAuth();
  const [portalUsers, setPortalUsers] = useState<AdminPortalUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [busyUserIds, setBusyUserIds] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'employee' as UserRole,
    password: '',
  });

  const loadUsers = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoadingUsers(true);
    }

    try {
      const users = await fetchAdminUsers();
      setPortalUsers(users);
      setError('');
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsLoadingUsers(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    navigate('/login');
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotice('');

    try {
      await createAdminUser(form);
      setForm({
        id: '',
        name: '',
        email: '',
        role: 'employee',
        password: '',
      });
      setNotice('Portal user created successfully.');
      await loadUsers({ silent: true });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const runUserAction = async (targetId: string, action: () => Promise<void>, successMessage: string) => {
    setBusyUserIds(prev => ({ ...prev, [targetId]: true }));
    setError('');
    setNotice('');

    try {
      await action();
      setNotice(successMessage);
      await loadUsers({ silent: true });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusyUserIds(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const totalUsers = portalUsers.length;
  const activeUsers = portalUsers.filter(item => item.isActive).length;
  const liveSessions = portalUsers.filter(item => item.hasActiveSession).length;
  const adminCount = portalUsers.filter(item => item.role === 'admin').length;

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">Admin Access Control</h1>
            <p className="text-brand-muted">Manage portal users, sessions, and credentials from one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => void loadUsers({ silent: true })}
              className="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-brand-secondary text-brand-text px-4 py-2 rounded-lg transition-all duration-200"
            >
              <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-brand-card border border-brand-border hover:border-brand-primary text-brand-text px-4 py-2 rounded-lg transition-all duration-200"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {(error || notice) && (
          <div
            className={`border rounded-2xl px-4 py-3 text-sm flex items-start gap-3 ${
              error
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}
          >
            {error ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
            <span>{error || notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: 'Portal Users', value: totalUsers, icon: Users, tone: 'text-brand-secondary' },
            { label: 'Active Accounts', value: activeUsers, icon: ShieldCheck, tone: 'text-emerald-500' },
            { label: 'Live Sessions', value: liveSessions, icon: Database, tone: 'text-brand-primary' },
            { label: 'Admin Accounts', value: adminCount, icon: KeyRound, tone: 'text-amber-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-brand-bg border border-brand-border ${stat.tone}`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <p className="text-brand-muted text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-brand-text">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,1.7fr] gap-8">
          <section className="bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                <UserPlus size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-text">Create Portal User</h2>
                <p className="text-brand-muted text-sm">Provision a new employee or admin account directly into the database.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Portal ID</span>
                  <input
                    value={form.id}
                    onChange={(event) => setForm(prev => ({ ...prev, id: event.target.value.toUpperCase() }))}
                    placeholder="EMP-200"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Role</span>
                  <select
                    value={form.role}
                    onChange={(event) => setForm(prev => ({ ...prev, role: event.target.value as UserRole }))}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Full Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm(prev => ({ ...prev, name: event.target.value }))}
                  placeholder="Aarav Mehta"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm(prev => ({ ...prev, email: event.target.value }))}
                  placeholder="aarav@daas.ai"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Temporary Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm(prev => ({ ...prev, password: event.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all disabled:opacity-70"
              >
                {isSubmitting ? <RefreshCcw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Create User
              </button>
            </form>
          </section>

          <section className="bg-brand-card border border-brand-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-text">Portal User Directory</h2>
                <p className="text-brand-muted text-sm">Enable or disable users, reset passwords, and revoke live sessions.</p>
              </div>
              <div className="text-sm text-brand-muted">
                Signed in as <span className="font-semibold text-brand-text">{user?.id}</span>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="h-56 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {portalUsers.map((portalUser) => {
                  const isBusy = !!busyUserIds[portalUser.id];
                  const passwordDraft = passwordDrafts[portalUser.id] || '';

                  return (
                    <div key={portalUser.id} className="border border-brand-border rounded-2xl bg-brand-bg p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-brand-text">{portalUser.name}</h3>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary">
                              {portalUser.role}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                portalUser.isActive
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'bg-slate-500/10 text-slate-400'
                              }`}
                            >
                              {portalUser.isActive ? 'Enabled' : 'Disabled'}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                portalUser.hasActiveSession
                                  ? 'bg-brand-secondary/10 text-brand-secondary'
                                  : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
                              {portalUser.hasActiveSession ? 'Session Active' : 'No Live Session'}
                            </span>
                          </div>
                          <div className="text-sm text-brand-muted space-y-1">
                            <p><span className="text-brand-text font-medium">ID:</span> {portalUser.id}</p>
                            <p><span className="text-brand-text font-medium">Email:</span> {portalUser.email}</p>
                            <p><span className="text-brand-text font-medium">Updated:</span> {formatTimestamp(portalUser.updatedAt)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-full lg:min-w-[320px] lg:max-w-[380px]">
                          <button
                            onClick={() =>
                              void runUserAction(
                                portalUser.id,
                                async () => {
                                  await updateAdminUserStatus(portalUser.id, !portalUser.isActive);
                                },
                                portalUser.isActive ? `${portalUser.id} disabled and signed out.` : `${portalUser.id} re-enabled successfully.`
                              )
                            }
                            disabled={isBusy}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                              portalUser.isActive
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/15'
                            } disabled:opacity-60`}
                          >
                            {portalUser.isActive ? 'Disable User' : 'Enable User'}
                          </button>
                          <button
                            onClick={() =>
                              void runUserAction(
                                portalUser.id,
                                async () => {
                                  await revokeAdminUserSession(portalUser.id);
                                },
                                `${portalUser.id} has been signed out from the active session.`
                              )
                            }
                            disabled={isBusy || !portalUser.hasActiveSession}
                            className="px-4 py-3 rounded-xl font-semibold border border-brand-border text-brand-text hover:border-brand-secondary disabled:opacity-50"
                          >
                            Force Sign Out
                          </button>
                          <input
                            type="password"
                            value={passwordDraft}
                            onChange={(event) =>
                              setPasswordDrafts(prev => ({
                                ...prev,
                                [portalUser.id]: event.target.value,
                              }))
                            }
                            placeholder="New password"
                            className="sm:col-span-2 bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                          <button
                            onClick={() =>
                              void runUserAction(
                                portalUser.id,
                                async () => {
                                  await resetAdminUserPassword(portalUser.id, passwordDraft);
                                  setPasswordDrafts(prev => ({ ...prev, [portalUser.id]: '' }));
                                },
                                `Password updated for ${portalUser.id}. Existing sessions were revoked.`
                              )
                            }
                            disabled={isBusy || passwordDraft.length < 8}
                            className="sm:col-span-2 px-4 py-3 rounded-xl font-semibold bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary/15 disabled:opacity-50"
                          >
                            Reset Password
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-brand-border bg-brand-bg p-4 text-sm text-brand-muted">
              Suggested next upgrades:
              IP allowlists, password rotation policies, login audit history, and role-based permissions beyond just admin or employee.
            </div>
          </section>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-brand-secondary" size={20} />
              <h3 className="font-bold text-brand-text">Where To Extend Next</h3>
            </div>
            <p className="text-sm text-brand-muted">
              Add login audit events in the auth server so every create, disable, reset, and login attempt is retained permanently.
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="text-brand-primary" size={20} />
              <h3 className="font-bold text-brand-text">Best Place For Policy</h3>
            </div>
            <p className="text-sm text-brand-muted">
              Put account rules in the server API, not the frontend, so the browser never becomes the authority for access control.
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <WifiOff className="text-amber-500" size={20} />
              <h3 className="font-bold text-brand-text">Session Hardening</h3>
            </div>
            <p className="text-sm text-brand-muted">
              A natural next step is device fingerprints or OTP verification for higher assurance on sensitive admin accounts.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
