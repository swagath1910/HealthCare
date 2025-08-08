import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import LocationPicker from '../components/LocationPicker';
import { Heart, Mail, Lock, User, Building2, Phone, MapPin, Activity, UserPlus } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'hospital',
    phone: '',
    location: '',
    hospitalName: '',
    address: '',
    lat: 0,
    lng: 0
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const { addHospital } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'hospital' && (!formData.lat || !formData.lng)) {
      setError('Please select your hospital location on the map');
      return;
    }
    setIsLoading(true);

    try {
      const { success, error: signupError } = await signup({
        name: formData.role === 'hospital' ? formData.hospitalName : formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        location: formData.role === 'user' ? formData.location : undefined,
        hospital_name: formData.role === 'hospital' ? formData.hospitalName : undefined,
        address: formData.role === 'hospital' ? formData.address : undefined,
        lat: formData.lat,
        lng: formData.lng
      }, formData.password);
      
      if (success) {
        navigate(formData.role === 'hospital' ? '/hospital-dashboard' : '/user-dashboard');
      } else {
        setError(signupError || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      lat,
      lng
    });
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
          <h2 className="text-4xl font-bold text-neutral-gradient mb-4">Join MediCare</h2>
          <p className="text-neutral-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-medical-primary hover:text-red-700 font-bold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6 card-medical-3d p-10 max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-neutral-primary mb-4">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className={`flex items-center justify-center px-6 py-4 border-2 rounded-2xl transition-all duration-300 font-bold ${
                    formData.role === 'user'
                      ? 'btn-medical-primary text-white transform scale-105'
                      : 'btn-medical-secondary'
                  }`}
                >
                  <User className="h-6 w-6 mr-3" />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'hospital' })}
                  className={`flex items-center justify-center px-6 py-4 border-2 rounded-2xl transition-all duration-300 font-bold ${
                    formData.role === 'hospital'
                      ? 'btn-medical-primary text-white transform scale-105'
                      : 'btn-medical-secondary'
                  }`}
                >
                  <Building2 className="h-6 w-6 mr-3" />
                  <span>Hospital</span>
                </button>
              </div>
            </div>

            {/* Name / Hospital Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-neutral-primary mb-3">
                {formData.role === 'hospital' ? 'Hospital Name' : 'Full Name'}
              </label>
              <div className="relative">
                <input
                  id="name"
                  name={formData.role === 'hospital' ? 'hospitalName' : 'name'}
                  type="text"
                  value={formData.role === 'hospital' ? formData.hospitalName : formData.name}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder={formData.role === 'hospital' ? 'Enter hospital name' : 'Enter your full name'}
                  required
                />
                {formData.role === 'hospital' ? (
                  <Building2 className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
                ) : (
                  <User className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
                )}
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Enter your email address"
                  required
                />
                <Mail className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-neutral-primary mb-3">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Enter phone number"
                  required
                />
                <Phone className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>

            {/* Location / Address */}
            <div>
              <label htmlFor="location" className="block text-sm font-bold text-neutral-primary mb-3">
                {formData.role === 'hospital' ? 'Hospital Address' : 'Location'}
              </label>
              <div className="relative">
                <input
                  id="location"
                  name={formData.role === 'hospital' ? 'address' : 'location'}
                  type="text"
                  value={formData.role === 'hospital' ? formData.address : formData.location}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder={formData.role === 'hospital' ? 'Enter hospital address' : 'Enter your location'}
                  required
                />
                <MapPin className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>

            {/* Location Picker for Hospitals */}
            {formData.role === 'hospital' && (
              <div className="glass-medical p-6 rounded-2xl">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialLocation={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : undefined}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-neutral-primary mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-neutral-primary mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-medical-enhanced w-full pl-14 pr-4 py-4"
                  placeholder="Confirm your password"
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-6 w-6 group-hover:animate-pulse" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-neutral-secondary">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;