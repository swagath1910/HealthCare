import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import NotificationToast from '../components/NotificationToast';
import { Calendar, Users, Plus, Edit, Trash2, Check, X, Star, Stethoscope, CalendarX, Save, Eye, EyeOff, Pill, ShoppingBag } from 'lucide-react';

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hospitals, appointments, loading, error, updateAppointmentStatus, addDoctor, removeDoctor, medicineOrders, updateMedicineOrderStatus } = useApp();
  const { notifications, showSuccess, showError, hideNotification } = useNotification();
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    experience: 0,
    image: '',
    available: true
  });
  
  // Medicine orders state

  const hospital = hospitals.find(h => h.user_id === user?.id);
  const hospitalAppointments = appointments.filter(app => app.hospital_id === hospital?.id);

  const pendingAppointments = hospitalAppointments.filter(app => app.status === 'pending');
  const confirmedAppointments = hospitalAppointments.filter(app => app.status === 'confirmed');
  const completedAppointments = hospitalAppointments.filter(app => app.status === 'completed');
  const pendingMedicineOrders = medicineOrders.filter(order => 
    order.status === 'pending' && order.hospitalId === hospital?.id
  );

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (hospital) {
      try {
        addDoctor(hospital.id, {
          name: newDoctor.name,
          specialization: newDoctor.specialization,
          experience: newDoctor.experience,
          rating: 0,
          image: newDoctor.image || 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=400',
          available: newDoctor.available
        });
        showSuccess(`Dr. ${newDoctor.name} has been added successfully!`);
      } catch (error) {
        showError('Failed to add doctor. Please try again.');
      }
      setNewDoctor({ name: '', specialization: '', experience: 0, image: '', available: true });
      setShowAddDoctorModal(false);
    }
  };

  const handleEditDoctor = (doctor: any) => {
    setEditingDoctor({ ...doctor });
  };

  const handleSaveEdit = () => {
    // In a real app, you'd call an update service here
    showSuccess(`Dr. ${editingDoctor.name} updated successfully!`);
    setEditingDoctor(null);
  };

  const handleRemoveDoctor = (doctorId: string, doctorName: string) => {
    if (confirm(`Are you sure you want to remove Dr. ${doctorName}?`)) {
      try {
        removeDoctor(doctorId);
        showSuccess('Doctor removed successfully!');
      } catch (error) {
        showError('Failed to remove doctor. Please try again.');
      }
    }
  };

  const handleAppointmentAction = (appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      updateAppointmentStatus(appointmentId, status);
      showSuccess(`Appointment ${status} successfully!`);
    } catch (error) {
      showError(`Failed to ${status} appointment. Please try again.`);
    }
  };

  const toggleDoctorAvailability = (doctor: any) => {
    const updatedDoctor = { ...doctor, available: !doctor.available };
    setEditingDoctor(updatedDoctor);
    // In a real app, you'd save this immediately
    showSuccess(`Dr. ${doctor.name} is now ${updatedDoctor.available ? 'available' : 'unavailable'}`);
  };

  const handleMedicineOrderAction = (orderId: number, status: 'confirmed' | 'cancelled' | 'delivered') => {
    updateMedicineOrderStatus(orderId, status);
    showSuccess(`Medicine order ${status} successfully!`);
  };
  const specializations = [
    'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Neurology',
    'Psychiatry', 'Radiology', 'Surgery', 'Internal Medicine', 'Emergency Medicine'
  ];

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
              <h1 className="text-5xl font-bold text-medical-gradient mb-4">Hospital Dashboard</h1>
              <p className="text-2xl font-bold text-neutral-primary">{user?.hospital_name || hospital?.name}</p>
              <p className="text-neutral-secondary font-medium">{user?.address}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="stats-medical-enhanced p-8 animate-float-gentle">
                <div className="text-sm font-bold text-neutral-muted mb-4">Quick Stats</div>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medical-gradient">{hospital?.doctors?.length || 0}</div>
                    <div className="text-xs text-neutral-muted font-bold">Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medical-gradient">{pendingAppointments.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medical-gradient">{confirmedAppointments.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medical-gradient">{pendingMedicineOrders.length}</div>
                    <div className="text-xs text-neutral-muted font-bold">Medicine Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctors Management */}
          <div className="lg:col-span-2 animate-float-gentle">
            <div className="card-medical-3d p-10 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center text-medical-gradient">
                  <Users className="h-8 w-8 mr-4 text-medical-primary" />
                  Doctors Management
                </h2>
                <button
                  onClick={() => setShowAddDoctorModal(true)}
                  className="btn-medical-primary px-8 py-4 rounded-2xl font-bold text-white flex items-center space-x-3 group animate-glow-medical"
                >
                  <Plus className="h-6 w-6 group-hover:animate-pulse" />
                  Add Doctor
                </button>
              </div>

              {loading && (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="spinner-medical mb-4"></div>
                  <span className="text-neutral-secondary font-medium">Loading doctors...</span>
                </div>
              )}
              
              {!loading && hospital?.doctors.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="No doctors added yet"
                  description="Start building your medical team by adding your first doctor to the hospital."
                  action={{
                    label: "Add First Doctor",
                    onClick: () => setShowAddDoctorModal(true)
                  }}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {hospital?.doctors.map(doctor => (
                    <div key={doctor.id} className="glass-medical rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      {editingDoctor?.id === doctor.id ? (
                        // Edit Mode
                        <div className="space-y-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <img 
                              src={editingDoctor.image} 
                              alt={editingDoctor.name}
                              className="w-20 h-20 rounded-full object-cover ring-4 ring-red-100"
                            />
                            <div className="flex-1">
                              <input
                                type="text"
                                value={editingDoctor.name}
                                onChange={(e) => setEditingDoctor({...editingDoctor, name: e.target.value})}
                                className="text-xl font-bold w-full input-medical-enhanced"
                              />
                              <select
                                value={editingDoctor.specialization}
                                onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})}
                                className="input-medical-enhanced w-full mt-2"
                              >
                                {specializations.map(spec => (
                                  <option key={spec} value={spec}>{spec}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-neutral-primary w-24 font-bold">Experience:</label>
                              <input
                                type="number"
                                value={editingDoctor.experience}
                                onChange={(e) => setEditingDoctor({...editingDoctor, experience: parseInt(e.target.value)})}
                                className="input-medical-enhanced px-3 py-2 w-20"
                                min="1"
                                max="50"
                              />
                              <span className="text-sm text-neutral-muted font-medium">years</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-neutral-primary w-24 font-bold">Image URL:</label>
                              <input
                                type="url"
                                value={editingDoctor.image}
                                onChange={(e) => setEditingDoctor({...editingDoctor, image: e.target.value})}
                                className="input-medical-enhanced px-3 py-2 flex-1"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleDoctorAvailability(editingDoctor)}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                  editingDoctor.available 
                                    ? 'badge-success' 
                                    : 'badge-medical-primary'
                                }`}
                              >
                                {editingDoctor.available ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                <span>{editingDoctor.available ? 'Available' : 'Unavailable'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4 pt-6 border-t border-medical-secondary/20">
                            <button 
                              onClick={() => setEditingDoctor(null)}
                              className="btn-medical-secondary px-6 py-3 rounded-2xl font-bold"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleSaveEdit}
                              className="btn-medical-primary px-6 py-3 rounded-2xl font-bold flex items-center space-x-2"
                            >
                              <Save className="h-5 w-5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex items-center space-x-4 mb-4">
                            <img 
                              src={doctor.image} 
                              alt={doctor.name}
                              className="w-20 h-20 rounded-full object-cover ring-4 ring-medical-secondary/20"
                            />
                            <div className="flex-1">
                              <h3 className="font-bold text-2xl text-neutral-primary">{doctor.name}</h3>
                              <p className="text-medical-primary font-bold text-lg">{doctor.specialization}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="text-sm text-neutral-secondary font-bold">
                                  {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                                </span>
                                <span className="text-xs text-neutral-muted ml-1 font-medium">
                                  {doctor.rating > 0 ? `(${Math.floor(Math.random() * 30) + 5} reviews)` : '(No reviews yet)'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3 text-sm text-neutral-secondary mb-6">
                            <div className="font-bold text-base">Experience: {doctor.experience} years</div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${doctor.available ? 'bg-success' : 'bg-medical-primary'}`} />
                              <span className="font-bold">{doctor.available ? 'Available' : 'Unavailable'}</span>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-4">
                            <button 
                              onClick={() => handleEditDoctor(doctor)}
                              className="btn-medical-secondary p-4 rounded-2xl group"
                              title="Edit Doctor"
                            >
                              <Edit className="h-5 w-5 group-hover:animate-pulse" />
                            </button>
                            <button 
                              onClick={() => handleRemoveDoctor(doctor.id, doctor.name)}
                              className="btn-medical-primary p-4 rounded-2xl group"
                              title="Remove Doctor"
                            >
                              <Trash2 className="h-5 w-5 group-hover:animate-pulse" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Appointments Management */}
          <div className="lg:col-span-1 animate-float-gentle" style={{ animationDelay: '0.1s' }}>
            <div className="card-medical-3d p-8 sticky top-8 animate-float-gentle">
              {/* Tab Navigation */}
              <div className="flex space-x-2 mb-8 glass-medical rounded-2xl p-2">
                <button className="flex-1 py-4 px-6 text-sm font-bold btn-medical-primary text-white rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 mr-3" />
                  Appointments
                </button>
              </div>
              
              <h2 className="text-2xl font-bold mb-8 flex items-center text-medical-gradient">
                <Calendar className="h-7 w-7 mr-3 text-medical-primary" />
                Pending Requests ({pendingAppointments.length})
              </h2>
              
              {loading && (
                <div className="flex flex-col justify-center items-center py-8">
                  <div className="spinner-medical mb-4"></div>
                  <span className="text-neutral-secondary font-medium">Loading...</span>
                </div>
              )}
              
              {!loading && hospitalAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarX}
                  title="No appointment requests"
                  description="When patients book appointments with your doctors, they will appear here for you to manage."
                />
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto mb-8">
                  {pendingAppointments.map(appointment => (
                    <div key={appointment.id} className="glass-medical rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="mb-2">
                        <h4 className="font-bold text-neutral-primary text-lg">{appointment.patient_name}</h4>
                        <p className="text-sm text-neutral-secondary font-bold">{appointment.doctor_name}</p>
                      </div>
                      <div className="text-sm text-neutral-secondary mb-4 flex items-center font-bold">
                        <Calendar className="h-5 w-5 mr-2 text-medical-primary" />
                        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="badge-warning text-xs">
                          {appointment.status}
                        </span>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            className="btn-medical-primary p-3 rounded-xl group"
                            title="Accept Appointment"
                          >
                            <Check className="h-5 w-5 text-white group-hover:animate-pulse" />
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                            className="btn-medical-secondary p-3 rounded-xl group"
                            title="Decline Appointment"
                          >
                            <X className="h-5 w-5 group-hover:animate-pulse" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Medicine Orders Section */}
              <div className="border-t border-medical-secondary/20 pt-8">
                <h2 className="text-2xl font-bold mb-8 flex items-center text-medical-gradient">
                  <Pill className="h-7 w-7 mr-3 text-medical-primary" />
                  Medicine Orders ({pendingMedicineOrders.length})
                </h2>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {pendingMedicineOrders.map(order => (
                    <div key={order.id} className="glass-medical rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-success/20">
                      <div className="mb-2">
                        <h4 className="font-bold text-neutral-primary text-base">{order.patientName}</h4>
                        <p className="text-xs text-neutral-secondary font-bold">{order.items?.map(item => `${item.name} (${item.quantity})`).join(', ')}</p>
                        <p className="text-xs text-neutral-muted mt-2 font-medium">📍 {order.deliveryAddress}</p>
                        <p className="text-xs text-neutral-muted font-medium">📞 {order.phoneNumber}</p>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-medical-gradient animate-glow-medical">₹{order.totalAmount}</span>
                        <span className="badge-warning text-xs">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleMedicineOrderAction(order.id, 'confirmed')}
                          className="flex-1 text-sm btn-medical-primary px-4 py-3 rounded-xl font-bold"
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() => handleMedicineOrderAction(order.id, 'cancelled')}
                          className="flex-1 text-sm btn-medical-secondary px-4 py-3 rounded-xl font-bold"
                        >
                          Decline Order
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {pendingMedicineOrders.length === 0 && (
                    <div className="text-center text-medical-muted py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-neutral-muted animate-float-gentle" />
                      <p className="text-sm font-bold">No pending medicine orders</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="modal-medical-enhanced w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-3xl font-bold text-medical-gradient">Add New Doctor</h3>
              <button 
                onClick={() => setShowAddDoctorModal(false)}
                className="btn-medical-secondary p-3 rounded-2xl"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-primary mb-3">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="input-medical-enhanced w-full px-4 py-4"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-primary mb-3">
                  Specialization
                </label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="input-medical-enhanced w-full px-4 py-4"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-primary mb-3">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={newDoctor.experience || ''}
                  onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) || 0 })}
                  className="input-medical-enhanced w-full px-4 py-4"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-primary mb-3">
                  Profile Image URL (optional)
                </label>
                <input
                  type="url"
                  value={newDoctor.image}
                  onChange={(e) => setNewDoctor({ ...newDoctor, image: e.target.value })}
                  className="input-medical-enhanced w-full px-4 py-4"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={newDoctor.available}
                  onChange={(e) => setNewDoctor({ ...newDoctor, available: e.target.checked })}
                  className="rounded border-gray-300 text-medical-primary focus:ring-red-500 w-6 h-6"
                />
                <label htmlFor="available" className="text-sm font-bold text-neutral-primary">
                  Available for appointments
                </label>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="flex-1 btn-medical-secondary px-6 py-4 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-medical-primary px-6 py-4 rounded-2xl font-bold text-white"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;