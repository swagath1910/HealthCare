import { supabase } from '../lib/supabase';
import type { Appointment } from '../lib/supabase';

export const appointmentService = {
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;

      return { appointment: data, error: null };
    } catch (error: any) {
      return { appointment: null, error: error.message };
    }
  },

  async getAppointmentsByPatient(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { appointments: data || [], error: null };
    } catch (error: any) {
      return { appointments: [], error: error.message };
    }
  },

  async getAppointmentsByHospital(hospitalId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { appointments: data || [], error: null };
    } catch (error: any) {
      return { appointments: [], error: error.message };
    }
  },

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      return { appointment: data, error: null };
    } catch (error: any) {
      return { appointment: null, error: error.message };
    }
  },

  async rateAppointment(appointmentId: string, rating: number, review: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ rating, review })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      // Update doctor rating based on all completed appointments
      if (data) {
        await this.updateDoctorRating(data.doctor_id);
        await this.updateHospitalRating(data.hospital_id);
      }

      return { appointment: data, error: null };
    } catch (error: any) {
      return { appointment: null, error: error.message };
    }
  },

  async updateDoctorRating(doctorId: string) {
    try {
      // Get all rated appointments for this doctor
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('rating')
        .eq('doctor_id', doctorId)
        .not('rating', 'is', null);

      if (error) throw error;

      if (appointments && appointments.length > 0) {
        const totalRating = appointments.reduce((sum, app) => sum + (app.rating || 0), 0);
        const averageRating = Math.round((totalRating / appointments.length) * 10) / 10;

        // Update doctor rating
        await supabase
          .from('doctors')
          .update({ rating: averageRating })
          .eq('id', doctorId);
      }
    } catch (error) {
      console.error('Error updating doctor rating:', error);
    }
  },

  async updateHospitalRating(hospitalId: string) {
    try {
      // Get all rated appointments for this hospital
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('rating')
        .eq('hospital_id', hospitalId)
        .not('rating', 'is', null);

      if (error) throw error;

      if (appointments && appointments.length > 0) {
        const totalRating = appointments.reduce((sum, app) => sum + (app.rating || 0), 0);
        const averageRating = Math.round((totalRating / appointments.length) * 10) / 10;

        // Update hospital rating
        await supabase
          .from('hospitals')
          .update({ rating: averageRating })
          .eq('id', hospitalId);
      }
    } catch (error) {
      console.error('Error updating hospital rating:', error);
    }
  },

  // Real-time subscription for appointments
  subscribeToAppointments(hospitalId: string, callback: (payload: any) => void) {
    return supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `hospital_id=eq.${hospitalId}`,
        },
        callback
      )
      .subscribe();
  }
};