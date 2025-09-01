-- =====================================
-- COMMANDES SQL COMPLÈTES POUR SUPABASE
-- Projet Portfolio - Yohann Di Crescenzo
-- =====================================

-- =====================================
-- ÉTAPE 1: CRÉATION DU SCHÉMA
-- =====================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- 1. TABLE PROFILE
-- =====================================
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    tagline TEXT,
    location VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(200),
    github_url VARCHAR(200),
    linkedin_url VARCHAR(200),
    avatar_url VARCHAR(500),
    cover_url VARCHAR(500),
    years_experience INTEGER DEFAULT 0,
    satisfaction_rate INTEGER DEFAULT 0,
    availability_hours VARCHAR(50),
    languages TEXT[], -- ['FR', 'EN']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 2. TABLE SKILLS
-- =====================================
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50), -- 'frontend', 'backend', 'mobile', 'design', 'tools'
    level INTEGER DEFAULT 1, -- 1-5
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 3. TABLE PROJECTS
-- =====================================
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(20) UNIQUE, -- 'np1', 'cf1', etc.
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20)[], -- ['mobile', 'web']
    tags VARCHAR(50)[],
    stars INTEGER DEFAULT 0,
    link VARCHAR(500),
    github_url VARCHAR(500),
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'in_progress', 'planned'
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 4. TABLE FREELANCE PLATFORMS
-- =====================================
CREATE TABLE freelance_platforms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    url VARCHAR(200) NOT NULL,
    description TEXT,
    profile_url VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 5. TABLE CERTIFICATIONS
-- =====================================
CREATE TABLE certifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    provider VARCHAR(100),
    year VARCHAR(10),
    status VARCHAR(20) DEFAULT 'planned', -- 'completed', 'in_progress', 'planned'
    certificate_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 6. TABLE ROADMAP CATEGORIES
-- =====================================
CREATE TABLE roadmap_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 7. TABLE ROADMAP ITEMS
-- =====================================
CREATE TABLE roadmap_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES roadmap_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'completed'
    priority INTEGER DEFAULT 1, -- 1-5
    description TEXT,
    estimated_duration VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 8. TABLE MEGA PROJECTS
-- =====================================
CREATE TABLE mega_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stack VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'vision', -- 'vision', 'planning', 'in_progress', 'completed'
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 9. TABLE PRODUCTION GOALS
-- =====================================
CREATE TABLE production_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    target INTEGER NOT NULL,
    current_count INTEGER DEFAULT 0,
    category VARCHAR(50), -- 'web', 'mobile', 'other'
    description TEXT,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 10. TABLE CONTACT MESSAGES (optionnel)
-- =====================================
CREATE TABLE contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
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
CREATE INDEX idx_roadmap_items_category ON roadmap_items (category_id);
CREATE INDEX idx_roadmap_items_status ON roadmap_items (status);

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

CREATE TRIGGER update_roadmap_items_updated_at BEFORE UPDATE ON roadmap_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mega_projects_updated_at BEFORE UPDATE ON mega_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_goals_updated_at BEFORE UPDATE ON production_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- FONCTION POUR METTRE À JOUR LE COMPTEUR DE PROJETS
-- =====================================
CREATE OR REPLACE FUNCTION update_project_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le compteur dans production_goals
    UPDATE production_goals 
    SET current_count = (
        SELECT COUNT(*) 
        FROM projects 
        WHERE 'web' = ANY(category) AND status = 'completed'
    )
    WHERE category = 'web';
    
    UPDATE production_goals 
    SET current_count = (
        SELECT COUNT(*) 
        FROM projects 
        WHERE 'mobile' = ANY(category) AND status = 'completed'
    )
    WHERE category = 'mobile';
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_count_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_project_count();

-- =====================================
-- ÉTAPE 2: INSERTION DES DONNÉES
-- =====================================

