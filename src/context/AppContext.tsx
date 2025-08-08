import React, { createContext, useContext, useState, useEffect } from 'react';
import { hospitalService } from '../services/hospitalService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from './AuthContext';
import type { Hospital, Doctor, Appointment } from '../lib/supabase';

interface AppContextType {
  hospitals: Hospital[];
  appointments: Appointment[];
  medicineOrders: any[];
  loading: boolean;
  error: string | null;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'created_at'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  addDoctor: (hospitalId: string, doctor: Omit<Doctor, 'id' | 'hospital_id' | 'created_at'>) => Promise<void>;
  removeDoctor: (doctorId: string) => Promise<void>;
  rateDoctor: (appointmentId: string, rating: number, review: string) => Promise<void>;
  placeMedicineOrder: (orderData: any) => Promise<void>;
  updateMedicineOrderStatus: (orderId: number, status: string) => Promise<void>;
  refreshHospitals: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicineOrders, setMedicineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load hospitals
  const refreshHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { hospitals: hospitalData, error: hospitalError } = await hospitalService.getAllHospitals();
      
      if (hospitalError) {
        setError(hospitalError);
        return;
      }

      // Calculate distances (mock calculation for now)
      const hospitalsWithDistance = hospitalData.map(hospital => ({
        ...hospital,
        distance: Math.round(Math.random() * 10 * 100) / 100, // Mock distance
        doctors: hospital.doctors || []
      }));

      setHospitals(hospitalsWithDistance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load appointments
  const refreshAppointments = async () => {
    if (!user || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      let appointmentData: Appointment[] = [];
      
      if (user.role === 'user') {
        const { appointments: userAppointments, error: appointmentError } = 
          await appointmentService.getAppointmentsByPatient(user.id);
        
        if (appointmentError) {
          setError(appointmentError);
          return;
        }
        appointmentData = userAppointments;
      } else if (user.role === 'hospital') {
        // Get hospital ID first
        const { hospital, error: hospitalError } = await hospitalService.getHospitalByUserId(user.id);
        
        if (hospitalError || !hospital) {
          setError(hospitalError || 'Hospital not found');
          return;
        }

        const { appointments: hospitalAppointments, error: appointmentError } = 
          await appointmentService.getAppointmentsByHospital(hospital.id);
        
        if (appointmentError) {
          setError(appointmentError);
          return;
        }
        appointmentData = hospitalAppointments;
      }

      setAppointments(appointmentData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    refreshHospitals();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshAppointments();
    }
  }, [isAuthenticated, user]);

  // Calculate distances based on user location
  useEffect(() => {
    if (user?.lat && user?.lng && hospitals.length > 0) {
      const hospitalsWithCalculatedDistance = hospitals.map(hospital => {
        if (hospital.lat && hospital.lng) {
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in kilometers
          const dLat = (hospital.lat - user.lat) * Math.PI / 180;
          const dLng = (hospital.lng - user.lng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(user.lat * Math.PI / 180) * Math.cos(hospital.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          return {
            ...hospital,
            distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
          };
        }
        return hospital;
      });
      
      // Sort by distance
      hospitalsWithCalculatedDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      
      setHospitals(hospitalsWithCalculatedDistance);
    }
  }, [isAuthenticated, user]);

  // Real-time subscription for hospital appointments
  useEffect(() => {
    if (user?.role === 'hospital' && isAuthenticated) {
      const setupSubscription = async () => {
        const { hospital } = await hospitalService.getHospitalByUserId(user.id);
        if (hospital) {
          const subscription = appointmentService.subscribeToAppointments(
            hospital.id,
            (payload) => {
              console.log('Real-time appointment update:', payload);
              refreshAppointments();
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        }
      };

      setupSubscription();
    }
  }, [user, isAuthenticated]);

  const bookAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at'>) => {
    try {
      setError(null);
      const { appointment, error: appointmentError } = await appointmentService.createAppointment(appointmentData);
      
      if (appointmentError) {
        setError(appointmentError);
        return;
      }

      if (appointment) {
        setAppointments(prev => [appointment, ...prev]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      setError(null);
      const { appointment, error: appointmentError } = await appointmentService.updateAppointmentStatus(id, status);
      
      if (appointmentError) {
        setError(appointmentError);
        return;
      }

      if (appointment) {
        setAppointments(prev => 
          prev.map(app => app.id === id ? appointment : app)
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addDoctor = async (hospitalId: string, doctorData: Omit<Doctor, 'id' | 'hospital_id' | 'created_at'>) => {
    try {
      setError(null);
      const { doctor, error: doctorError } = await hospitalService.addDoctor(hospitalId, doctorData);
      
      if (doctorError) {
        setError(doctorError);
        return;
      }

      if (doctor) {
        // Refresh hospitals to get updated doctor list
        await refreshHospitals();
        // Also refresh appointments in case they're affected
        await refreshAppointments();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeDoctor = async (doctorId: string) => {
    try {
      setError(null);
      const { error: doctorError } = await hospitalService.removeDoctor(doctorId);
      
      if (doctorError) {
        setError(doctorError);
        return;
      }

      // Refresh hospitals to get updated doctor list
      await refreshHospitals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rateDoctor = async (appointmentId: string, rating: number, review: string) => {
    try {
      setError(null);
      const { appointment, error: appointmentError } = await appointmentService.rateAppointment(appointmentId, rating, review);
      
      if (appointmentError) {
        setError(appointmentError);
        return;
      }

      if (appointment) {
        setAppointments(prev => 
          prev.map(app => app.id === appointmentId ? appointment : app)
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const placeMedicineOrder = async (orderData: any) => {
    try {
      setError(null);
      // In a real app, this would be saved to the database
      const newOrder = {
        ...orderData,
        id: Date.now(),
        patientId: user?.id,
        patientName: user?.name
      };
      setMedicineOrders(prev => [newOrder, ...prev]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateMedicineOrderStatus = async (orderId: number, status: string) => {
    try {
      setError(null);
      setMedicineOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AppContext.Provider value={{
      hospitals,
      appointments,
      medicineOrders,
      loading,
      error,
      bookAppointment,
      updateAppointmentStatus,
      addDoctor,
      removeDoctor,
      rateDoctor,
      placeMedicineOrder,
      updateMedicineOrderStatus,
      refreshHospitals,
      refreshAppointments
    }}>
      {children}
    </AppContext.Provider>
  );
};