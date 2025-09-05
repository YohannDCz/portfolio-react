-- =====================================
-- ADD CERTIFICATION ORDERING COLUMN
-- =====================================

-- Add display_order column to certifications table
ALTER TABLE certifications ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Update existing certifications with initial ordering using a CTE
WITH ordered_certs AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) - 1 as new_order
  FROM certifications
  WHERE display_order = 0
)
UPDATE certifications 
SET display_order = ordered_certs.new_order
FROM ordered_certs
WHERE certifications.id = ordered_certs.id;

-- Create index for better performance on ordering queries
CREATE INDEX IF NOT EXISTS idx_certifications_display_order ON certifications(display_order);

-- Optional: Add a check constraint to ensure display_order is positive
ALTER TABLE certifications ADD CONSTRAINT check_display_order_positive CHECK (display_order >= 0);

COMMENT ON COLUMN certifications.display_order IS 'Display order for drag and drop sorting (0-based index)';
