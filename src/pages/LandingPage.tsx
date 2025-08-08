import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Star,
  Building2,
  Stethoscope,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  User,
  Shield,
  Award,
  ArrowRight,
  Plus,
  CheckCircle,
} from 'lucide-react';

// Floating Animation Component
const FloatingElement = ({ children, delay = 0, duration = 6 }) => (
  <div 
    className="animate-float-gentle"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }}
  >
    {children}
  </div>
);

// Counter Animation Hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    
    const increment = end / (duration / 50);
    const timer = setInterval(() => {
      setCount(prevCount => {
        if (prevCount < end) {
          return Math.min(prevCount + increment, end);
        }
        clearInterval(timer);
        return end;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [end, duration, hasStarted]);

  return { count: Math.floor(count), startAnimation: () => setHasStarted(true) };
};

// Enhanced StatCard with animations
const StatCard = ({ icon, title, value, delay = 0, isVisible = false }) => {
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^\d]/g, '')) : value;
  const { count, startAnimation } = useCountUp(numericValue || 0);
  
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(startAnimation, delay * 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, startAnimation, delay]);

  const displayValue = typeof value === 'string' && value.includes('+') 
    ? `${count.toLocaleString()}+` 
    : typeof value === 'string' && value.includes('★')
    ? `${(count/10).toFixed(1)}★`
    : count.toLocaleString();

  return (
    <div 
      className={`bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-red-100 hover:border-red-300 group cursor-pointer transform transition-all duration-700 hover:scale-110 hover:-translate-y-4 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-4 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:rotate-12">
          <div className="text-white group-hover:scale-125 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-extrabold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent leading-none mb-2 transition-all duration-300">
          {displayValue}
        </div>
        <div className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors duration-300">
          {title}
        </div>
      </div>
    </div>
  );
};

// Enhanced ActionCard with micro-interactions
const ActionCard = ({ icon, title, desc, onClick, delay = 0, isVisible = false }) => (
  <div 
    onClick={onClick} 
    className={`bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-red-100 hover:border-red-300 group cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-4 hover:rotate-1 shadow-xl hover:shadow-2xl ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
    style={{ animationDelay: `${delay * 200}ms` }}
  >
    <div className="flex gap-4 items-start">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center group-hover:from-red-500 group-hover:to-red-600 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-125 group-hover:rotate-12">
        <div className="text-white transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-lg bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2 group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300">
          {title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
          {desc}
        </p>
      </div>
      <ArrowRight className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300" />
    </div>
  </div>
);

// Enhanced Feature Card with stagger animations
const FeatureCard = ({ icon, title, description, delay = 0, isVisible = false }) => (
  <div 
    className={`bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-red-100 hover:border-red-300 group hover:shadow-2xl transition-all duration-700 hover:-translate-y-6 hover:rotate-1 shadow-lg ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}
    style={{ animationDelay: `${delay * 150}ms` }}
  >
    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-6 group-hover:from-red-500 group-hover:to-red-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-xl">
      <div className="text-white transition-transform duration-300">
        {icon}
      </div>
    </div>
    <h4 className="font-bold text-xl bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
      {title}
    </h4>
    <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
      {description}
    </p>
  </div>
);

// Scroll-triggered visibility hook
const useIntersectionObserver = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold]);

  return [setElement, isVisible];
};

// Floating Background Elements
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-20 h-20 bg-red-200/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
    <div className="absolute top-40 right-20 w-16 h-16 bg-red-300/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
    <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-red-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
    <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-red-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
    
    {/* Plus icons floating */}
    <Plus className="absolute top-24 right-1/4 w-6 h-6 text-red-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
    <Plus className="absolute bottom-20 left-1/3 w-8 h-8 text-red-400/30 animate-pulse" style={{ animationDelay: '2s' }} />
    <Heart className="absolute top-1/2 left-10 w-5 h-5 text-red-200/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
  </div>
);

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { hospitals, appointments } = useApp();
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useIntersectionObserver(0.1);
  const [actionsRef, actionsVisible] = useIntersectionObserver(0.1);
  const [featuresRef, featuresVisible] = useIntersectionObserver(0.1);
  const [ctaRef, ctaVisible] = useIntersectionObserver(0.1);

  const userAppointments = appointments.filter(app => app.patient_id === user?.id);
  const upcomingAppointments = userAppointments.filter(app => 
    app.status === 'confirmed' && new Date(app.date) >= new Date()
  );

  const hospital = hospitals.find(h => h.user_id === user?.id);
  const hospitalAppointments = appointments.filter(app => app.hospital_id === hospital?.id);
  const pendingAppointments = hospitalAppointments.filter(app => app.status === 'pending');

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'hospital' ? '/hospital-dashboard' : '/user-dashboard');
    } else {
      navigate('/signup');
    }
  };

  // Hero Section Container with enhanced animations
  const HeroContainer = ({ children, className = "" }) => (
    <section className={`relative py-24 sm:py-32 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      <FloatingShapes />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'float 20s ease-in-out infinite'
        }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {children}
      </div>
    </section>
  );

  // Authenticated Patient View
  if (isAuthenticated && user?.role === 'user') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative">
        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          .animate-gradient-shift {
            background-size: 400% 400%;
            animation: gradient-shift 8s ease infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
          }
          .animate-float-gentle {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        <div ref={heroRef}>
          <HeroContainer>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Welcome Section */}
              <div className="space-y-8">
                <FloatingElement delay={0}>
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-medium">Welcome back</span>
                  </div>
                </FloatingElement>

                <FloatingElement delay={0.5}>
                  <div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4 animate-slide-up">
                      Hello, <span className="text-red-200 animate-pulse">{user.name}</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
                      Your comprehensive healthcare dashboard — manage appointments, discover nearby hospitals, 
                      and connect with trusted medical professionals all in one place.
                    </p>
                  </div>
                </FloatingElement>

                <FloatingElement delay={1}>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => navigate('/user-dashboard')} 
                      className="bg-white text-red-600 px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold hover:bg-red-50 hover:text-red-700 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 group"
                    >
                      <MapPin className="w-6 h-6 group-hover:animate-bounce" />
                      Find Hospitals
                    </button>
                    
                    <button
                      onClick={() => navigate('/user-dashboard')}
                      className="bg-red-500/20 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold hover:bg-white hover:text-red-600 transition-all duration-500 group shadow-lg hover:shadow-2xl transform hover:scale-110"
                    >
                      <Calendar className="w-6 h-6 group-hover:animate-pulse" />
                      My Appointments
                      {upcomingAppointments.length > 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                          {upcomingAppointments.length}
                        </span>
                      )}
                    </button>
                  </div>
                </FloatingElement>
              </div>

              {/* Stats Grid */}
              <FloatingElement delay={1.5}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <StatCard 
                      icon={<MapPin className="w-8 h-8" />} 
                      title="Nearby Hospitals" 
                      value={hospitals.length}
                      delay={0}
                      isVisible={heroVisible}
                    />
                  </div>
                  <StatCard 
                    icon={<Calendar className="w-6 h-6" />} 
                    title="Appointments" 
                    value={userAppointments.length}
                    delay={1}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Users className="w-6 h-6" />} 
                    title="Doctors" 
                    value={hospitals.reduce((t, h) => t + (h.doctors?.length || 0), 0)}
                    delay={2}
                    isVisible={heroVisible}
                  />
                </div>
              </FloatingElement>
            </div>
          </HeroContainer>
        </div>

        {/* Quick Actions Section */}
        <section className="py-20 relative" ref={actionsRef}>
          <FloatingShapes />
          <div className="max-w-6xl mx-auto px-6">
            <div className={`text-center mb-16 ${actionsVisible ? 'animate-slide-up' : 'opacity-0'}`}>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">Quick Actions</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Everything you need for your healthcare journey, just one click away
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <ActionCard 
                icon={<MapPin className="w-6 h-6" />} 
                title="Discover Healthcare" 
                desc="Find and compare nearby hospitals, read reviews, and book appointments with top-rated medical professionals in your area" 
                onClick={() => navigate('/user-dashboard')}
                delay={0}
                isVisible={actionsVisible}
              />
              <ActionCard 
                icon={<Calendar className="w-6 h-6" />} 
                title="Appointment Manager" 
                desc="View, reschedule, and manage all your medical appointments with an intuitive calendar interface" 
                onClick={() => navigate('/user-dashboard')}
                delay={1}
                isVisible={actionsVisible}
              />
            </div>
          </div>
        </section>

        {/* Info Cards Section */}
        <section className="py-24 bg-gradient-to-b from-transparent to-red-50/50 relative" ref={featuresRef}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="How MediCare Works"
                description="Search trusted hospitals → Compare ratings & specializations → Book instantly → Visit & share feedback to help our community grow stronger."
                delay={0}
                isVisible={featuresVisible}
              />
              
              <FeatureCard
                icon={<Award className="w-6 h-6" />}
                title="Premium Features"
                description="Verified medical professionals, authentic patient reviews, secure appointment system, and intelligent hospital recommendations powered by AI."
                delay={1}
                isVisible={featuresVisible}
              />
              
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Trusted Community"
                description="Join over 50,000 satisfied patients who rely on MediCare for their healthcare needs. Share experiences and find the best care together."
                delay={2}
                isVisible={featuresVisible}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated Hospital View
  if (isAuthenticated && user?.role === 'hospital') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative">
        <style jsx>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          .animate-gradient-shift {
            background-size: 400% 400%;
            animation: gradient-shift 8s ease infinite;
          }
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
          }
          .animate-float-gentle {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        <div ref={heroRef}>
          <HeroContainer>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <FloatingElement delay={0}>
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white font-medium">Hospital Dashboard</span>
                  </div>
                </FloatingElement>

                <FloatingElement delay={0.5}>
                  <div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4 animate-slide-up">
                      {hospital?.name || user.hospital_name}
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
                      Comprehensive hospital management platform — oversee doctors, handle appointments, 
                      and monitor performance metrics with advanced analytics.
                    </p>
                  </div>
                </FloatingElement>

                <FloatingElement delay={1}>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => navigate('/hospital-dashboard')} 
                      className="bg-white text-red-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-red-50 hover:text-red-700 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 group"
                    >
                      <TrendingUp className="w-6 h-6 inline mr-2 group-hover:animate-bounce" />
                      Open Dashboard
                    </button>
                    <button 
                      onClick={() => navigate('/hospital-dashboard')} 
                      className="bg-red-500/20 backdrop-blur-xl border border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-red-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-110"
                    >
                      View Requests
                    </button>
                  </div>
                </FloatingElement>
              </div>

              {/* Hospital Stats */}
              <FloatingElement delay={1.5}>
                <div className="grid grid-cols-2 gap-6">
                  <StatCard 
                    icon={<Stethoscope className="w-6 h-6" />} 
                    title="Medical Staff" 
                    value={hospital?.doctors?.length || 0}
                    delay={0}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Clock className="w-6 h-6" />} 
                    title="Pending" 
                    value={pendingAppointments.length}
                    delay={1}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Calendar className="w-6 h-6" />} 
                    title="Total Bookings" 
                    value={hospitalAppointments.length}
                    delay={2}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Star className="w-6 h-6" />} 
                    title="Rating" 
                    value={`${(hospital?.rating || 4.5)*10}★`}
                    delay={3}
                    isVisible={heroVisible}
                  />
                </div>
              </FloatingElement>
            </div>
          </HeroContainer>
        </div>

        {/* Management Actions */}
        <section className="py-20 relative" ref={actionsRef}>
          <FloatingShapes />
          <div className="max-w-6xl mx-auto px-6">
            <div className={`text-center mb-16 ${actionsVisible ? 'animate-slide-up' : 'opacity-0'}`}>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">Management Hub</h2>
              <p className="text-gray-600 text-lg">
                Streamline your hospital operations with powerful management tools
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <ActionCard 
                icon={<Users className="w-6 h-6" />} 
                title="Staff Management" 
                desc="Add, update, and manage your medical staff profiles, specializations, and availability schedules" 
                onClick={() => navigate('/hospital-dashboard')}
                delay={0}
                isVisible={actionsVisible}
              />
              <ActionCard 
                icon={<Calendar className="w-6 h-6" />} 
                title="Booking Requests" 
                desc="Review and approve patient appointment requests, manage schedules, and send confirmations" 
                onClick={() => navigate('/hospital-dashboard')}
                delay={1}
                isVisible={actionsVisible}
              />
              <ActionCard 
                icon={<TrendingUp className="w-6 h-6" />} 
                title="Analytics Dashboard" 
                desc="Monitor hospital performance, patient satisfaction, and operational metrics with detailed insights" 
                onClick={() => navigate('/hospital-dashboard')}
                delay={2}
                isVisible={actionsVisible}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Public Landing Page with full animations
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-float-gentle {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div ref={heroRef}>
        <HeroContainer>
          <div className="grid lg:grid-cols-2 items-center gap-12">
            <div className="space-y-8">
              <FloatingElement delay={0}>
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg">Trusted Healthcare</span>
                </div>
              </FloatingElement>

              <FloatingElement delay={0.5}>
                <div>
                  <h1 className="text-6xl sm:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
                    Your Health, Our{' '}
                    <span className="text-red-200 animate-pulse">Priority</span>
                  </h1>
                  <p className="text-xl text-white/90 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    Discover exceptional healthcare providers, book appointments instantly, and experience 
                    the future of medical care with our advanced digital platform.
                  </p>
                </div>
              </FloatingElement>

              <FloatingElement delay={1}>
                <div className="flex flex-wrap gap-6">
                  <button 
                    onClick={handleGetStarted} 
                    className="bg-white text-red-600 px-10 py-5 rounded-2xl text-xl font-bold inline-flex items-center gap-4 group hover:bg-red-50 hover:text-red-700 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2"
                  >
                    <Zap className="w-6 h-6 group-hover:animate-bounce" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                  
                  <Link 
                    to="/login" 
                    className="bg-red-500/20 backdrop-blur-xl border border-white/30 text-white px-10 py-5 rounded-2xl text-xl font-bold inline-flex items-center gap-4 hover:bg-white hover:text-red-600 transition-all duration-500 shadow-lg hover:shadow-2xl transform hover:scale-110"
                  >
                    <User className="w-6 h-6" />
                    Sign In
                  </Link>
                </div>
              </FloatingElement>
            </div>

            {/* Live Stats Showcase with enhanced animations */}
            <FloatingElement delay={1.5}>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-red-100 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2">
                <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent animate-pulse">
                  Live Healthcare Network
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <StatCard 
                    icon={<MapPin className="w-6 h-6" />} 
                    title="Partner Hospitals" 
                    value="500+" 
                    delay={0}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Users className="w-6 h-6" />} 
                    title="Expert Doctors" 
                    value="2000+" 
                    delay={1}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Heart className="w-6 h-6" />} 
                    title="Happy Patients" 
                    value="50000+" 
                    delay={2}
                    isVisible={heroVisible}
                  />
                  <StatCard 
                    icon={<Star className="w-6 h-6" />} 
                    title="Average Rating" 
                    value="49★" 
                    delay={3}
                    isVisible={heroVisible}
                  />
                </div>
              </div>
            </FloatingElement>
          </div>
        </HeroContainer>
      </div>

      {/* Features Section with staggered animations */}
      <section className="py-24 relative" ref={featuresRef}>
        <FloatingShapes />
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent mb-6">
              Why Choose MediCare?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience healthcare like never before with our cutting-edge platform designed for modern medical needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<MapPin className="w-7 h-7" />}
              title="Smart Hospital Discovery"
              description="Advanced AI-powered search helps you find the perfect healthcare providers based on your location, medical needs, and preferences with real-time availability."
              delay={0}
              isVisible={featuresVisible}
            />
            
            <FeatureCard
              icon={<Calendar className="w-7 h-7" />}
              title="Instant Appointments"
              description="Book appointments with verified doctors in seconds. Our intelligent scheduling system ensures you get the earliest available slots that fit your schedule."
              delay={1}
              isVisible={featuresVisible}
            />
            
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title="Verified Excellence"
              description="Every medical professional on our platform is thoroughly verified. Read authentic patient reviews and make informed decisions about your healthcare."
              delay={2}
              isVisible={featuresVisible}
            />
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with final animations */}
      <section className="py-32 bg-gradient-to-t from-red-50 to-transparent relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-700/10" />
        <FloatingShapes />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <FloatingElement delay={0}>
            <div className={`inline-flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-full mb-8 border border-red-200 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer ${ctaVisible ? 'animate-slide-up' : 'opacity-0'}`}>
              <Activity className="w-6 h-6 text-red-600 animate-pulse" />
              <span className="text-red-600 font-semibold">Join Our Healthcare Revolution</span>
            </div>
          </FloatingElement>
          
          <FloatingElement delay={0.5}>
            <h2 className={`text-5xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-6 ${ctaVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Ready to Transform Your Healthcare Experience?
            </h2>
          </FloatingElement>
          
          <FloatingElement delay={1}>
            <p className={`text-xl text-gray-600 mb-10 max-w-2xl mx-auto ${ctaVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              Join thousands of satisfied patients and healthcare providers who trust MediCare 
              for seamless, reliable, and premium medical care management.
            </p>
          </FloatingElement>
          
          <FloatingElement delay={1.5}>
            <button 
              onClick={handleGetStarted} 
              className={`bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold inline-flex items-center gap-4 group transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-2 ${ctaVisible ? 'animate-slide-up' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              <Heart className="w-7 h-7 group-hover:animate-pulse" />
              Start Your Health Journey
              <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" />
            </button>
          </FloatingElement>
        </div>

        {/* Additional floating elements for the CTA section */}
        <div className="absolute top-10 left-10 opacity-20">
          <CheckCircle className="w-8 h-8 text-red-500 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
        </div>
        <div className="absolute top-20 right-20 opacity-20">
          <Heart className="w-6 h-6 text-red-400 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-20">
          <Star className="w-5 h-5 text-red-600 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;