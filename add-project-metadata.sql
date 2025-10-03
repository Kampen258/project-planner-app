-- Add project metadata support
-- Execute this SQL in your Supabase SQL Editor

-- Add metadata column to projects table (stores JSON data)
ALTER TABLE projects
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create index for better JSON queries
CREATE INDEX idx_projects_metadata_gin ON projects USING gin(metadata);

-- Add some example metadata templates (optional)
-- You can insert these as default templates or remove this section

-- Update any existing projects with empty metadata
UPDATE projects
SET metadata = '{}'
WHERE metadata IS NULL;

-- Add constraint to ensure metadata is always valid JSON
ALTER TABLE projects
ADD CONSTRAINT valid_metadata_json
CHECK (metadata IS NOT NULL AND jsonb_typeof(metadata) = 'object');

-- Example of common project metadata structure:
/*
Expected metadata JSON structure:
{
  "definitionOfDone": [
    "Code is reviewed and approved",
    "All tests pass",
    "Documentation is updated",
    "Deployed to staging environment"
  ],
  "definitionOfReady": [
    "Requirements are clearly defined",
    "Acceptance criteria are written",
    "Dependencies are identified",
    "Effort is estimated"
  ],
  "projectType": "web-development",
  "methodology": "agile",
  "sprintLength": 2,
  "teamSize": 5,
  "riskLevel": "medium",
  "businessValue": "high",
  "technicalComplexity": "medium",
  "customFields": {
    "clientName": "Company ABC",
    "budget": 50000,
    "deadline": "2025-12-31",
    "stakeholders": ["Product Owner", "Tech Lead", "Designer"]
  }
}
*/