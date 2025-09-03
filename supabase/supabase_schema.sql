-- =====================================
-- SCHEMA SQL POUR PORTFOLIO SUPABASE
-- Support multilingue : FR, EN, HI, AR
-- =====================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- 1. TABLE PROFILE MULTILINGUE
-- =====================================
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title_fr VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    title_hi VARCHAR(200),
    title_ar VARCHAR(200),
    tagline_fr TEXT,
    tagline_en TEXT,
    tagline_hi TEXT,
    tagline_ar TEXT,
    location VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(200),
    github_url VARCHAR(200),
    linkedin_url VARCHAR(200),
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    years_experience INTEGER DEFAULT 0,
    satisfaction_rate INTEGER DEFAULT 0,
    availability_hours_fr VARCHAR(50),
    availability_hours_en VARCHAR(50),
    availability_hours_hi VARCHAR(50),
    availability_hours_ar VARCHAR(50),
    spoken_languages TEXT[], -- ['FR', 'EN', 'HI', 'AR']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables de traductions (profil et projets)
CREATE TABLE IF NOT EXISTS profile_translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lang TEXT NOT NULL CHECK (lang IN ('fr','en','hi','ar')),
    title TEXT,
    tagline TEXT,
    availability_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, lang)
);

-- =====================================
-- 2. TABLE SKILLS MULTILINGUE
-- =====================================
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name_fr VARCHAR(100),
    display_name_en VARCHAR(100),
    display_name_hi VARCHAR(100),
    display_name_ar VARCHAR(100),
    category VARCHAR(50), -- 'frontend', 'backend', 'mobile', 'design', 'tools'
    level INTEGER DEFAULT 1, -- 1-5
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 3. TABLE PROJECTS MULTILINGUE AVEC MEGA FLAG
-- =====================================
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(20) UNIQUE, -- 'np1', 'cf1', etc.
    title_fr VARCHAR(100) NOT NULL,
    title_en VARCHAR(100) NOT NULL,
    title_hi VARCHAR(100),
    title_ar VARCHAR(100),
    description_fr TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_ar TEXT,
    category VARCHAR(20)[], -- ['mobile', 'web']
    tags VARCHAR(50)[],
    stars INTEGER DEFAULT 0,
    link VARCHAR(500),
    github_url VARCHAR(500),
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'in_progress', 'planned'
    featured BOOLEAN DEFAULT false,
    is_mega_project BOOLEAN DEFAULT false, -- Flag pour les mega projets
    stack VARCHAR(50), -- Stack technique principal pour les mega projets
    priority INTEGER DEFAULT 1, -- 1-5 pour les mega projets
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_translations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    lang TEXT NOT NULL CHECK (lang IN ('fr','en','hi','ar')),
    title TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, lang)
);

-- =====================================
-- 4. TABLE FREELANCE PLATFORMS MULTILINGUE
-- =====================================
CREATE TABLE freelance_platforms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(200) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_ar TEXT,
    profile_url VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 5. TABLE CERTIFICATIONS AVEC LIENS
-- =====================================
CREATE TABLE certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    provider VARCHAR(100),
    year VARCHAR(10),
    status VARCHAR(20) DEFAULT 'planned', -- 'completed', 'in_progress', 'planned'
    certificate_urls JSONB, -- {"certificate": "url", "course": "url", "verification": "url"}
    description_fr TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUPPRIMÉ : Les roadmap items seront gérés dans un Kanban séparé
-- SUPPRIMÉ : Les mega projects sont maintenant un flag dans la table projects

-- =====================================
-- 6. TABLE PRODUCTION GOALS SIMPLIFIÉE
-- =====================================
CREATE TABLE production_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    label_fr VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    label_hi VARCHAR(100),
    label_ar VARCHAR(100),
    target INTEGER NOT NULL,
    category VARCHAR(50), -- 'web', 'mobile', 'flutter', 'react_native'
    description_fr TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 7. TABLE CONTACT MESSAGES (optionnel)
-- =====================================
CREATE TABLE contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    language VARCHAR(2) DEFAULT 'fr', -- 'fr', 'en', 'hi', 'ar'
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- INDEX POUR PERFORMANCE
-- =====================================
CREATE INDEX idx_projects_category ON projects USING GIN (category);
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_featured ON projects (featured);
CREATE INDEX idx_projects_mega ON projects (is_mega_project);
CREATE INDEX idx_certifications_status ON certifications (status);
CREATE INDEX idx_contact_language ON contact_messages (language);

-- =====================================
-- TRIGGERS POUR UPDATED_AT
-- =====================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- VUES POUR COMPTER LES PROJETS AUTOMATIQUEMENT
-- =====================================
CREATE OR REPLACE VIEW project_counts AS
SELECT 
    'web' as category,
    COUNT(*) as completed_count,
    COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
FROM projects 
WHERE 'web' = ANY(category) AND status = 'completed'
UNION ALL
SELECT 
    'mobile' as category,
    COUNT(*) as completed_count,
    COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
FROM projects 
WHERE 'mobile' = ANY(category) AND status = 'completed'
UNION ALL
SELECT 
    'flutter' as category,
    COUNT(*) as completed_count,
    COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
FROM projects 
WHERE 'Flutter' = ANY(tags) AND status = 'completed'
UNION ALL
SELECT 
    'react_native' as category,
    COUNT(*) as completed_count,
    COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
FROM projects 
WHERE 'React Native' = ANY(tags) AND status = 'completed';

-- =====================================
-- FONCTION POUR OBTENIR LE DÉCOMPTE ACTUEL
-- =====================================
CREATE OR REPLACE FUNCTION get_current_project_count(target_category VARCHAR)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT completed_count FROM project_counts WHERE category = target_category);
END;
$$ language 'plpgsql';
