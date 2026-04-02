import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Award,
  Globe,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COURSE_PAYMENT_URL, EXCHANGE_RATE, formatCurrency } from '../constants';
import DynamicImage from '../components/DynamicImage';
import { getCourseVisual, HOME_VALUE_MENTOR_PROMPT } from '../lib/course-visuals';
import { mentorSceneAssets } from '../lib/mentor-photo-assets';

const Home = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="pt-20 bg-brand-bg min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-brand-card px-3 py-1 rounded-full mb-8 border border-brand-border"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-secondary animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-text/70">Now Enrolling for Q2 2026</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-text"
            >
              Master the Future of <span className="text-brand-primary">AI Data</span> & Technology.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-brand-muted mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              DaaS provides high-quality data for AI models and elite upskilling for professionals. We are the engine of the data-driven economy.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link 
                to="/courses" 
                className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-primary/90 transition-all flex items-center justify-center group shadow-xl shadow-brand-primary/20"
              >
                Explore Courses
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/hire" 
                className="w-full sm:w-auto bg-brand-card border border-brand-border text-brand-text px-8 py-4 rounded-full font-semibold text-lg hover:bg-brand-card/80 transition-all"
              >
                DaaS Solutions
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-brand-bg border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Data Points Provided', value: '1B+' },
              { label: 'Partner Companies', value: '500+' },
              { label: 'Placement Rate', value: '94%' },
              { label: 'Avg. Salary Hike', value: '65%' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 text-brand-text">{stat.value}</div>
                <div className="text-brand-muted text-sm uppercase tracking-widest font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-brand-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-brand-text">
                Two Pillars of <span className="text-brand-secondary">Excellence</span>.
              </h2>
              <div className="space-y-10">
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 bg-brand-card rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-brand-border">
                    <Zap className="text-brand-secondary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-text">For Professionals</h3>
                    <p className="text-brand-muted leading-relaxed">
                      Accelerate your career with project-based learning. Our curriculum is designed by industry veterans to ensure you master the skills that are in high demand today.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 bg-brand-card rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 border border-brand-border">
                    <ShieldCheck className="text-brand-secondary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-brand-text">For AI Enterprises</h3>
                    <p className="text-brand-muted leading-relaxed">
                      Access high-quality, pre-vetted datasets and custom data pipelines. We provide the fuel that powers the world's most advanced AI models.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-brand-card rounded-3xl shadow-2xl relative overflow-hidden border border-brand-border">
                <DynamicImage 
                  prompt={HOME_VALUE_MENTOR_PROMPT}
                  alt="DaaS Value Proposition"
                  seed="value_prop_home"
                  aspectRatio="1:1"
                  staticImageUrl={mentorSceneAssets.homeValue}
                  fallbackTitle="Mentor-Led AI Training"
                  fallbackSubtitle="Real experts guiding professionals into AI and data careers."
                  fallbackVariant="square"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 to-transparent"></div>
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-brand-secondary/20 rounded-full flex items-center justify-center backdrop-blur-md border border-brand-secondary/30">
                      <TrendingUp className="text-brand-secondary w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/20 rounded-full w-full mb-2"></div>
                      <div className="h-2 bg-brand-secondary/40 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center backdrop-blur-md border border-brand-primary/30">
                      <Users className="text-brand-primary w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/20 rounded-full w-full mb-2"></div>
                      <div className="h-2 bg-brand-primary/40 rounded-full w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-brand-primary text-white p-6 rounded-2xl shadow-xl max-w-[200px]">
                <Award className="w-8 h-8 text-white mb-3" />
                <p className="text-sm font-medium leading-tight">Voted #1 AI Data Solutions 2025</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section className="py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-4 text-brand-text">Popular Learning Paths</h2>
              <p className="text-brand-muted">Start your journey with our most sought-after specializations.</p>
            </div>
            <Link to="/courses" className="mt-6 md:mt-0 text-brand-secondary font-semibold flex items-center hover:underline">
              View All Courses <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Data Engineering Masterclass', duration: '12 Weeks', level: 'Advanced', price: 1299 * EXCHANGE_RATE },
              { title: 'AI & Machine Learning Ops', duration: '16 Weeks', level: 'Expert', price: 1599 * EXCHANGE_RATE },
              { title: 'Full-Stack Data Solutions', duration: '10 Weeks', level: 'Intermediate', price: 999 * EXCHANGE_RATE },
            ].map((course, i) => (
              <motion.a 
                href={COURSE_PAYMENT_URL}
                aria-label={`Pay for ${course.title}`}
                key={i}
                whileHover={{ y: -10 }}
                className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all block"
              >
                <div className="h-48 bg-brand-bg relative overflow-hidden">
                  <DynamicImage 
                    prompt={getCourseVisual(course.title).prompt}
                    alt={course.title}
                    seed={`home_course_${i}`}
                    aspectRatio="16:9"
                    fallbackTitle={course.title}
                    fallbackSubtitle={getCourseVisual(course.title).subtitle}
                    fallbackVariant="course"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 bg-brand-card/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-text/70 border border-brand-border">
                    {course.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-brand-text">{course.title}</h3>
                  <div className="flex items-center text-brand-muted text-sm mb-6">
                    <Zap className="w-4 h-4 mr-1 text-brand-secondary" />
                    {course.duration}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-text">{formatCurrency(course.price)}</span>
                    <span className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      Pay Now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-brand-secondary font-semibold">
                    Secure Razorpay checkout
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-card rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden border border-brand-border shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-brand-text mb-8">Ready to transform your <span className="text-brand-secondary">future</span>?</h2>
              <p className="text-brand-muted text-xl mb-12 max-w-2xl mx-auto">
                Join thousands of professionals and hundreds of companies already thriving with DaaS.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/courses" className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-full font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20">
                  Get Started Now
                </Link>
                <Link to="/contact" className="w-full sm:w-auto bg-transparent border border-brand-border text-brand-text px-8 py-4 rounded-full font-bold hover:bg-brand-muted/10 transition-all">
                  Talk to an Advisor
                </Link>
              </div>
            </div>
            
            {/* Abstract Background for CTA */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-secondary/5 blur-[100px] -z-0"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-brand-primary/5 blur-[100px] -z-0"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
