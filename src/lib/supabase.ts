import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'hospital';
  phone?: string;
  location?: string;
  hospital_name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  created_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  distance?: number;
  lat: number;
  lng: number;
  user_id: string;
  created_at?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  image: string;
  hospital_id: string;
  available: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  hospital_id: string;
  hospital_name: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  rating?: number;
  review?: string;
  created_at?: string;
}