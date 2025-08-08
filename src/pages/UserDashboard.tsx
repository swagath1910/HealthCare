import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNotification } from '../hooks/useNotification';
import RatingModal from '../components/RatingModal';
import SpecializationGrid from '../components/SpecializationGrid';
import HospitalCard from '../components/HospitalCard';
import DoctorCard from '../components/DoctorCard';
import AppointmentModal from '../components/AppointmentModal';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import NotificationToast from '../components/NotificationToast';
import QuickFilters from '../components/QuickFilters';
import { MapPin, Calendar, Star, Search, Map, List, Stethoscope, CalendarX, Navigation, Pill, ShoppingCart, X } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hospitals, appointments, loading, error, bookAppointment, rateDoctor, placeMedicineOrder } = useApp();
  const { notifications, showSuccess, showError, hideNotification } = useNotification();
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [appointmentToRate, setAppointmentToRate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    availability: '',
    rating: '',
    distance: '',
    specialization: ''
  });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Tablet booking state
  const [showTabletBooking, setShowTabletBooking] = useState(false);
  const [tabletCart, setTabletCart] = useState<any[]>([]);
  const [selectedHospitalForTablets, setSelectedHospitalForTablets] = useState<string | null>(null);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Medicine order success popup
  const [showMedicineSuccess, setShowMedicineSuccess] = useState(false);
  const [medicineSuccessMessage, setMedicineSuccessMessage] = useState('');

  const userAppointments = appointments.filter(app => app.patient_id === user?.id);
  const selectedHospitalData = hospitals.find(h => h.id === selectedHospital);
  const hospitalSpecializations = selectedHospitalData?.doctors 
    ? [...new Set(selectedHospitalData.doctors.map(d => d.specialization))]
    : [];
  const filteredDoctorsBySpecialization = selectedSpecialization 
    ? selectedHospitalData?.doctors.filter(d => d.specialization === selectedSpecialization) || []
    : selectedHospitalData?.doctors || [];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = !quickFilters.specialization || 
                                 hospital.doctors.some(doc => doc.specialization === quickFilters.specialization);
    
    const matchesRating = !quickFilters.rating || hospital.rating >= parseFloat(quickFilters.rating);
    
    const matchesDistance = !quickFilters.distance || 
                           (hospital.distance && hospital.distance <= parseFloat(quickFilters.distance));
    
    return matchesSearch && matchesSpecialization && matchesRating && matchesDistance;
  });

  const specializations = [...new Set(hospitals.flatMap(h => h.doctors.map(d => d.specialization)))];

  const handleViewDoctors = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    setSelectedSpecialization(null);
  };

  const handleTabletBooking = (hospitalId: string) => {
    setSelectedHospitalForTablets(hospitalId);
    setShowTabletBooking(true);
  };

  const handleBookAppointment = (doctorId: string) => {
    const hospital = hospitals.find(h => h.doctors.some(d => d.id === doctorId));
    const doctor = hospital?.doctors.find(d => d.id === doctorId);
    if (doctor && hospital) {
      setSelectedDoctor({
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        hospitalId: hospital.id
      });
      setIsModalOpen(true);
    }
  };

  const handleAppointmentBook = async (appointmentData: any) => {
    try {
      await bookAppointment({
        patient_id: user?.id || '',
        patient_name: user?.name || '',
        ...appointmentData,
        status: 'pending'
      });
      setSuccessMessage('Appointment booked successfully! The hospital will confirm shortly.');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      showError('Failed to book appointment. Please try again.');
    }
  };

  const handleRateDoctor = (appointmentId: string, rating: number) => {
    const appointment = userAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      setAppointmentToRate(appointment);
      setIsRatingModalOpen(true);
    }
  };

  const handleSubmitRating = async (appointmentId: string, rating: number, review: string) => {
    try {
      await rateDoctor(appointmentId, rating, review);
      setSuccessMessage('Thank you for your feedback!');
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      showError('Failed to submit rating. Please try again.');
    }
  };

  const handleMapHospitalSelect = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          showSuccess('Location updated successfully!');
          // You could update user location here if needed
        },
        (error) => {
          showError('Unable to get your current location.');
        }
      );
    } else {
      showError('Geolocation is not supported by this browser.');
    }
  };

  const handleEmergencyBooking = () => {
    // Find nearest available hospital with emergency services
    const emergencyHospitals = filteredHospitals.filter(hospital => 
      hospital.doctors.some(doctor => 
        doctor.specialization === 'Emergency Medicine' && doctor.available
      )
    ).sort((a, b) => (a.distance || 999) - (b.distance || 999));

    if (emergencyHospitals.length === 0) {
      showError('No emergency services available nearby. Please call emergency services directly.');
      return;
    }

    const nearestHospital = emergencyHospitals[0];
    const emergencyDoctor = nearestHospital.doctors.find(doctor => 
      doctor.specialization === 'Emergency Medicine' && doctor.available
    );

    if (emergencyDoctor) {
      // Auto-book emergency appointment for today
      const today = new Date().toISOString().split('T')[0];
      const emergencyTime = new Date().getHours() < 12 ? '09:00' : '14:00';
      
      handleAppointmentBook({
        doctor_id: emergencyDoctor.id,
        doctor_name: emergencyDoctor.name,
        hospital_id: nearestHospital.id,
        hospital_name: nearestHospital.name,
        date: today,
        time: emergencyTime
      });
      
      showSuccess(`Emergency appointment booked with Dr. ${emergencyDoctor.name} at ${nearestHospital.name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-medical-pattern">
      {/* Notification Toasts */}
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-float-gentle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-medical-gradient mb-4">Welcome back, {user?.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <p className="text-neutral-secondary flex items-center glass-medical px-4 py-2 rounded-2xl font-medium">
                  <MapPin className="h-5 w-5 mr-2 text-medical-primary" />
                  {user?.location}
                </p>
                <button
                  onClick={getCurrentLocation}
                  className="btn-medical-secondary px-4 py-2 rounded-2xl font-medium flex items-center space-x-2 text-sm"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Update Location</span>
                </button>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 animate-float-gentle">
              <div className="stats-medical-enhanced p-8">
                <div className="text-sm text-neutral-muted font-bold mb-4">Quick Stats</div>
                <div className="flex space-x-6 mt-2">
                  <div>
                    <div className="text-4xl font-bold text-medical-gradient">{filteredHospitals.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Hospitals</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-medical-gradient">{userAppointments.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Appointments</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-medical-gradient">{tabletCart.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Cart Items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 animate-float-gentle" style={{ animationDelay: '0.1s' }}>
            <div className="card-medical-3d overflow-hidden">
              {/* Quick Filters */}
              <div className="p-8 border-b border-medical-secondary/20">
                <QuickFilters
                  onFilterChange={setQuickFilters}
                  specializations={specializations}
                />
              </div>

              {/* Search and View Toggle */}
              <div className="p-8 border-b border-medical-secondary/20">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <div className="flex-1 relative">
                    <Search className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
                    <input
                      type="text"
                      placeholder="Search hospitals, doctors, or specializations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 input-medical-enhanced focus:outline-none"
                    />
                  </div>
                  <div className="flex glass-medical rounded-2xl p-2">
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
                        viewMode === 'map' 
                          ? 'btn-medical-primary text-white' 
                          : 'btn-medical-secondary'
                      }`}
                    >
                      <Map className="h-5 w-5" />
                      <span>Map View</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold ${
                        viewMode === 'list' 
                          ? 'btn-medical-primary text-white' 
                          : 'btn-medical-secondary'
                      }`}
                    >
                      <List className="h-5 w-5" />
                      <span>List View</span>
                    </button>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={handleEmergencyBooking}
                    className="btn-medical-primary px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 animate-glow-medical"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Emergency Booking</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8">
                {!selectedHospital ? (
                  <>
                    {/* Map View */}
                    {viewMode === 'map' && (
                      <div className="mb-8">
                        <div className="mb-6">
                          <h2 className="text-3xl font-bold flex items-center text-medical-gradient mb-3 animate-pulse-medical">
                            <Map className="h-8 w-8 mr-3 text-medical-primary" />
                            Interactive Hospital Map
                          </h2>
                          <p className="text-neutral-secondary font-medium">
                            Hover over markers for quick info, click to view details and book appointments
                          </p>
                        </div>
                        {loading ? (
                          <div className="flex flex-col justify-center items-center h-96">
                            <div className="spinner-medical mb-4"></div>
                            <span className="text-neutral-secondary font-medium">Loading interactive map...</span>
                          </div>
                        ) : (
                          <div className="h-96 rounded-3xl overflow-hidden shadow-2xl border-2 border-medical-secondary/20">
                            <MapView
                              hospitals={filteredHospitals}
                              userLocation={user?.lat && user?.lng ? { lat: user.lat, lng: user.lng } : undefined}
                              onHospitalSelect={handleMapHospitalSelect}
                              selectedHospitalId={selectedHospital}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                      <div>
                        <div className="mb-6">
                          <h2 className="text-3xl font-bold flex items-center text-medical-gradient mb-3 animate-pulse-medical">
                            <List className="h-8 w-8 mr-3 text-medical-primary" />
                            Available Hospitals
                          </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          {loading && (
                            <div className="col-span-2">
                              <div className="flex flex-col justify-center items-center py-12">
                                <div className="spinner-medical mb-4"></div>
                                <span className="text-neutral-secondary font-medium">Finding hospitals near you...</span>
                              </div>
                            </div>
                          )}
                          {!loading && filteredHospitals.length === 0 && (
                            <div className="col-span-2">
                              <EmptyState
                                icon={Stethoscope}
                                title="No hospitals found"
                                description="Try adjusting your search criteria or filters to find hospitals in your area."
                                action={{
                                  label: "Clear Filters",
                                  onClick: () => {
                                    setSearchTerm('');
                                    setQuickFilters({
                                      availability: '',
                                      rating: '',
                                      distance: '',
                                      specialization: ''
                                    });
                                  }
                                }}
                              />
                            </div>
                          )}
                          {filteredHospitals.map(hospital => (
                            <HospitalCard
                              key={hospital.id}
                              hospital={hospital}
                              onViewDoctors={handleViewDoctors}
                              onTabletBooking={handleTabletBooking}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <button
                      onClick={() => {
                        if (selectedSpecialization) {
                          setSelectedSpecialization(null);
                        } else {
                          setSelectedHospital(null);
                        }
                      }}
                      className="btn-medical-secondary px-6 py-3 rounded-2xl font-bold mb-6 flex items-center space-x-2"
                    >
                      <span>←</span>
                      <span>Back to {selectedSpecialization ? 'Specializations' : (viewMode === 'map' ? 'Map' : 'Hospitals')}</span>
                    </button>
                    <div className="mb-8 glass-medical p-6 rounded-3xl">
                      <h3 className="text-3xl font-bold text-neutral-primary mb-3">
                        {selectedHospitalData?.name}
                      </h3>
                      <div className="flex items-center space-x-6 text-neutral-secondary">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-medical-primary" />
                          {selectedHospitalData?.address}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 mr-2 text-yellow-400 fill-current" />
                          {selectedHospitalData?.rating}
                        </div>
                        {selectedHospitalData?.distance && (
                          <div className="flex items-center">
                            <Navigation className="h-5 w-5 mr-2 text-medical-primary" />
                            {selectedHospitalData.distance} km away
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!selectedSpecialization ? (
                      <div>
                        <h4 className="text-2xl font-bold text-neutral-primary mb-6 animate-pulse-medical">Medical Specializations</h4>
                        {hospitalSpecializations.length === 0 ? (
                          <EmptyState
                            icon={Stethoscope}
                            title="No doctors available"
                            description="This hospital hasn't added any doctors yet. Please check back later or contact the hospital directly."
                            action={{
                              label: "Back to Hospitals",
                              onClick: () => setSelectedHospital(null)
                            }}
                          />
                        ) : (
                          <SpecializationGrid
                            specializations={hospitalSpecializations}
                            onSpecializationSelect={setSelectedSpecialization}
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-2xl font-bold text-neutral-primary mb-6 animate-pulse-medical">
                          {selectedSpecialization} Doctors
                        </h4>
                        {filteredDoctorsBySpecialization.length === 0 ? (
                          <EmptyState
                            icon={Stethoscope}
                            title="No doctors found"
                            description={`No ${selectedSpecialization} doctors are currently available.`}
                            action={{
                              label: "View All Specializations",
                              onClick: () => setSelectedSpecialization(null)
                            }}
                          />
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {filteredDoctorsBySpecialization.map(doctor => (
                              <DoctorCard
                                key={doctor.id}
                                doctor={doctor}
                                onBookAppointment={handleBookAppointment}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointments Sidebar */}
          <div className="lg:col-span-1 animate-float-gentle" style={{ animationDelay: '0.2s' }}>
            <div className="card-medical-3d p-8 sticky top-8 animate-float-gentle">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-medical-gradient">
                <Calendar className="h-7 w-7 mr-3 text-medical-primary" />
                Your Appointments
              </h2>
              
              {loading && (
                <div className="flex flex-col justify-center items-center py-8">
                  <div className="spinner-medical mb-4"></div>
                  <span className="text-neutral-secondary font-medium">Loading appointments...</span>
                </div>
              )}
              
              {!loading && userAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="No appointments yet"
                  description="Book your first appointment with a doctor to get started on your health journey."
                />
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {userAppointments.map(appointment => (
                    <div key={appointment.id} className="glass-medical rounded-2xl p-5 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-neutral-primary">{appointment.doctor_name}</h4>
                          <p className="text-sm text-neutral-secondary font-medium">{appointment.hospital_name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          appointment.status === 'confirmed' ? 'badge-success' :
                          appointment.status === 'pending' ? 'badge-warning' :
                          appointment.status === 'cancelled' ? 'badge-medical-primary' :
                          'badge-medical-primary'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-secondary mb-3 flex items-center font-medium">
                        <Calendar className="h-4 w-4 mr-2 text-medical-primary" />
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                      {appointment.status === 'completed' && !appointment.rating && (
                        <div className="flex items-center space-x-3 mt-3">
                          <span className="text-sm font-medium text-neutral-primary">Rate this doctor:</span>
                          <button
                            onClick={() => handleRateDoctor(appointment.id, 0)}
                            className="btn-medical-primary px-4 py-2 rounded-xl font-bold text-sm"
                          >
                            Rate Experience
                          </button>
                        </div>
                      )}
                      {appointment.rating && (
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-sm font-medium text-neutral-primary">Your rating:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= appointment.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Medicine Cart Preview */}
                  {tabletCart.length > 0 && (
                    <div className="border-t border-medical-secondary/20 pt-6 mt-6">
                      <h4 className="font-bold text-neutral-primary mb-3 flex items-center">
                        <ShoppingCart className="h-5 w-5 mr-2 text-medical-primary" />
                        Medicine Cart ({tabletCart.length})
                      </h4>
                      <button
                        onClick={() => setShowTabletBooking(true)}
                        className="w-full btn-medical-primary px-4 py-3 rounded-2xl font-bold text-sm"
                      >
                        View Cart & Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
        hospitalName={selectedHospitalData?.name || ''}
        onBook={handleAppointmentBook}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        appointment={appointmentToRate}
        onSubmitRating={handleSubmitRating}
      />

      {/* Tablet Booking Modal */}
      {showTabletBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <TabletBookingModal
          isOpen={showTabletBooking}
          onClose={() => setShowTabletBooking(false)}
          selectedHospital={hospitals.find(h => h.id === selectedHospitalForTablets)}
          cart={tabletCart}
          onUpdateCart={setTabletCart}
          onPlaceOrder={(orderData) => {
            placeMedicineOrder(orderData);
          }}
        />
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] animate-scaleIn">
          <div className="success-medical rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Success!</h3>
                <p className="text-white/90 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Order Success Popup */}
      {showMedicineSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10001] animate-scaleIn">
          <div className="success-medical rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Order Placed!</h3>
                <p className="text-white/90 font-medium">{medicineSuccessMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tablet Booking Modal Component
const TabletBookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedHospital?: any;
  cart: any[];
  onUpdateCart: (cart: any[]) => void;
  onPlaceOrder: (orderData: any) => void;
}> = ({ isOpen, onClose, selectedHospital, cart, onUpdateCart, onPlaceOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  const categories = [
    { id: 'all', name: 'All Medicines', icon: Pill },
    { id: 'pain-relief', name: 'Pain Relief', icon: Pill },
    { id: 'vitamins', name: 'Vitamins', icon: Pill },
    { id: 'cold-flu', name: 'Cold & Flu', icon: Pill },
    { id: 'digestive', name: 'Digestive', icon: Pill },
  ];

  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', category: 'pain-relief', price: 25, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, name: 'Ibuprofen 400mg', category: 'pain-relief', price: 35, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 3, name: 'Vitamin D3', category: 'vitamins', price: 120, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 4, name: 'Cough Syrup', category: 'cold-flu', price: 85, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 5, name: 'Antacid Tablets', category: 'digestive', price: 45, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 6, name: 'Aspirin 75mg', category: 'pain-relief', price: 30, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 7, name: 'Vitamin C', category: 'vitamins', price: 95, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 8, name: 'Throat Lozenges', category: 'cold-flu', price: 55, image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ];

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: any) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      onUpdateCart(cart.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      onUpdateCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = (medicineId: number) => {
    onUpdateCart(cart.filter(item => item.id !== medicineId));
  };

  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(medicineId);
    } else {
      onUpdateCart(cart.map(item => 
        item.id === medicineId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!deliveryAddress || !phoneNumber) {
      setShowOrderSuccess(false);
      // Show error message instead
      return;
    }
    
    const orderData = {
      hospitalId: selectedHospital?.id,
      hospitalName: selectedHospital?.name,
      items: cart,
      totalAmount,
      deliveryAddress,
      phoneNumber,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };
    
    onPlaceOrder(orderData);
    
    // Show medicine success popup
    setMedicineSuccessMessage(`Medicine order placed successfully! Total: ₹${totalAmount}`);
    setShowMedicineSuccess(true);
    setTimeout(() => setShowMedicineSuccess(false), 3000);
    
    setShowOrderSuccess(true);
    setTimeout(() => {
      setShowOrderSuccess(false);
      onClose();
    }, 2000);
    onClose();
    onUpdateCart([]);
    setDeliveryAddress('');
    setPhoneNumber('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-medical w-full max-w-6xl h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Medicine Catalog */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-red-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-bold text-medical-gradient flex items-center">
                  <Pill className="h-8 w-8 mr-3 text-medical-primary" />
                  Order Medicines from {selectedHospital?.name}
                </h3>
                <button onClick={onClose} className="btn-medical-secondary p-3 rounded-2xl">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="h-6 w-6 text-medical-primary absolute left-4 top-4" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 input-medical focus:outline-none"
                />
              </div>
              
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 font-bold ${
                      selectedCategory === category.id
                        ? 'btn-medical-primary text-white'
                        : 'btn-medical-secondary'
                    }`}
                  >
                    <category.icon className="h-5 w-5" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Medicine Grid */}
            <div className="flex-1 overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedicines.map(medicine => (
                  <div key={medicine.id} className="medical-glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <img 
                      src={medicine.image} 
                      alt={medicine.name}
                      className="w-full h-32 object-cover rounded-xl mb-4"
                    />
                    <h4 className="font-bold text-medical-dark mb-2">{medicine.name}</h4>
                    <p className="text-xl font-bold text-medical-primary mb-4">₹{medicine.price}</p>
                    <button
                      onClick={() => addToCart(medicine)}
                      className="w-full btn-medical-primary py-3 rounded-xl font-bold"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Cart Sidebar */}
          <div className="w-80 border-l border-red-100 medical-glass flex flex-col overflow-hidden">
            <div className="p-6 border-b border-red-100">
              <h4 className="font-bold text-medical-dark flex items-center text-lg">
                <ShoppingCart className="h-6 w-6 mr-3 text-medical-primary" />
                Your Cart ({cart.length})
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 300px)' }}>
              {cart.length === 0 ? (
                <div className="text-center text-medical-muted mt-12">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-medical-muted animate-float" />
                  <p className="font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="medical-glass rounded-2xl p-4 transform hover:scale-105 transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-medical-dark text-sm">{item.name}</h5>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-all duration-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-medical-primary font-bold">₹{item.price}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 medical-glass rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-medical-dark">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 medical-glass rounded-full flex items-center justify-center hover:bg-red-50 transition-all duration-300 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-red-100 overflow-y-auto" style={{ maxHeight: '300px' }}>
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-medical-dark mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 input-medical focus:outline-none"
                      rows={2}
                      placeholder="Enter your delivery address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-medical-dark mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 input-medical focus:outline-none"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-medical-dark text-lg">Total:</span>
                  <span className="text-2xl font-bold text-medical-gradient animate-glow">₹{totalAmount}</span>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  className="w-full btn-medical-primary py-4 rounded-2xl font-bold text-lg animate-glow"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Success Popup */}
      {showOrderSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] animate-fadeIn">
          <div className="success-medical rounded-3xl p-10 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Order Placed Successfully!</h3>
              <p className="text-white/90 mb-6 font-medium">Your medicine order has been sent to {selectedHospital?.name}</p>
              <div className="text-white/80 font-medium">
                <p className="text-lg">Total: ₹{totalAmount}</p>
                <p className="text-lg">Items: {cart.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;