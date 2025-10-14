import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type QualifiedLead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  finance_track: 'Purchase' | 'Financing';
  annual_income: number;
  why_join: string;
  eligibility_date: string;
  application_status: 'Pending' | 'Submitted' | 'Ineligible';
};

export type Application = {
  id: string;
  lead_id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  address: string;
  dob: string;
  employment_info: string;
  bvn: string;
  cattle_committed: number;
  expectations: string;
  referral_source: string;
  admin_status: 'Pending Review' | 'Approved' | 'Declined';
  admin_notes: string;
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
};
