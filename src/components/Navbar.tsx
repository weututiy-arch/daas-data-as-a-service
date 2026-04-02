import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronRight, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../services/authService';
import Logo from './Logo';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ isDark, toggleTheme }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, status, logoutAction } = useAuth();
  const isAuth = status === 'authenticated' && !!user;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    setIsOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Hire From Us', path: '/hire' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const dashboardPath = user ? getDashboardPath(user) : '/portal';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled 
          ? 'bg-brand-bg/80 backdrop-blur-md border-brand-border py-3' 
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Logo size={40} className="transition-transform group-hover:scale-105" />
            <span className="text-2xl font-bold tracking-tighter font-display text-brand-text">DaaS</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-brand-secondary',
                  location.pathname === link.path ? 'text-brand-secondary' : 'text-brand-text/70'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text/70 hover:text-brand-secondary"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuth ? (
              <Link
                to={dashboardPath}
                className="bg-brand-secondary text-brand-bg px-5 py-2 rounded-full text-sm font-bold hover:bg-brand-secondary/90 transition-all flex items-center group shadow-lg shadow-brand-secondary/20"
              >
                <LayoutDashboard className="mr-2 w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-brand-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-brand-primary/90 transition-all flex items-center group shadow-lg shadow-brand-primary/20"
              >
                Portal Login
                <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-brand-card transition-colors text-brand-text/70 hover:text-brand-secondary"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-text/70 hover:text-brand-text transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-brand-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-3 py-4 text-base font-medium rounded-md transition-colors',
                    location.pathname === link.path 
                      ? 'bg-brand-card text-brand-secondary' 
                      : 'text-brand-text/70 hover:bg-brand-card hover:text-brand-text'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAuth ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-brand-secondary text-brand-bg px-3 py-4 rounded-md text-base font-bold mt-4"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full text-center bg-brand-card border border-brand-border text-brand-text px-3 py-4 rounded-md text-base font-medium mt-2"
                  >
                    <LogOut className="mr-2 w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-brand-primary text-white px-3 py-4 rounded-md text-base font-medium mt-4"
                >
                  Portal Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
