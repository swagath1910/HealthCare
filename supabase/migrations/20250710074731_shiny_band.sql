/*
  # Create hospitals table

  1. New Tables
    - `hospitals`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `address` (text, required)
      - `phone` (text, required)
      - `image` (text, required)
      - `rating` (double precision, required)
      - `lat` (double precision, required)
      - `lng` (double precision, required)
      - `user_id` (uuid, references users, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hospitals` table
    - Add policy for all users to read hospital data
    - Add policy for hospital owners to update their own data
*/

CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  image text NOT NULL,
  rating double precision NOT NULL DEFAULT 4.5,
  lat double precision NOT NULL DEFAULT 0,
  lng double precision NOT NULL DEFAULT 0,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hospitals"
  ON public.hospitals
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Hospital owners can update their hospital"
  ON public.hospitals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Hospital owners can insert their hospital"
  ON public.hospitals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);