-- =====================================
-- ADD FIGMA_URL COLUMN TO PROJECTS TABLE
-- =====================================

-- Add figma_url column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS figma_url VARCHAR(500);

-- Add comment to describe the column
COMMENT ON COLUMN projects.figma_url IS 'URL to Figma design file for the project';

-- Optional: Add index for better performance on figma_url queries (if needed)
-- CREATE INDEX IF NOT EXISTS idx_projects_figma_url ON projects(figma_url) WHERE figma_url IS NOT NULL;
