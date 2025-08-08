import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, User, Building2, Activity } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar-medical-enhanced sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-medical-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 animate-glow-medical">
                <Heart className="h-7 w-7 text-white animate-heart-beat" />
              </div>
              <div className="absolute -inset-1 bg-medical-primary rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-medical-gradient">MediCare</span>
              <span className="text-xs text-neutral-muted font-medium">Healthcare Excellence</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Welcome */}
                <div className="glass-medical px-6 py-3 rounded-2xl animate-float-gentle">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-medical-primary rounded-full flex items-center justify-center animate-pulse-medical">
                      {user?.role === 'hospital' ? (
                        <Building2 className="h-4 w-4 text-white" />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-neutral-primary">Welcome back</span>
                      <p className="text-xs text-neutral-muted font-medium">{user?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Link */}
                <Link 
                  to={user?.role === 'hospital' ? '/hospital-dashboard' : '/user-dashboard'}
                  className="btn-medical-secondary px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 group"
                >
                  <Activity className="h-5 w-5 group-hover:animate-heart-beat" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="btn-medical-primary px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 group"
                >
                  <LogOut className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Login Button */}
                <Link 
                  to="/login"
                  className="btn-medical-secondary px-6 py-3 rounded-2xl font-bold"
                >
                  Sign In
                </Link>

                {/* Signup Button */}
                <Link 
                  to="/signup"
                  className="btn-medical-primary px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 group"
                >
                  <User className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;