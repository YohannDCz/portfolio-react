-- =====================================
-- ADD TWITTER_URL COLUMN TO PROFILES TABLE
-- =====================================

-- Add twitter_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500);

-- Add comment to describe the column
COMMENT ON COLUMN profiles.twitter_url IS 'Twitter profile URL for the user';

-- Optional: Add index for better performance on twitter_url queries (if needed)
-- CREATE INDEX IF NOT EXISTS idx_profiles_twitter_url ON profiles(twitter_url) WHERE twitter_url IS NOT NULL;
