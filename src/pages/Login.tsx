/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { getLoginErrorMessage } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { status, user, sessionMessage, clearSessionMessage, loginAction } = useAuth();

  const redirectedMessage =
    typeof location.state === 'object' &&
    location.state &&
    'sessionError' in location.state &&
    typeof location.state.sessionError === 'string'
      ? location.state.sessionError
      : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearSessionMessage();
    setIsLoading(true);

    try {
      const result = await loginAction(userId, password);
      if (result.user) {
        navigate('/login-success', { replace: true });
      } else {
        setError(getLoginErrorMessage(result.error));
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'authenticated' && user) {
    return <Navigate to="/login-success" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 pt-20 pb-10 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-brand-text mb-2">Portal Login</h1>
            <p className="text-brand-muted text-sm">
              Enter your credentials to access the DaaS secure portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(sessionMessage || redirectedMessage || error) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-start gap-3 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error || redirectedMessage || sessionMessage}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text ml-1">Employee ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                  className="block w-full pl-10 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200"
                  placeholder="e.g. EMP-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-text ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-brand-muted text-xs">
              This is a closed system. Each portal ID can only stay active in one browser session at a time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
