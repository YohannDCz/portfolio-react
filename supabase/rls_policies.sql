-- =====================================
-- ROW LEVEL SECURITY POLICIES
-- Portfolio - Yohann Di Crescenzo
-- =====================================

-- Disable RLS temporarily for admin operations
-- You can enable this later when you have proper authentication

-- Optional: Enable RLS for production security
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE freelance_platforms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (public access)
-- This is suitable for a portfolio website where data is public

-- Public read access for all tables
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read access" ON freelance_platforms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON certifications FOR SELECT USING (true);

-- Public write access for admin operations (temporary)
-- In production, you'd want to add proper authentication checks
CREATE POLICY "Admin write access" ON profiles FOR ALL USING (true);
CREATE POLICY "Admin write access" ON projects FOR ALL USING (true);
CREATE POLICY "Admin write access" ON skills FOR ALL USING (true);
CREATE POLICY "Admin write access" ON freelance_platforms FOR ALL USING (true);
CREATE POLICY "Admin write access" ON certifications FOR ALL USING (true);

-- Translation tables policies
CREATE POLICY "Public read access" ON profile_translations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON project_translations FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON profile_translations FOR ALL USING (true);
CREATE POLICY "Admin write access" ON project_translations FOR ALL USING (true);
