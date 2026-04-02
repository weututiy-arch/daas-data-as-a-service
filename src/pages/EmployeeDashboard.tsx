/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  LogOut, 
  User,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logoutAction } = useAuth();

  const handleLogout = async () => {
    await logoutAction();
    navigate('/login');
  };

  const stats = [
    { label: 'Courses Completed', value: '4', icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Ongoing Projects', value: '2', icon: TrendingUp, color: 'text-brand-primary' },
    { label: 'Learning Hours', value: '128h', icon: Clock, color: 'text-brand-secondary' },
    { label: 'Certifications', value: '3', icon: Award, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-text">Employee Portal</h1>
              <p className="text-brand-muted">Welcome back, {user?.name || 'Employee'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-brand-primary transition-colors duration-200 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-brand-card"></span>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-card border border-brand-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-brand-bg border border-brand-border ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-brand-muted text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-brand-text">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
                <BookOpen size={20} className="text-brand-primary" />
                Current Learning Path
              </h2>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-brand-text">Advanced AI Data Engineering</h3>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">75% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-brand-card rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-brand-primary w-3/4 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-muted">
                    <span>Next Module: Data Pipeline Optimization</span>
                    <span>12/16 Lessons</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-brand-text">Cloud Infrastructure for DaaS</h3>
                    <span className="text-xs font-bold text-brand-muted bg-brand-card px-2 py-1 rounded-full">Locked</span>
                  </div>
                  <div className="w-full h-2 bg-brand-card rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-brand-muted w-0 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-text mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-secondary" />
                Internal Announcements
              </h2>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-brand-text">New Data Security Protocols</p>
                      <p className="text-xs text-brand-muted">Mar 28, 2026</p>
                    </div>
                    <p className="text-sm text-brand-muted">
                      All employees are required to update their VPN client to version 4.5.2 by the end of this week...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-brand-primary" />
                Upcoming Events
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex flex-col items-center justify-center text-brand-primary">
                    <span className="text-xs font-bold">APR</span>
                    <span className="text-lg font-bold">02</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-text">AI Ethics Workshop</p>
                    <p className="text-xs text-brand-muted">10:00 AM - 12:00 PM</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex flex-col items-center justify-center text-brand-secondary">
                    <span className="text-xs font-bold">APR</span>
                    <span className="text-lg font-bold">05</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-text">Quarterly Town Hall</p>
                    <p className="text-xs text-brand-muted">02:00 PM - 03:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-secondary mb-2">Career Growth</h2>
              <p className="text-sm text-brand-text opacity-80">
                You've completed 80% of your required upskilling for this quarter. Keep it up!
              </p>
              <button className="mt-4 text-sm font-bold text-brand-secondary hover:underline flex items-center gap-1">
                View Career Map <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
