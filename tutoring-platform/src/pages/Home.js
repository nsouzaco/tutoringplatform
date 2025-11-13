import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div>
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20"
        >
          <span className="text-sm font-medium text-white">
            🚀 Join thousands of students and tutors worldwide
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            Connect with Expert Tutors for{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              One-on-One
            </span>{' '}
            Video Sessions
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-300"
          >
            Learn, grow, and achieve your goals with personalized tutoring powered by AI insights. 
            Book sessions that fit your schedule and get expert guidance when you need it most.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            {currentUser ? (
              <Link
                to="/dashboard"
                className="group h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-all flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="group h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90 transition-all flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          {/* Feature cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 mb-20 grid md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            <FeatureCard
              title="Flexible Scheduling"
              description="Browse available tutors and book sessions that fit your schedule."
            />
            <FeatureCard
              title="Live Video Sessions"
              description="Real-time video, chat, and collaborative notes for an engaging and effective learning experience."
            />
            <FeatureCard
              title="AI-Powered Insights"
              description="Tutors receive AI-generated reports with engagement metrics and personalized recommendations."
            />
          </motion.div>
        </div>
    </div>
  );
};

const FeatureCard = ({ title, description }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all"></div>
      <div className="relative">
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default Home;
