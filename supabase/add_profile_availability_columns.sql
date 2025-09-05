-- =====================================
-- ADD MISSING AVAILABILITY COLUMNS TO PROFILES TABLE
-- =====================================

-- Add availability columns for Hindi and Arabic
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_hi TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_ar TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_hours_hi TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_hours_ar TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN profiles.availability_hi IS 'Availability status text in Hindi';
COMMENT ON COLUMN profiles.availability_ar IS 'Availability status text in Arabic';
COMMENT ON COLUMN profiles.availability_hours_hi IS 'Working hours information in Hindi';
COMMENT ON COLUMN profiles.availability_hours_ar IS 'Working hours information in Arabic';
