import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, User, Building2, Activity, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'hospital'>('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { success, error: loginError } = await login(email, password);
      if (success) {
        navigate(role === 'hospital' ? '/hospital-dashboard' : '/user-dashboard');
      } else {
        setError(loginError || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-pattern flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center animate-float-gentle">
          <Link to="/" className="flex justify-center items-center space-x-4 mb-8 group">
            <div className="relative">
              <div className="w-20 h-20 bg-medical-primary rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110 animate-glow-medical">
                <Heart className="h-12 w-12 text-white animate-heart-beat" />
              </div>
              <div className="absolute -inset-2 bg-medical-primary rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-medical-gradient">MediCare</span>
              <span className="text-sm text-neutral-muted font-medium">Healthcare Excellence</span>
            </div>
          </Link>
          <h2 className="text-4xl font-bold text-neutral-gradient mb-4">Welcome Back</h2>
          <p className="text-neutral-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-medical-primary hover:text-red-700 font-bold transition-colors">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 card-medical-3d p-10" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-neutral-primary mb-4">
                I am signing in as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center px-6 py-4 border-2 rounded-2xl transition-all duration-300 font-bold ${
                    role === 'user'
                      ? 'btn-medical-primary text-white transform scale-105'
                      : 'btn-medical-secondary'
                  }`}
                >
                  <User className="h-6 w-6 mr-3" />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  className={`flex items-center justify-center px-6 py-4 border-2 rounded-2xl transition-all duration-300 font-bold ${
                    role === 'hospital'
                      ? 'btn-medical-primary text-white transform scale-105'
                      : 'btn-medical-secondary'
                  }`}
                >
                  <Building2 className="h-6 w-6 mr-3" />
                  <span>Hospital</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-neutral-primary mb-3">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Enter your email address"
                  required
                />
                <Mail className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-neutral-primary mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-medical p-4 rounded-2xl border-2 border-medical-secondary">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-medical-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="text-medical-dark font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-medical-primary py-4 px-6 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
            >
              {isLoading ? (
                <>
                  <div className="spinner-medical w-6 h-6"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="h-6 w-6 group-hover:animate-pulse" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">
              Secure login powered by advanced encryption technology
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;