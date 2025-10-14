/*
  # Farmchain Coop Phase 2 - Enhanced Lead Management Schema

  ## Overview
  Replaces the previous applications table with a two-table structure:
  1. Qualified Leads - First gate (eligibility test)
  2. Applications - Second gate (full application)

  ## Changes

  ### Drop Old Table
  - Drop existing `applications` table (if exists)

  ### New Table 1: qualified_leads
  Stores eligibility test submissions (first gate)
  - `id` (uuid, primary key) - Unique lead identifier
  - `created_at` (timestamptz) - Test submission timestamp
  - `name` (text) - Lead's name
  - `email` (text) - Lead's email address
  - `phone` (text) - Contact phone number
  - `finance_track` (text) - 'Purchase' or 'Financing'
  - `annual_income` (numeric) - Annual income amount
  - `why_join` (text) - Reason for joining
  - `eligibility_date` (timestamptz) - When they qualified
  - `application_status` (text) - 'Pending', 'Submitted', 'Ineligible'

  ### New Table 2: applications
  Stores full membership applications (second gate)
  - `id` (uuid, primary key) - Unique application identifier
  - `lead_id` (uuid, foreign key) - References qualified_leads.id
  - `created_at` (timestamptz) - Application submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `full_name` (text) - Applicant's full legal name
  - `address` (text) - Physical address
  - `dob` (date) - Date of birth
  - `employment_info` (text) - Employment details (nullable)
  - `bvn` (text) - Bank Verification Number (nullable, required for financing)
  - `cattle_committed` (integer) - Number of cattle committing to
  - `expectations` (text) - What they expect from membership
  - `referral_source` (text) - How they heard about us
  - `admin_status` (text) - 'Pending Review', 'Approved', 'Declined'
  - `admin_notes` (text) - Internal notes from admin review

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Public can insert into qualified_leads (eligibility test)
  - Public can insert into applications (full application)
  - Only authenticated admins can view and update all records
  
  ### Policies
  1. Qualified Leads:
     - Anyone can submit eligibility test (INSERT)
     - Only admins can view all leads (SELECT)
     - Only admins can update lead status (UPDATE)
  
  2. Applications:
     - Anyone can submit applications (INSERT)
     - Only admins can view all applications (SELECT)
     - Only admins can update application status (UPDATE)

  ## Important Notes
  - Maximum 100 membership slots available
  - Finance track determines which fields are required
  - BVN is mandatory only for financing track
  - Admin status tracks the review process
  - Slot count calculated as: 100 - COUNT(approved applications)
*/

DROP TABLE IF EXISTS applications CASCADE;

CREATE TABLE IF NOT EXISTS qualified_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  finance_track text NOT NULL CHECK (finance_track IN ('Purchase', 'Financing')),
  annual_income numeric NOT NULL,
  why_join text NOT NULL,
  eligibility_date timestamptz DEFAULT now() NOT NULL,
  application_status text DEFAULT 'Pending' NOT NULL CHECK (application_status IN ('Pending', 'Submitted', 'Ineligible'))
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES qualified_leads(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  full_name text NOT NULL,
  address text NOT NULL,
  dob date NOT NULL,
  employment_info text DEFAULT '',
  bvn text DEFAULT '',
  cattle_committed integer NOT NULL CHECK (cattle_committed > 0),
  expectations text NOT NULL,
  referral_source text NOT NULL,
  admin_status text DEFAULT 'Pending Review' NOT NULL CHECK (admin_status IN ('Pending Review', 'Approved', 'Declined')),
  admin_notes text DEFAULT ''
);

ALTER TABLE qualified_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit eligibility test"
  ON qualified_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON qualified_leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update lead status"
  ON qualified_leads
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

CREATE POLICY "Anyone can submit applications"
  ON applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update applications"
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

CREATE OR REPLACE FUNCTION update_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_application_updated_at();

CREATE INDEX idx_qualified_leads_status ON qualified_leads(application_status);
CREATE INDEX idx_qualified_leads_email ON qualified_leads(email);
CREATE INDEX idx_applications_lead_id ON applications(lead_id);
CREATE INDEX idx_applications_admin_status ON applications(admin_status);