-- =====================================
-- 1. INSERTION PROFILE
-- =====================================
INSERT INTO profiles (
    name, title, tagline, location, email, website, 
    github_url, linkedin_url, avatar_url, cover_url,
    years_experience, satisfaction_rate, availability_hours, languages
) VALUES (
    'Yohann Di Crescenzo',
    'Développeur Full‑Stack Web et Mobile',
    '🎯 Objectif : Construire un profil complet pour viser le millénaire.',
    'Paris, France',
    'YohannDCz@gmail.com',
    'https://yohanndcz.com',
    'https://github.com/YohannDCz',
    'https://www.linkedin.com/in/yohann-di-crescenzo/',
    'profile.png',
    'cover.png',
    5,
    98,
    '10–20h / semaine freelance',
    ARRAY['FR', 'EN']
);

-- =====================================
-- 2. INSERTION SKILLS
-- =====================================
INSERT INTO skills (name, category, level, is_featured) VALUES
    ('Flutter', 'mobile', 5, true),
    ('React Native', 'mobile', 5, true),
    ('React', 'frontend', 5, true),
    ('Node.js', 'backend', 4, true),
    ('PHP', 'backend', 4, true),
    ('Next.js', 'frontend', 4, true),
    ('TypeScript', 'frontend', 4, true),
    ('Tailwind CSS', 'frontend', 5, true),
    ('Figma', 'design', 4, true),
    ('FlutterFlow', 'tools', 3, true);

-- =====================================
-- 3. INSERTION PROJECTS
-- =====================================
INSERT INTO projects (external_id, title, category, description, tags, stars, link, status) VALUES
    -- Nouveaux projets
    ('np1', 'Visual Mind iOS', ARRAY['mobile', 'web'], 'Application iOS pour cartographie mentale visuelle.', ARRAY['iOS', 'Swift'], 120, '#', 'completed'),
    ('np2', 'Linksharing', ARRAY['web'], 'Plateforme pour partager et organiser ses liens.', ARRAY['React', 'Node.js'], 80, '#', 'completed'),
    ('np3', 'Audiophile React', ARRAY['web'], 'E‑commerce audio en React avec design moderne.', ARRAY['React', 'Tailwind'], 210, '#', 'completed'),
    
    -- Conversion Flutter
    ('cf1', 'Kanban', ARRAY['mobile'], 'Migration de l''app Kanban en Flutter.', ARRAY['Flutter', 'Dart'], 95, '#', 'completed'),
    ('cf2', 'DevJobs', ARRAY['mobile'], 'Migration DevJobs avec Flutter.', ARRAY['Flutter'], 110, '#', 'completed'),
    ('cf3', 'Designo', ARRAY['mobile'], 'Conversion du site Designo en Flutter.', ARRAY['Flutter'], 75, '#', 'completed'),
    
    -- Conversion React Native
    ('crn1', 'MyTeam', ARRAY['mobile'], 'Version mobile cross‑platform de MyTeam.', ARRAY['React Native', 'TypeScript'], 130, '#', 'completed'),
    ('crn2', 'Kanban', ARRAY['mobile'], 'Migration Kanban en React Native.', ARRAY['React Native', 'TypeScript'], 140, '#', 'completed'),
    ('crn3', 'DevJobs', ARRAY['mobile'], 'Migration DevJobs en React Native.', ARRAY['React Native', 'TypeScript'], 120, '#', 'completed'),
    ('crn4', 'Designo', ARRAY['mobile'], 'Conversion Designo en React Native.', ARRAY['React Native', 'TypeScript'], 100, '#', 'completed'),
    
    -- Conversion React
    ('cre1', 'Google Mirror', ARRAY['web'], 'Clone expérimental de Google.', ARRAY['React', 'Node.js'], 320, '#', 'completed'),
    ('cre2', 'Twitter Mirror', ARRAY['web'], 'Clone expérimental de Twitter.', ARRAY['React', 'Tailwind'], 280, '#', 'completed'),
    ('cre3', 'YouTube Mirror', ARRAY['web'], 'Clone expérimental de YouTube.', ARRAY['React', 'Node.js'], 350, '#', 'completed'),
    
    -- Amélioration avec Cursor
    ('cur1', 'MiniMacOS', ARRAY['web'], 'OS minimal simulé dans le navigateur.', ARRAY['React', 'Cursor'], 400, '#', 'completed'),
    ('cur2', 'DevJobs', ARRAY['web'], 'Optimisation DevJobs avec Cursor.', ARRAY['React', 'Cursor'], 150, '#', 'completed'),
    ('cur3', 'Kanban', ARRAY['web'], 'Optimisation Kanban avec Cursor.', ARRAY['React', 'Cursor'], 160, '#', 'completed'),
    ('cur4', 'Portfolio', ARRAY['web'], 'Portfolio optimisé avec Cursor.', ARRAY['React', 'Cursor'], 200, '#', 'completed'),
    
    -- Mega Projets
    ('mega1', 'Binko', ARRAY['mobile'], 'Mega projet Flutter de réseau social futuriste.', ARRAY['Flutter'], 500, '#', 'in_progress'),
    ('mega2', 'Sonoma', ARRAY['web'], 'Mega projet React simulant un OS complet.', ARRAY['React'], 600, '#', 'in_progress'),
    ('mega3', 'Lifestyle', ARRAY['mobile'], 'Application Lifestyle en React Native.', ARRAY['React Native'], 700, '#', 'in_progress'),
    ('mega4', 'Facebook', ARRAY['web'], 'Projet miroir Facebook en PHP.', ARRAY['PHP'], 800, '#', 'in_progress');

