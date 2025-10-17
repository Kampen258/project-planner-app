-- Create project document system
-- This enables Definition of Done, Definition of Ready, and other project templates

-- Document templates (system and user-created templates)
CREATE TABLE document_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'dod', 'dor', 'project_charter', 'sprint_plan', etc.
    description TEXT,
    default_structure JSONB NOT NULL, -- template structure
    is_system BOOLEAN DEFAULT false, -- system vs user-created templates
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User's actual documents (instances of templates)
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    project_id UUID REFERENCES projects(id) NOT NULL,
    template_id UUID REFERENCES document_templates(id),
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL, -- flexible document structure
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'archived'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Document version history
CREATE TABLE document_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    changes_summary TEXT,
    created_by VARCHAR(50) NOT NULL, -- 'user' or 'ai'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Checklist items (for DoD, DoR, etc.)
CREATE TABLE checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    category VARCHAR(100), -- grouping within document
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Track checklist compliance per task
CREATE TABLE task_checklist_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT,
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_checklist_items_document_id ON checklist_items(document_id);
CREATE INDEX idx_task_checklist_task_id ON task_checklist_status(task_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_templates
CREATE POLICY "Users can view all templates" ON document_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own templates" ON document_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON document_templates
    FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for document_versions
CREATE POLICY "Users can view versions of their documents" ON document_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions of their documents" ON document_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_versions.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- RLS Policies for checklist_items
CREATE POLICY "Users can view checklist items of their documents" ON checklist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = checklist_items.document_id
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage checklist items of their documents" ON checklist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = checklist_items.document_id
            AND documents.user_id = auth.uid()
        )
    );

-- RLS Policies for task_checklist_status
CREATE POLICY "Users can view checklist status of their tasks" ON task_checklist_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_checklist_status.task_id
            AND tasks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage checklist status of their tasks" ON task_checklist_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tasks
            WHERE tasks.id = task_checklist_status.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_checklist_status_updated_at
    BEFORE UPDATE ON task_checklist_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system templates
INSERT INTO document_templates (name, category, description, default_structure, is_system) VALUES
(
    'Definition of Done',
    'dod',
    'Criteria that must be met before a task is considered complete',
    '{
        "sections": [
            {
                "title": "Code Quality",
                "items": [
                    "Code reviewed by at least one team member",
                    "All unit tests passing",
                    "Code coverage meets minimum threshold",
                    "No critical security vulnerabilities",
                    "Follows coding standards and style guide"
                ]
            },
            {
                "title": "Documentation",
                "items": [
                    "Code is properly commented",
                    "README updated if needed",
                    "API documentation updated"
                ]
            },
            {
                "title": "Testing",
                "items": [
                    "Manual testing completed",
                    "Edge cases tested",
                    "Works in all supported browsers/environments"
                ]
            },
            {
                "title": "Deployment",
                "items": [
                    "Merged to main branch",
                    "Deployed to staging environment",
                    "Stakeholder approval obtained"
                ]
            }
        ]
    }',
    true
),
(
    'Definition of Ready',
    'dor',
    'Criteria that must be met before a task can be started',
    '{
        "sections": [
            {
                "title": "Requirements",
                "items": [
                    "User story clearly defined",
                    "Acceptance criteria specified",
                    "Business value understood",
                    "Dependencies identified"
                ]
            },
            {
                "title": "Design & Planning",
                "items": [
                    "Technical approach decided",
                    "UI/UX mockups available (if applicable)",
                    "Effort estimated",
                    "No external blockers"
                ]
            },
            {
                "title": "Resources",
                "items": [
                    "Required resources available",
                    "Team capacity confirmed",
                    "Access to necessary systems/tools"
                ]
            }
        ]
    }',
    true
),
(
    'Project Charter',
    'project_charter',
    'High-level project definition and authorization',
    '{
        "sections": [
            {
                "title": "Project Overview",
                "fields": [
                    {"name": "project_name", "type": "text", "label": "Project Name"},
                    {"name": "purpose", "type": "textarea", "label": "Purpose"},
                    {"name": "objectives", "type": "list", "label": "Key Objectives"}
                ]
            },
            {
                "title": "Scope",
                "fields": [
                    {"name": "in_scope", "type": "list", "label": "In Scope"},
                    {"name": "out_of_scope", "type": "list", "label": "Out of Scope"}
                ]
            },
            {
                "title": "Stakeholders",
                "fields": [
                    {"name": "sponsor", "type": "text", "label": "Project Sponsor"},
                    {"name": "team_members", "type": "list", "label": "Team Members"},
                    {"name": "key_stakeholders", "type": "list", "label": "Key Stakeholders"}
                ]
            },
            {
                "title": "Timeline & Milestones",
                "fields": [
                    {"name": "start_date", "type": "date", "label": "Start Date"},
                    {"name": "target_end_date", "type": "date", "label": "Target End Date"},
                    {"name": "key_milestones", "type": "list", "label": "Key Milestones"}
                ]
            },
            {
                "title": "Success Criteria",
                "fields": [
                    {"name": "success_metrics", "type": "list", "label": "Success Metrics"}
                ]
            }
        ]
    }',
    true
);