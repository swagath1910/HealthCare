/*
  # Create doctors table

  1. New Tables
    - `doctors`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `specialization` (text, required)
      - `experience` (integer, required)
      - `rating` (double precision, required)
      - `image` (text, required)
      - `hospital_id` (uuid, references hospitals)
      - `available` (boolean, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `doctors` table
    - Add policy for all users to read doctor data
    - Add policy for hospital owners to manage their doctors
*/

CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  specialization text NOT NULL,
  experience integer NOT NULL DEFAULT 0,
  rating double precision NOT NULL DEFAULT 4.5,
  image text NOT NULL,
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE,
  available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read doctors"
  ON public.doctors
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Hospital owners can manage their doctors"
  ON public.doctors
  FOR ALL
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