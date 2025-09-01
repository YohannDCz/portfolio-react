-- =====================================
-- COMMANDES SQL COMPLÈTES POUR SUPABASE V2
-- Portfolio Multilingue - Yohann Di Crescenzo
-- Support : FR, EN, HI, AR
-- =====================================

-- =====================================
-- ÉTAPE 1: CRÉATION DU SCHÉMA MULTILINGUE
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
-- 7. TABLE CONTACT MESSAGES MULTILINGUE
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

-- =====================================
-- ÉTAPE 2: INSERTION DES DONNÉES MULTILINGUES
-- =====================================

-- =====================================
-- 1. INSERTION PROFILE MULTILINGUE
-- =====================================
INSERT INTO profiles (
    name, 
    title_fr, title_en, title_hi, title_ar,
    tagline_fr, tagline_en, tagline_hi, tagline_ar,
    location, email, website, 
    github_url, linkedin_url, avatar_url, cover_url,
    years_experience, satisfaction_rate, 
    availability_hours_fr, availability_hours_en, availability_hours_hi, availability_hours_ar,
    spoken_languages
) VALUES (
    'Yohann Di Crescenzo',
    'Développeur Full‑Stack Web et Mobile',
    'Full‑Stack Web and Mobile Developer',
    'फुल-स्टैक वेब और मोबाइल डेवलपर',
    'مطور ويب وموبايل متكامل',
    '🎯 Objectif : Construire un profil complet pour viser le millénaire.',
    '🎯 Goal: Build a complete profile to aim for the millennium.',
    '🎯 लक्ष्य: सहस्राब्दी का लक्ष्य रखने के लिए एक पूर्ण प्रोफ़ाइल बनाना।',
    '🎯 الهدف: بناء ملف تعريف كامل لاستهداف الألفية.',
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
    '10–20h / week freelance',
    '10-20 घंटे / सप्ताह फ्रीलांस',
    '10-20 ساعة / أسبوع عمل حر',
    ARRAY['FR', 'EN', 'HI', 'AR']
);

-- =====================================
-- 2. INSERTION SKILLS MULTILINGUES
-- =====================================
INSERT INTO skills (name, display_name_fr, display_name_en, display_name_hi, display_name_ar, category, level, is_featured) VALUES
    ('Flutter', 'Flutter', 'Flutter', 'फ़्लटर', 'فلاتر', 'mobile', 5, true),
    ('React Native', 'React Native', 'React Native', 'रिएक्ट नेटिव', 'ريأكت نيتيف', 'mobile', 5, true),
    ('React', 'React', 'React', 'रिएक्ट', 'ريأكت', 'frontend', 5, true),
    ('Node.js', 'Node.js', 'Node.js', 'नोड.जेएस', 'نود.جي إس', 'backend', 4, true),
    ('PHP', 'PHP', 'PHP', 'पीएचपी', 'بي إتش بي', 'backend', 4, true),
    ('Next.js', 'Next.js', 'Next.js', 'नेक्स्ट.जेएस', 'نكست.جي إس', 'frontend', 4, true),
    ('TypeScript', 'TypeScript', 'TypeScript', 'टाइपस्क्रिप्ट', 'تايب سكريبت', 'frontend', 4, true),
    ('Tailwind CSS', 'Tailwind CSS', 'Tailwind CSS', 'टेलविंड सीएसएस', 'تيل ويند سي إس إس', 'frontend', 5, true),
    ('Figma', 'Figma', 'Figma', 'फिग्मा', 'فيجما', 'design', 4, true),
    ('FlutterFlow', 'FlutterFlow', 'FlutterFlow', 'फ़्लटरफ़्लो', 'فلاتر فلو', 'tools', 3, true);

