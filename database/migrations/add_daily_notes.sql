-- Add daily notes table for planner functionality
-- Stores daily notes for users

CREATE TABLE IF NOT EXISTS daily_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one note per user per day
ALTER TABLE daily_notes ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- Enable RLS
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
CREATE POLICY "Users can view their own daily notes" ON daily_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily notes" ON daily_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily notes" ON daily_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily notes" ON daily_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_id ON daily_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON daily_notes(date);
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON daily_notes(user_id, date);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_notes_updated_at
    BEFORE UPDATE ON daily_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();