/*
  # Create appointments table

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references users)
      - `patient_name` (text, required)
      - `doctor_id` (uuid, references doctors)
      - `doctor_name` (text, required)
      - `hospital_id` (uuid, references hospitals)
      - `hospital_name` (text, required)
      - `date` (text, required)
      - `time` (text, required)
      - `status` (text, required, enum)
      - `rating` (integer, optional)
      - `review` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `appointments` table
    - Add policy for patients to read their own appointments
    - Add policy for hospitals to read their appointments
    - Add policy for patients to create appointments
    - Add policy for hospitals to update appointment status
    - Add policy for patients to rate completed appointments

  3. Realtime
    - Enable realtime for appointments table
*/

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
  hospital_name text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can read their own appointments
CREATE POLICY "Patients can read own appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Hospitals can read appointments for their hospital
CREATE POLICY "Hospitals can read their appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    hospital_id IN (
      SELECT id FROM public.hospitals WHERE user_id = auth.uid()
    )
  );

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Hospitals can update status of their appointments
CREATE POLICY "Hospitals can update appointment status"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (
    hospital_id IN (
      SELECT id FROM public.hospitals WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    hospital_id IN (
      SELECT id FROM public.hospitals WHERE user_id = auth.uid()
    )
  );

-- Patients can update rating/review of their completed appointments
CREATE POLICY "Patients can rate their appointments"
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id AND status = 'completed')
  WITH CHECK (auth.uid() = patient_id);

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;