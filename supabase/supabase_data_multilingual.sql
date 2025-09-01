-- =====================================
-- DONNÉES MULTILINGUES POUR PORTFOLIO
-- Support : FR, EN, HI, AR
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
    
    -- Conversion Flutter
    ('cf1', 'Kanban', 'Kanban', 'कानबान', 'كانبان', 
     'Migration de l''app Kanban en Flutter.', 'Migration of Kanban app to Flutter.', 'Kanban ऐप का Flutter में माइग्रेशन।', 'ترحيل تطبيق Kanban إلى Flutter.',
     ARRAY['mobile'], ARRAY['Flutter', 'Dart'], 95, '#', 'completed', false, 'Flutter', 1),
    
    ('cf2', 'DevJobs', 'DevJobs', 'डेवजॉब्स', 'ديف جوبس', 
     'Migration DevJobs avec Flutter.', 'DevJobs migration with Flutter.', 'Flutter के साथ DevJobs माइग्रेशन।', 'ترحيل DevJobs مع Flutter.',
     ARRAY['mobile'], ARRAY['Flutter'], 110, '#', 'completed', false, 'Flutter', 1),
    
    ('cf3', 'Designo', 'Designo', 'डिजाइनो', 'ديزاينو', 
     'Conversion du site Designo en Flutter.', 'Conversion of Designo site to Flutter.', 'Designo साइट का Flutter में रूपांतरण।', 'تحويل موقع Designo إلى Flutter.',
     ARRAY['mobile'], ARRAY['Flutter'], 75, '#', 'completed', false, 'Flutter', 1),
    
    -- Conversion React Native
    ('crn1', 'MyTeam', 'MyTeam', 'माईटीम', 'ماي تيم', 
     'Version mobile cross‑platform de MyTeam.', 'Cross-platform mobile version of MyTeam.', 'MyTeam का क्रॉस-प्लेटफॉर्म मोबाइल संस्करण।', 'نسخة الجوال متعددة المنصات من MyTeam.',
     ARRAY['mobile'], ARRAY['React Native', 'TypeScript'], 130, '#', 'completed', false, 'React Native', 1),
    
    ('crn2', 'Kanban RN', 'Kanban RN', 'कानबान RN', 'كانبان RN', 
     'Migration Kanban en React Native.', 'Kanban migration to React Native.', 'React Native में Kanban माइग्रेशन।', 'ترحيل Kanban إلى React Native.',
     ARRAY['mobile'], ARRAY['React Native', 'TypeScript'], 140, '#', 'completed', false, 'React Native', 1),
    
    ('crn3', 'DevJobs RN', 'DevJobs RN', 'डेवजॉब्स RN', 'ديف جوبس RN', 
     'Migration DevJobs en React Native.', 'DevJobs migration to React Native.', 'React Native में DevJobs माइग्रेशन।', 'ترحيل DevJobs إلى React Native.',
     ARRAY['mobile'], ARRAY['React Native', 'TypeScript'], 120, '#', 'completed', false, 'React Native', 1),
    
    ('crn4', 'Designo RN', 'Designo RN', 'डिजाइनो RN', 'ديزاينو RN', 
     'Conversion Designo en React Native.', 'Designo conversion to React Native.', 'React Native में Designo रूपांतरण।', 'تحويل Designo إلى React Native.',
     ARRAY['mobile'], ARRAY['React Native', 'TypeScript'], 100, '#', 'completed', false, 'React Native', 1),
    
    -- Conversion React
    ('cre1', 'Google Mirror', 'Google Mirror', 'गूगल मिरर', 'جوجل ميرور', 
     'Clone expérimental de Google.', 'Experimental Google clone.', 'Google का प्रयोगात्मक क्लोन।', 'نسخة تجريبية من Google.',
     ARRAY['web'], ARRAY['React', 'Node.js'], 320, '#', 'completed', false, 'React', 1),
    
    ('cre2', 'Twitter Mirror', 'Twitter Mirror', 'ट्विटर मिरर', 'تويتر ميرور', 
     'Clone expérimental de Twitter.', 'Experimental Twitter clone.', 'Twitter का प्रयोगात्मक क्लोन।', 'نسخة تجريبية من Twitter.',
     ARRAY['web'], ARRAY['React', 'Tailwind'], 280, '#', 'completed', false, 'React', 1),
    
    ('cre3', 'YouTube Mirror', 'YouTube Mirror', 'यूट्यूब मिरर', 'يوتيوب ميرور', 
     'Clone expérimental de YouTube.', 'Experimental YouTube clone.', 'YouTube का प्रयोगात्मक क्लोन।', 'نسخة تجريبية من YouTube.',
     ARRAY['web'], ARRAY['React', 'Node.js'], 350, '#', 'completed', false, 'React', 1),
    
    -- Amélioration avec Cursor
    ('cur1', 'MiniMacOS', 'MiniMacOS', 'मिनीमैकओएस', 'ميني ماك أو إس', 
     'OS minimal simulé dans le navigateur.', 'Minimal OS simulated in browser.', 'ब्राउज़र में सिमुलेटेड न्यूनतम OS।', 'نظام تشغيل مبسط محاكى في المتصفح.',
     ARRAY['web'], ARRAY['React', 'Cursor'], 400, '#', 'completed', true, 'React', 5),
    
    ('cur2', 'DevJobs Optimized', 'DevJobs Optimized', 'डेवजॉब्स अनुकूलित', 'ديف جوبس محسن', 
     'Optimisation DevJobs avec Cursor.', 'DevJobs optimization with Cursor.', 'Cursor के साथ DevJobs अनुकूलन।', 'تحسين DevJobs مع Cursor.',
     ARRAY['web'], ARRAY['React', 'Cursor'], 150, '#', 'completed', false, 'React', 1),
    
    ('cur3', 'Kanban Optimized', 'Kanban Optimized', 'कानबान अनुकूलित', 'كانبان محسن', 
     'Optimisation Kanban avec Cursor.', 'Kanban optimization with Cursor.', 'Cursor के साथ Kanban अनुकूलन।', 'تحسين Kanban مع Cursor.',
     ARRAY['web'], ARRAY['React', 'Cursor'], 160, '#', 'completed', false, 'React', 1),
    
    ('cur4', 'Portfolio Optimized', 'Portfolio Optimized', 'पोर्टफोलियो अनुकूलित', 'محفظة محسنة', 
     'Portfolio optimisé avec Cursor.', 'Portfolio optimized with Cursor.', 'Cursor के साथ अनुकूलित पोर्टफोलियो।', 'محفظة محسنة مع Cursor.',
     ARRAY['web'], ARRAY['React', 'Cursor'], 200, '#', 'completed', false, 'React', 1),
    
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
     '100 applications Flutter pour devenir expert Flutter.', '100 Flutter apps to become Flutter expert.', 'Flutter एक्सपर्ट बनने के लिए 100 Flutter ऐप्स।', '100 تطبيق Flutter لتصبح خبير Flutter.'),
    
    ('Apps Mobile', 'Mobile Apps', 'मोबाइल ऐप्स', 'التطبيقات المحمولة',
     200, 'mobile',
     'Total des applications mobiles (Flutter + React Native).', 'Total mobile applications (Flutter + React Native).', 'कुल मोबाइल एप्लिकेशन (Flutter + React Native)।', 'إجمالي التطبيقات المحمولة (Flutter + React Native).');
