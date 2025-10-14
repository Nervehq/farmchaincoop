/*
  # Farmchain Coop Lead Management System Database Schema

  ## Overview
  Creates the complete database schema for managing membership applications
  and admin authentication for the Farmchain Coop.

  ## New Tables
  
  ### 1. `applications`
  Stores member application data with multi-step form information
  - `id` (uuid, primary key) - Unique application identifier
  - `created_at` (timestamptz) - Application submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `status` (text) - Application status: pending, approved, rejected
  - `full_name` (text) - Applicant's full name
  - `email` (text) - Applicant's email address
  - `phone` (text) - Contact phone number
  - `farm_name` (text) - Name of farm (optional)
  - `farm_size` (text) - Size of farming operation
  - `farm_type` (text) - Type of farming: crop, livestock, mixed, other
  - `years_farming` (integer) - Years of farming experience
  - `organic_certified` (boolean) - Organic certification status
  - `interest_reason` (text) - Why they want to join the coop
  - `products` (text) - Products they plan to offer
  - `admin_notes` (text) - Notes added by admin reviewers

  ### 2. `admin_users`
  Stores admin user information linked to Supabase auth
  - `id` (uuid, primary key, references auth.users)
  - `email` (text) - Admin email address
  - `created_at` (timestamptz) - Account creation date
  - `last_login` (timestamptz) - Last login timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled for data protection
  - Applications table: Public can insert (submit applications), only authenticated admins can view/update
  - Admin users table: Only authenticated admins can read their own data
  
  ### Policies
  1. Applications:
     - Anyone can submit applications (INSERT)
     - Only authenticated admins can view all applications (SELECT)
     - Only authenticated admins can update applications (UPDATE)
  
  2. Admin Users:
     - Authenticated admins can view their own profile (SELECT)

  ## Important Notes
  - Admin authentication uses Supabase Auth built-in auth.users table
  - Application status defaults to 'pending'
  - Timestamps are automatically managed with defaults and triggers
  - All fields use appropriate defaults to prevent null-related issues
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '' NOT NULL,
  farm_name text DEFAULT '',
  farm_size text DEFAULT '',
  farm_type text DEFAULT '',
  years_farming integer DEFAULT 0,
  organic_certified boolean DEFAULT false,
  interest_reason text DEFAULT '' NOT NULL,
  products text DEFAULT '',
  admin_notes text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_login timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can view all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated admins can update applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can view own profile"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();