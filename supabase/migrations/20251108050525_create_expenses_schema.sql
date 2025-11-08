/*
  # Expense Tracker Database Schema

  ## Overview
  Creates the complete database schema for the expense tracker application with secure authentication and expense management.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, not null) - User's email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `expenses`
  - `id` (uuid, primary key) - Unique expense identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `category` (text, not null) - Expense category (Food, Transport, Entertainment, etc.)
  - `amount` (numeric, not null) - Expense amount
  - `comments` (text) - Optional notes about the expense
  - `created_at` (timestamptz) - When expense was created
  - `updated_at` (timestamptz) - When expense was last modified

  ## Security
  
  ### Row Level Security (RLS)
  - Both tables have RLS enabled
  - Users can only view and manage their own data
  
  ### Profiles Table Policies
  - Users can view their own profile
  - Users can insert their own profile during signup
  - Users can update their own profile
  
  ### Expenses Table Policies
  - Users can view only their own expenses
  - Users can insert expenses for themselves
  - Users can update only their own expenses
  - Users can delete only their own expenses

  ## Indexes
  - Index on expenses(user_id) for fast user expense lookups
  - Index on expenses(created_at) for efficient sorting
  - Index on expenses(category) for category-wise aggregations

  ## Important Notes
  1. All timestamps use UTC timezone
  2. Amount field uses numeric type for precise decimal calculations
  3. Foreign key constraints ensure data integrity
  4. RLS policies ensure complete data isolation between users
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  comments text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_expenses_updated_at'
  ) THEN
    CREATE TRIGGER update_expenses_updated_at
      BEFORE UPDATE ON expenses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;