-- =====================================
-- 3. INSERTION PROJECTS MULTILINGUES AVEC MEGA FLAGS
-- =====================================
INSERT INTO projects (
    external_id, 
    title_fr, title_en, title_hi, title_ar,
    description_fr, description_en, description_hi, description_ar,
    category, tags, stars, link, status, is_mega_project, stack, priority
) VALUES
    -- Nouveaux projets
    ('np1', 'Visual Mind iOS', 'Visual Mind iOS', 'विज़ुअल माइंड iOS', 'فيجوال مايند iOS', 
     'Application iOS pour cartographie mentale visuelle.', 'iOS app for visual mind mapping.', 'दृश्य मानसिक मानचित्रण के लिए iOS ऐप।', 'تطبيق iOS لرسم الخرائط الذهنية البصرية.',
     ARRAY['mobile', 'web'], ARRAY['iOS', 'Swift'], 120, '#', 'completed', false, null, 1),
    
    ('np2', 'Linksharing', 'Linksharing', 'लिंकशेयरिंग', 'لينك شيرنج', 
     'Plateforme pour partager et organiser ses liens.', 'Platform to share and organize links.', 'लिंक साझा करने और व्यवस्थित करने के लिए प्लेटफॉर्म।', 'منصة لمشاركة وتنظيم الروابط.',
     ARRAY['web'], ARRAY['React', 'Node.js'], 80, '#', 'completed', false, null, 1),
    
    ('np3', 'Audiophile React', 'Audiophile React', 'ऑडियोफाइल रिएक्ट', 'أوديوفايل ريأكت', 
     'E‑commerce audio en React avec design moderne.', 'Audio e-commerce in React with modern design.', 'आधुनिक डिज़ाइन के साथ React में ऑडियो ई-कॉमर्स।', 'تجارة إلكترونية صوتية في React بتصميم حديث.',
     ARRAY['web'], ARRAY['React', 'Tailwind'], 210, '#', 'completed', false, null, 1),
    
    -- Mega Projets
    ('mega1', 'Binko', 'Binko', 'बिंको', 'بينكو', 
     'Mega projet Flutter de réseau social futuriste.', 'Mega Flutter project for futuristic social network.', 'भविष्यवादी सामाजिक नेटवर्क के लिए मेगा Flutter प्रोजेक्ट।', 'مشروع Flutter ضخم لشبكة اجتماعية مستقبلية.',
     ARRAY['mobile'], ARRAY['Flutter'], 500, '#', 'in_progress', true, 'Flutter', 4),
    
    ('mega2', 'Sonoma', 'Sonoma', 'सोनोमा', 'سونوما', 
     'Mega projet React simulant un OS complet.', 'Mega React project simulating complete OS.', 'पूर्ण OS का अनुकरण करने वाला मेगा React प्रोजेक्ट।', 'مشروع React ضخم لمحاكاة نظام تشغيل كامل.',
     ARRAY['web'], ARRAY['React'], 600, '#', 'in_progress', true, 'React', 5),
    
    ('mega3', 'Lifestyle', 'Lifestyle', 'लाइफस्टाइल', 'أسلوب الحياة', 
     'Application Lifestyle en React Native.', 'Lifestyle application in React Native.', 'React Native में लाइफस्टाइल एप्लिकेशन।', 'تطبيق أسلوب الحياة في React Native.',
     ARRAY['mobile'], ARRAY['React Native'], 700, '#', 'in_progress', true, 'React Native', 4),
    
    ('mega4', 'Facebook Mirror', 'Facebook Mirror', 'फेसबुक मिरर', 'فيسبوك ميرور', 
     'Projet miroir Facebook en PHP.', 'Facebook mirror project in PHP.', 'PHP में Facebook मिरर प्रोजेक्ट।', 'مشروع مرآة فيسبوك في PHP.',
     ARRAY['web'], ARRAY['PHP'], 800, '#', 'in_progress', true, 'PHP', 3);

-- =====================================
-- 4. INSERTION FREELANCE PLATFORMS MULTILINGUE
-- =====================================
INSERT INTO freelance_platforms (
    name, url, 
    description_fr, description_en, description_hi, description_ar
) VALUES
    ('Fiverr', 'https://www.fiverr.com/', 
     'Profil prêt à optimiser le taux de conversion.', 'Profile ready to optimize conversion rate.', 'रूपांतरण दर अनुकूलित करने के लिए तैयार प्रोफ़ाइल।', 'ملف تعريف جاهز لتحسين معدل التحويل.'),
    ('Malt', 'https://www.malt.fr/', 
     'Profil prêt à optimiser le taux de conversion.', 'Profile ready to optimize conversion rate.', 'रूपांतरण दर अनुकूलित करने के लिए तैयार प्रोफ़ाइल।', 'ملف تعريف جاهز لتحسين معدل التحويل.'),
    ('Freelancer.com', 'https://www.freelancer.com/', 
     'Profil prêt à optimiser le taux de conversion.', 'Profile ready to optimize conversion rate.', 'रूपांतरण दर अनुकूलित करने के लिए तैयार प्रोफ़ाइल।', 'ملف تعريف جاهز لتحسين معدل التحويل.'),
    ('Upwork', 'https://www.upwork.com/', 
     'Profil prêt à optimiser le taux de conversion.', 'Profile ready to optimize conversion rate.', 'रूपांतरण दर अनुकूलित करने के लिए तैयार प्रोफ़ाइल।', 'ملف تعريف جاهز لتحسين معدل التحويل.');

