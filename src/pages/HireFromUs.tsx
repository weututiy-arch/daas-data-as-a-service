import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  ShieldCheck,
  Building2,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { EXCHANGE_RATE, CURRENCY_SYMBOL, formatCurrency } from '../constants';
import DynamicImage from '../components/DynamicImage';
import MentorPortrait from '../components/MentorPortrait';
import { HIRE_HERO_MENTOR_PROMPT } from '../lib/course-visuals';

const HireFromUs = () => {
  const stats = [
    { label: 'Placement Rate', value: '94%', icon: TrendingUp },
    { label: 'Avg. Base Salary', value: `${formatCurrency((115 * EXCHANGE_RATE) / 100)}L`, icon: Briefcase },
    { label: 'Alumni Network', value: '12k+', icon: Users },
    { label: 'Partner Brands', value: '500+', icon: Globe },
  ];

  const successStories = [
    {
      name: 'Sarah Chen',
      role: 'Senior Data Engineer',
      company: 'TechFlow Systems',
      quote: "The DAAS curriculum was the catalyst for my transition into high-scale data engineering. The project-based approach is exactly what top-tier companies are looking for."
    },
    {
      name: 'Marcus Rodriguez',
      role: 'MLOps Lead',
      company: 'Nexus AI',
      quote: "Hiring from DAAS has been a game-changer for our team. Their graduates don't just know the theory; they understand how to deliver production-ready solutions."
    },
    {
      name: 'Elena Volkov',
      role: 'Cloud Architect',
      company: 'Global Cloud Corp',
      quote: "The depth of technical knowledge combined with business acumen makes DAAS alumni stand out in every interview process."
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-brand-bg min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-brand-secondary/10 px-3 py-1 rounded-full mb-6 border border-brand-secondary/20">
              <Building2 className="text-brand-secondary w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">B2B Talent Solutions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-brand-text">
              Hire the Next Generation of <span className="text-brand-secondary">Tech Leaders</span>.
            </h1>
            <p className="text-xl text-brand-text/60 mb-10 leading-relaxed">
              Skip the traditional recruitment grind. Access a pre-vetted pool of high-performing specialists trained in the most critical data and AI domains.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="#contact-form" className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold hover:bg-brand-primary/90 transition-all text-center shadow-xl shadow-brand-primary/20">
                Partner With Us
              </a>
              <a href="#stats" className="bg-brand-card border border-white/10 text-brand-text px-8 py-4 rounded-full font-bold hover:bg-brand-card/80 transition-all text-center">
                View Talent Stats
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-video bg-brand-card rounded-3xl border border-brand-border overflow-hidden shadow-2xl relative">
              <DynamicImage 
                prompt={HIRE_HERO_MENTOR_PROMPT}
                alt="B2B Talent Solutions"
                seed="hire_hero"
                aspectRatio="16:9"
                fallbackTitle="Mentor-Led Talent Network"
                fallbackSubtitle="Experienced mentors and job-ready specialists for modern teams."
                fallbackVariant="hero"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-center bg-black/20 backdrop-blur-[2px]">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 bg-brand-bg/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                      <div className="w-10 h-10 bg-brand-secondary/20 rounded-full flex items-center justify-center border border-brand-secondary/30">
                        <CheckCircle2 className="text-brand-secondary w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-white/20 rounded-full w-3/4 mb-2"></div>
                        <div className="h-2 bg-white/10 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating Element */}
            <div className="absolute -bottom-6 -left-6 bg-brand-card p-6 rounded-2xl border border-white/10 shadow-2xl max-w-[240px]">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex -space-x-2">
                  {[
                    { name: 'Ava Patel', role: 'Placement Mentor' },
                    { name: 'Noah Kim', role: 'Cloud Mentor' },
                    { name: 'Mia Foster', role: 'Data Mentor' },
                  ].map((mentor) => (
                    <div key={mentor.name} className="border-2 border-brand-card rounded-full overflow-hidden">
                      <MentorPortrait name={mentor.name} role={mentor.role} seed={`hire_badge_${mentor.name}`} size={32} />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-text/60">+450 Hired</span>
              </div>
              <p className="text-sm font-medium text-brand-text">Top talent placed this month across 12 countries.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section id="stats" className="py-24 bg-brand-card/30 border-y border-white/5 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-bg rounded-xl mb-6 border border-white/5">
                  <stat.icon className="text-brand-secondary w-6 h-6" />
                </div>
                <div className="text-4xl font-bold text-brand-text mb-2">{stat.value}</div>
                <div className="text-brand-text/40 text-xs uppercase tracking-widest font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-text mb-4">Success Stories</h2>
          <p className="text-brand-text/60 max-w-2xl mx-auto">Hear from the professionals and companies that have transformed through our platform.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-brand-card p-8 rounded-3xl border border-white/5 shadow-lg relative"
            >
              <MessageSquare className="absolute top-8 right-8 text-brand-secondary/20 w-8 h-8" />
              <div className="flex items-center space-x-4 mb-6">
                <MentorPortrait
                  name={story.name}
                  role={story.role}
                  company={story.company}
                  seed={`success_story_${story.name}`}
                />
                <div>
                  <h4 className="font-bold text-brand-text">{story.name}</h4>
                  <p className="text-xs text-brand-secondary font-medium">{story.role} @ {story.company}</p>
                </div>
              </div>
              <p className="text-brand-text/60 italic leading-relaxed">
                "{story.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lead Gen Form */}
      <section id="contact-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-card p-10 md:p-16 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 text-center">Ready to scale your team?</h2>
            <p className="text-brand-text/60 text-center mb-12">Fill out the form below and our corporate relations team will get in touch within 24 hours.</p>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Work Email</label>
                <input 
                  type="email" 
                  placeholder="hr@company.com"
                  className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Hiring Needs</label>
                <select className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all appearance-none">
                  <option>Data Engineering</option>
                  <option>AI & Machine Learning</option>
                  <option>Full Stack Development</option>
                  <option>Cloud Architecture</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-text/40 ml-1">Additional Details</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about the roles you're looking to fill..."
                  className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all resize-none"
                ></textarea>
              </div>
              <div className="md:col-span-2 pt-4">
                <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center group">
                  Send Inquiry
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 blur-[100px] -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 blur-[100px] -z-0"></div>
        </div>
      </section>
    </div>
  );
};

export default HireFromUs;
