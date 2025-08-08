import { supabase } from '../lib/supabase';
import type { Hospital, Doctor } from '../lib/supabase';

// Define a type for a Hospital that includes its Doctors
type HospitalWithDoctors = Hospital & { doctors: Doctor[] };

export const hospitalService = {
  /**
   * Fetches all hospitals and their associated doctors in a single query.
   */
  async getAllHospitals(): Promise<{ hospitals: HospitalWithDoctors[], error: string | null }> {
    try {
      // Use a join to fetch hospitals and all their related doctors (*) at once.
      // This solves the N+1 query problem.
      const { data, error } = await supabase
        .from('hospitals')
        .select('*, doctors(*)') // 👈 The key optimization is here!
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { hospitals: data || [], error: null };
    } catch (error: any) {
      return { hospitals: [], error: error.message };
    }
  },

  /**
   * Fetches a single hospital and its doctors by the associated user ID.
   */
  async getHospitalByUserId(userId: string): Promise<{ hospital: HospitalWithDoctors | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*, doctors(*)') // 👈 Optimized query
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      return { hospital: data, error: null };
    } catch (error: any) {
      // Handle cases where .single() finds no match, which Supabase treats as an error
      if (error.code === 'PGRST116') {
        return { hospital: null, error: null };
      }
      return { hospital: null, error: error.message };
    }
  },

  /**
   * Adds a new doctor to a specific hospital.
   */
  async addDoctor(hospitalId: string, doctorData: Omit<Doctor, 'id' | 'hospital_id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([{ ...doctorData, hospital_id: hospitalId }])
        .select()
        .single(); // Use .single() as we expect one new record

      if (error) throw error;

      return { doctor: data, error: null };
    } catch (error: any) {
      return { doctor: null, error: error.message };
    }
  },

  /**
   * Removes a doctor from the database.
   */
  async removeDoctor(doctorId: string) {
    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  /**
   * Updates a doctor's details.
   */
  async updateDoctor(doctorId: string, updates: Partial<Doctor>) {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', doctorId)
        .select()
        .single();

      if (error) throw error;

      return { doctor: data, error: null };
    } catch (error: any) {
      return { doctor: null, error: error.message };
    }
  }
};