-- =====================================
-- 5. INSERTION CERTIFICATIONS AVEC LIENS
-- =====================================
INSERT INTO certifications (
    title, provider, year, status, certificate_urls,
    description_fr, description_en, description_hi, description_ar
) VALUES
    ('Flutter', 'Dyma & Studi', '2025', 'completed', 
     '{"certificate": "https://dyma.fr/certificates/flutter-yohann", "course": "https://dyma.fr/formations/flutter", "verification": "https://studi.fr/verify/flutter-cert"}',
     'Certification complète en développement Flutter.', 'Complete Flutter development certification.', 'Flutter विकास में पूर्ण प्रमाणन।', 'شهادة كاملة في تطوير Flutter.'),
    
    ('React Native', 'Meta', '', 'planned', 
     '{"course": "https://www.coursera.org/learn/react-native", "documentation": "https://reactnative.dev/"}',
     'Certification officielle Meta pour React Native.', 'Official Meta certification for React Native.', 'React Native के लिए आधिकारिक Meta प्रमाणन।', 'شهادة Meta الرسمية لـ React Native.'),
    
    ('React', 'Meta', '', 'planned', 
     '{"course": "https://www.coursera.org/learn/react", "documentation": "https://react.dev/"}',
     'Certification officielle Meta pour React.', 'Official Meta certification for React.', 'React के लिए आधिकारिक Meta प्रमाणन।', 'شهادة Meta الرسمية لـ React.'),
    
    ('Node.js', 'IBM', '', 'planned', 
     '{"course": "https://www.coursera.org/learn/nodejs", "documentation": "https://nodejs.org/"}',
     'Certification IBM pour Node.js.', 'IBM certification for Node.js.', 'Node.js के लिए IBM प्रमाणन।', 'شهادة IBM لـ Node.js.'),
    
    ('PHP (optionnel)', '', '', 'planned', 
     '{"documentation": "https://www.php.net/", "tutorials": "https://www.w3schools.com/php/"}',
     'Certification PHP optionnelle.', 'Optional PHP certification.', 'वैकल्पिक PHP प्रमाणन।', 'شهادة PHP اختيارية.');

-- =====================================
-- 6. INSERTION PRODUCTION GOALS MULTILINGUES
-- =====================================
INSERT INTO production_goals (
    label_fr, label_en, label_hi, label_ar,
    target, category,
    description_fr, description_en, description_hi, description_ar
) VALUES
    ('Sites React/Node', 'React/Node Sites', 'React/Node साइट्स', 'مواقع React/Node',
     100, 'web',
     '100 sites React/Node pour développer l''expertise web.', '100 React/Node sites to develop web expertise.', 'वेब विशेषज्ञता विकसित करने के लिए 100 React/Node साइटें।', '100 موقع React/Node لتطوير خبرة الويب.'),
    
    ('Apps React Native', 'React Native Apps', 'React Native ऐप्स', 'تطبيقات React Native',
     100, 'react_native',
     '100 applications React Native pour maîtriser le cross-platform.', '100 React Native apps to master cross-platform.', 'क्रॉस-प्लेटफॉर्म में महारत हासिल करने के लिए 100 React Native ऐप्स।', '100 تطبيق React Native لإتقان منصات متعددة.'),
    
    ('Apps Flutter', 'Flutter Apps', 'Flutter ऐप्स', 'تطبيقات Flutter',
     100, 'flutter',
     '100 applications Flutter pour devenir expert Flutter.', '100 Flutter apps to become Flutter expert.', 'Flutter एक्सपर्ट बनने के लिए 100 Flutter ऐप्स।', '100 تطبيق Flutter لتصبح خبير Flutter.');

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
-- SELECT 'production_goals', COUNT(*) FROM production_goals;

-- Projets par catégorie
-- SELECT 
--     UNNEST(category) as category,
--     COUNT(*) as project_count,
--     COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
-- FROM projects 
-- GROUP BY UNNEST(category)
-- ORDER BY project_count DESC;

-- Comptes actuels de projets
-- SELECT * FROM project_counts;