-- =====================================
-- 4. INSERTION FREELANCE PLATFORMS
-- =====================================
INSERT INTO freelance_platforms (name, url, description) VALUES
    ('Fiverr', 'https://www.fiverr.com/', 'Profil prêt à optimiser le taux de conversion.'),
    ('Malt', 'https://www.malt.fr/', 'Profil prêt à optimiser le taux de conversion.'),
    ('Freelancer.com', 'https://www.freelancer.com/', 'Profil prêt à optimiser le taux de conversion.'),
    ('Upwork', 'https://www.upwork.com/', 'Profil prêt à optimiser le taux de conversion.');

-- =====================================
-- 5. INSERTION CERTIFICATIONS
-- =====================================
INSERT INTO certifications (title, provider, year, status) VALUES
    ('Flutter', 'Dyma & Studi', '2025', 'completed'),
    ('React Native', 'Meta', '', 'planned'),
    ('React', 'Meta', '', 'planned'),
    ('Node.js', 'IBM', '', 'planned'),
    ('PHP (optionnel)', '', '', 'planned');

-- =====================================
-- 6. INSERTION ROADMAP CATEGORIES
-- =====================================
INSERT INTO roadmap_categories (name, slug, description, sort_order) VALUES
    ('Nouveaux projets', 'nouveaux', 'Nouveaux projets à développer', 1),
    ('Conversion vers Flutter', 'flutter', 'Migration de projets existants vers Flutter', 2),
    ('Conversion vers React Native / TypeScript', 'rn', 'Migration vers React Native avec TypeScript', 3),
    ('Conversion vers React', 'react', 'Migration vers React', 4),
    ('Amélioration avec Cursor', 'cursor', 'Optimisation avec Cursor AI', 5);

-- =====================================
-- 7. INSERTION ROADMAP ITEMS
-- =====================================
-- Nouveaux projets
INSERT INTO roadmap_items (category_id, name, status, priority) VALUES
    ((SELECT id FROM roadmap_categories WHERE slug = 'nouveaux'), 'Visual Mind iOS', 'todo', 3),
    ((SELECT id FROM roadmap_categories WHERE slug = 'nouveaux'), 'Linksharing', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'nouveaux'), 'Audiophile React', 'todo', 3);

-- Conversion Flutter
INSERT INTO roadmap_items (category_id, name, status, priority) VALUES
    ((SELECT id FROM roadmap_categories WHERE slug = 'flutter'), 'Kanban', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'flutter'), 'DevJobs', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'flutter'), 'Designo', 'todo', 1);

-- Conversion React Native
INSERT INTO roadmap_items (category_id, name, status, priority) VALUES
    ((SELECT id FROM roadmap_categories WHERE slug = 'rn'), 'MyTeam', 'todo', 3),
    ((SELECT id FROM roadmap_categories WHERE slug = 'rn'), 'Kanban', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'rn'), 'DevJobs', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'rn'), 'Designo', 'todo', 1);

