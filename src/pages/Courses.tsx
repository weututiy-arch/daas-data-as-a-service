import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  BarChart, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { COURSE_PAYMENT_URL, EXCHANGE_RATE, formatCurrency } from '../constants';
import DynamicImage from '../components/DynamicImage';
import { getCourseVisual } from '../lib/course-visuals';

const COURSES = [
  {
    id: 1,
    title: 'Data Engineering Masterclass',
    category: 'Data Engineering',
    duration: '12 Weeks',
    level: 'Advanced',
    price: 1299 * EXCHANGE_RATE,
    rating: 4.9,
    students: 1240,
    description: 'Master the art of building scalable data pipelines using Spark, Kafka, and Airflow. Learn to architect robust data systems for modern enterprises.'
  },
  {
    id: 2,
    title: 'AI & Machine Learning Ops',
    category: 'Artificial Intelligence',
    duration: '16 Weeks',
    level: 'Expert',
    price: 1599 * EXCHANGE_RATE,
    rating: 4.8,
    students: 850,
    description: 'Bridge the gap between ML models and production. Deep dive into MLOps, model monitoring, and automated deployment strategies.'
  },
  {
    id: 3,
    title: 'Full-Stack Data Solutions',
    category: 'Full Stack',
    duration: '10 Weeks',
    level: 'Intermediate',
    price: 999 * EXCHANGE_RATE,
    rating: 4.7,
    students: 2100,
    description: 'Learn to build end-to-end data applications. From database design to frontend visualization, master the entire stack.'
  },
  {
    id: 4,
    title: 'Predictive Analytics for Business',
    category: 'Business Intelligence',
    duration: '8 Weeks',
    level: 'Intermediate',
    price: 799 * EXCHANGE_RATE,
    rating: 4.6,
    students: 1500,
    description: 'Transform raw data into actionable business insights. Master statistical modeling and predictive forecasting techniques.'
  },
  {
    id: 5,
    title: 'Cloud Architecture & Security',
    category: 'Cloud Computing',
    duration: '14 Weeks',
    level: 'Advanced',
    price: 1399 * EXCHANGE_RATE,
    rating: 4.9,
    students: 920,
    description: 'Design secure, resilient, and high-performance cloud infrastructures. Focus on AWS, Azure, and GCP security best practices.'
  },
  {
    id: 6,
    title: 'Natural Language Processing',
    category: 'Artificial Intelligence',
    duration: '12 Weeks',
    level: 'Advanced',
    price: 1199 * EXCHANGE_RATE,
    rating: 4.8,
    students: 740,
    description: 'Explore the world of LLMs and text analysis. Build sophisticated NLP models for sentiment analysis, translation, and more.'
  }
];

const CATEGORIES = ['All', 'Data Engineering', 'Artificial Intelligence', 'Full Stack', 'Business Intelligence', 'Cloud Computing'];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-24 bg-brand-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-brand-text"
            >
              Elite <span className="text-brand-primary">Learning</span> Catalog
            </motion.h1>
            <p className="text-brand-text/60 text-lg">
              Industry-vetted curriculum designed to transform your professional trajectory.
            </p>
          </div>

          <a
            href={COURSE_PAYMENT_URL}
            className="w-full md:w-auto bg-brand-card border border-white/10 rounded-2xl p-4 shadow-xl hover:border-brand-primary/30 hover:-translate-y-0.5 transition-all"
            aria-label="Open secure course payment gateway"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-brand-text">Secure course payments</div>
                <div className="text-xs text-brand-text/50">Every paid enrollment redirects to Razorpay</div>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-secondary ml-auto" />
            </div>
          </a>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-brand-card border border-white/5 p-4 rounded-2xl mb-12 flex flex-col lg:flex-row gap-4 items-center shadow-xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search for skills, tools, or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg border border-white/10 rounded-xl py-3 pl-12 pr-4 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            <Filter className="text-brand-text/40 w-5 h-5 mr-2 hidden lg:block" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border",
                  selectedCategory === cat 
                    ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                    : "bg-brand-bg text-brand-text/60 border-white/10 hover:border-white/20 hover:text-brand-text"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-brand-secondary/15 bg-brand-secondary/5 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-secondary">Paid courses only</p>
          <p className="mt-2 text-sm text-brand-text/60">
            Clicking any course card will take the learner to your live Razorpay payment page for secure enrollment.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, i) => (
              (() => {
                const visual = getCourseVisual(course.title);
                return (
              <motion.a
                layout
                key={course.id}
                href={COURSE_PAYMENT_URL}
                aria-label={`Pay for ${course.title}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group bg-brand-card border border-white/5 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-brand-secondary/5 hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="h-48 bg-brand-bg relative overflow-hidden">
                  <DynamicImage 
                    prompt={visual.prompt}
                    alt={course.title}
                    seed={`course_${course.id}`}
                    aspectRatio="16:9"
                    fallbackTitle={course.title}
                    fallbackSubtitle={visual.subtitle}
                    fallbackVariant="course"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 bg-brand-card/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-text/70 border border-white/5">
                    {course.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex items-center bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] text-white">
                      <BarChart className="w-3 h-3 mr-1 text-brand-secondary" />
                      {course.level}
                    </div>
                    <div className="flex items-center bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] text-white">
                      <Clock className="w-3 h-3 mr-1 text-brand-secondary" />
                      {course.duration}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-brand-text group-hover:text-brand-secondary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-brand-text/50 text-sm mb-6 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-brand-text">{formatCurrency(course.price)}</span>
                      <div className="text-[10px] text-brand-text/40 uppercase tracking-widest font-bold">One-time payment via Razorpay</div>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/20">
                      Pay Now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-brand-secondary font-semibold">
                    Secure checkout redirect
                  </div>
                </div>
              </motion.a>
                );
              })()
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-brand-card rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <Search className="text-brand-text/20 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2">No courses found</h3>
            <p className="text-brand-text/40">Try adjusting your search or filter to find what you're looking for.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
              className="mt-6 text-brand-secondary font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;
