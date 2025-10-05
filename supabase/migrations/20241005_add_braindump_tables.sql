-- Create uploaded_documents table for braindump feature
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'complete', 'failed')),
  analysis_results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create ai_interviews table to track interview progress
CREATE TABLE ai_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  interview_type TEXT DEFAULT 'braindump' CHECK (interview_type IN ('braindump', 'scratch', 'update')),
  questions_asked JSONB,
  answers_provided JSONB,
  questions_skipped TEXT[],
  initial_score INTEGER,
  final_score INTEGER,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_uploaded_documents_user ON uploaded_documents(user_id);
CREATE INDEX idx_uploaded_documents_project ON uploaded_documents(project_id);
CREATE INDEX idx_ai_interviews_user ON ai_interviews(user_id);
CREATE INDEX idx_ai_interviews_project ON ai_interviews(project_id);

-- Add braindump-related columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual' CHECK (created_via IN ('braindump', 'manual', 'template'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES uploaded_documents(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS initial_success_score INTEGER DEFAULT 25;

-- Enable Row Level Security on new tables
ALTER TABLE uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for uploaded_documents
CREATE POLICY "Users can view own uploaded documents" ON uploaded_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploaded documents" ON uploaded_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploaded documents" ON uploaded_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploaded documents" ON uploaded_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_interviews
CREATE POLICY "Users can view own ai interviews" ON ai_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai interviews" ON ai_interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai interviews" ON ai_interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai interviews" ON ai_interviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for documents bucket
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);