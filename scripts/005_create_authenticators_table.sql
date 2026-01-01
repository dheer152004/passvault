-- Create authenticators table for TOTP (Time-based One-Time Password) codes
CREATE TABLE IF NOT EXISTS authenticators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  secret TEXT NOT NULL, -- Encrypted TOTP secret
  account TEXT, -- Email or username associated with this authenticator
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE authenticators ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticators
CREATE POLICY "Users can view their own authenticators"
  ON authenticators FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own authenticators"
  ON authenticators FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own authenticators"
  ON authenticators FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own authenticators"
  ON authenticators FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS authenticators_user_id_idx ON authenticators(user_id);
