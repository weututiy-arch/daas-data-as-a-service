import React, { useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../services/authService';

export default function LoginSuccess() {
  const navigate = useNavigate();
  const { user, status } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    const timeout = window.setTimeout(() => {
      navigate(getDashboardPath(user), { replace: true });
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [navigate, user]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 pt-20 pb-10 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg"
      >
        <div className="bg-brand-card border border-brand-border rounded-3xl p-10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
            <CheckCircle2 size={42} />
          </div>
          <h1 className="text-4xl font-bold text-brand-text mb-3">Login Successful</h1>
          <p className="text-brand-muted text-lg mb-2">
            Welcome back, {user.name}.
          </p>
          <p className="text-brand-muted text-sm mb-8">
            Your secure portal access has been verified. Redirecting you now.
          </p>

          <Link
            to={getDashboardPath(user)}
            className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Continue
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
