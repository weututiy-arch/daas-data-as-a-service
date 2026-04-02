import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-bg border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <Logo size={32} className="transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold tracking-tighter font-display text-brand-text uppercase">DAAS</span>
            </Link>
            <p className="text-brand-text/60 text-sm leading-relaxed mb-6">
              Empowering the next generation of tech leaders through elite upskilling and connecting global enterprises with world-class talent.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-brand-text/40 hover:text-brand-secondary transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-brand-text/40 hover:text-brand-secondary transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-brand-text/40 hover:text-brand-secondary transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-brand-text">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/courses" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">All Courses</Link></li>
              <li><Link to="/hire" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Hire Talent</Link></li>
              <li><Link to="/about" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-brand-text">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Learning Path</a></li>
              <li><a href="#" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Enterprise Solutions</a></li>
              <li><a href="#" className="text-brand-text/50 text-sm hover:text-brand-secondary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-6 text-brand-text">Newsletter</h4>
            <p className="text-brand-text/50 text-sm mb-4">Get the latest tech insights and course updates.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="bg-brand-card border border-white/10 rounded-lg px-4 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
              />
              <button className="bg-brand-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-text/30 text-xs mb-4 md:mb-0">
            © {currentYear} DAAS (Data and AI Solutions). All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-brand-text/30 text-xs hover:text-brand-text transition-colors">Terms of Service</a>
            <a href="#" className="text-brand-text/30 text-xs hover:text-brand-text transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