-- Conversion React
INSERT INTO roadmap_items (category_id, name, status, priority) VALUES
    ((SELECT id FROM roadmap_categories WHERE slug = 'react'), 'Google Mirror', 'todo', 4),
    ((SELECT id FROM roadmap_categories WHERE slug = 'react'), 'Twitter Mirror', 'todo', 3),
    ((SELECT id FROM roadmap_categories WHERE slug = 'react'), 'YouTube Mirror', 'todo', 5);

-- Amélioration Cursor
INSERT INTO roadmap_items (category_id, name, status, priority) VALUES
    ((SELECT id FROM roadmap_categories WHERE slug = 'cursor'), 'MiniMacOS', 'todo', 5),
    ((SELECT id FROM roadmap_categories WHERE slug = 'cursor'), 'DevJobs', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'cursor'), 'Kanban', 'todo', 2),
    ((SELECT id FROM roadmap_categories WHERE slug = 'cursor'), 'Portfolio', 'todo', 3);

-- =====================================
-- 8. INSERTION MEGA PROJECTS
-- =====================================
INSERT INTO mega_projects (name, stack, description, status, priority) VALUES
    ('Binko', 'Flutter', 'Mega projet Flutter de réseau social futuriste.', 'vision', 4),
    ('MiniMacOS', 'React', 'Mega projet React simulant un OS complet.', 'vision', 5),
    ('Lifestyle', 'React Native', 'Application Lifestyle en React Native.', 'vision', 4),
    ('Facebook', 'PHP', 'Projet miroir Facebook en PHP.', 'vision', 3);

-- =====================================
-- 9. INSERTION PRODUCTION GOALS
-- =====================================
INSERT INTO production_goals (label, target, current_count, category, description) VALUES
    ('Sites React/Node', 100, 0, 'web', '100 sites React/Node pour développer l''expertise web'),
    ('Apps React Native', 100, 0, 'mobile', '100 applications React Native pour maîtriser le cross-platform'),
    ('Apps Flutter', 100, 0, 'mobile', '100 applications Flutter pour devenir expert Flutter');

-- =====================================
-- MISE À JOUR DES COMPTEURS
-- =====================================
-- Mettre à jour les compteurs de projets automatiquement
UPDATE production_goals 
SET current_count = (
    SELECT COUNT(*) 
    FROM projects 
    WHERE 'web' = ANY(category) AND status = 'completed'
)
WHERE category = 'web';

UPDATE production_goals 
SET current_count = (
    SELECT COUNT(*) 
    FROM projects 
    WHERE 'mobile' = ANY(category) AND status = 'completed'
)
WHERE category = 'mobile';

-- =====================================
-- POLITIQUES RLS (ROW LEVEL SECURITY) - OPTIONNEL
-- =====================================
-- Décommenter si vous voulez activer la sécurité au niveau des lignes

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE freelance_platforms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roadmap_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mega_projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE production_goals ENABLE ROW LEVEL SECURITY;

-- Politiques pour lecture publique (tous peuvent lire)
-- CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON freelance_platforms FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON certifications FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON roadmap_categories FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON roadmap_items FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON mega_projects FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON production_goals FOR SELECT USING (true);

-- =====================================
-- REQUÊTES UTILES POUR TESTS
-- =====================================

-- Vérifier les données insérées
-- SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
-- UNION ALL
-- SELECT 'projects', COUNT(*) FROM projects
-- UNION ALL
-- SELECT 'skills', COUNT(*) FROM skills
-- UNION ALL
-- SELECT 'freelance_platforms', COUNT(*) FROM freelance_platforms
-- UNION ALL
-- SELECT 'certifications', COUNT(*) FROM certifications
-- UNION ALL
-- SELECT 'roadmap_categories', COUNT(*) FROM roadmap_categories
-- UNION ALL
-- SELECT 'roadmap_items', COUNT(*) FROM roadmap_items
-- UNION ALL
-- SELECT 'mega_projects', COUNT(*) FROM mega_projects
-- UNION ALL
-- SELECT 'production_goals', COUNT(*) FROM production_goals;

-- Projets par catégorie
-- SELECT 
--     UNNEST(category) as category,
--     COUNT(*) as project_count
-- FROM projects 
-- GROUP BY UNNEST(category)
-- ORDER BY project_count DESC;
