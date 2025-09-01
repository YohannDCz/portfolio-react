# Portfolio Multilingue V2 - Documentation

## 🌍 Changements Implémentés

### ✅ Support Multilingue Complet
- **Langues supportées** : Français (FR), Anglais (EN), Hindi (HI), Arabe (AR)
- **Sélecteur de langue** dans la navbar avec drapeaux
- **Support RTL** pour l'arabe
- **Traductions complètes** de l'interface utilisateur

### ✅ Base de Données Restructurée

#### Tables Modifiées :
1. **`profiles`** - Colonnes multilingues pour title, tagline, availability
2. **`skills`** - Noms d'affichage dans toutes les langues
3. **`projects`** - Titres et descriptions multilingues + flag `is_mega_project`
4. **`freelance_platforms`** - Descriptions multilingues
5. **`certifications`** - Support des liens multiples (JSONB) + descriptions multilingues
6. **`production_goals`** - Labels et descriptions multilingues

#### Tables Supprimées :
- ❌ `roadmap_categories` et `roadmap_items` (gérés dans Kanban séparé)
- ❌ `mega_projects` (intégré comme flag dans `projects`)

#### Nouvelles Fonctionnalités :
- 🔢 **Comptage automatique** des projets via vues SQL
- 🔗 **Liens multiples** pour les certifications (cours, certificat, vérification)
- 🏷️ **Flag mega projet** au lieu de table séparée
- 🌐 **Support langue** dans les messages de contact

## 📁 Fichiers Créés

### Base de Données :
- `supabase_schema.sql` - Schéma mis à jour avec support multilingue
- `supabase_data_multilingual.sql` - Données d'exemple multilingues
- `supabase_complete_v2.sql` - Script complet (schéma + données)

### Code React :
- `src/app/page_v2.jsx` - Version multilingue du portfolio

### Documentation :
- `DATABASE_SETUP.md` - Instructions d'installation
- `README_MULTILINGUAL.md` - Ce fichier

## 🚀 Migration Guide

### 1. Base de Données Supabase

```bash
# Exécuter dans l'éditeur SQL de Supabase
# Copier le contenu de supabase_complete_v2.sql
```

### 2. Code React

```bash
# Remplacer le fichier principal
mv src/app/page_v2.jsx src/app/page.jsx
```

### 3. Dépendances (si nécessaire)

```bash
npm install @supabase/supabase-js
```

## 🎨 Nouvelles Fonctionnalités Interface

### Sélecteur de Langue
```jsx
<Select value={currentLang} onValueChange={switchLanguage}>
  <SelectContent>
    <SelectItem value="fr">🇫🇷</SelectItem>
    <SelectItem value="en">🇺🇸</SelectItem>
    <SelectItem value="hi">🇮🇳</SelectItem>
    <SelectItem value="ar">🇸🇦</SelectItem>
  </SelectContent>
</Select>
```

### Hook Multilingue
```jsx
const { currentLang, switchLanguage } = useLanguage();
const t = TRANSLATIONS[currentLang];
```

### Support RTL
```jsx
<div className={`min-h-screen ${isRTL ? 'rtl' : ''}`}>
```

### Certifications avec Liens
```jsx
{c.urls && (
  <div className="flex flex-wrap gap-1 mt-2">
    {Object.entries(c.urls).map(([type, url]) => (
      <a key={type} href={url} target="_blank" rel="noreferrer">
        <Button size="sm" variant="ghost">
          <ExternalLink className="h-3 w-3 mr-1" />
          {type}
        </Button>
      </a>
    ))}
  </div>
)}
```

### Projets Mega avec Badge
```jsx
{project.isMegaProject && (
  <div className="absolute top-2 right-2 z-10">
    <Badge variant="destructive" className="text-xs">MEGA</Badge>
  </div>
)}
```

## 📊 Structure Base de Données

### Exemple Profile Multilingue :
```sql
INSERT INTO profiles (
    name,
    title_fr, title_en, title_hi, title_ar,
    tagline_fr, tagline_en, tagline_hi, tagline_ar,
    spoken_languages
) VALUES (
    'Yohann Di Crescenzo',
    'Développeur Full‑Stack Web et Mobile',
    'Full‑Stack Web and Mobile Developer',
    'फुल-स्टैक वेब और मोबाइल डेवलपर',
    'مطور ويب وموبايل متكامل',
    '🎯 Objectif : Construire un profil complet...',
    '🎯 Goal: Build a complete profile...',
    '🎯 लक्ष्य: सहस्राब्दी का लक्ष्य रखने के लिए...',
    '🎯 الهدف: بناء ملف تعريف كامل...',
    ARRAY['FR', 'EN', 'HI', 'AR']
);
```

### Exemple Certification avec Liens :
```sql
INSERT INTO certifications (
    title, provider, year, status, certificate_urls
) VALUES (
    'Flutter', 'Dyma & Studi', '2025', 'completed',
    '{"certificate": "https://dyma.fr/certificates/flutter-yohann", 
      "course": "https://dyma.fr/formations/flutter", 
      "verification": "https://studi.fr/verify/flutter-cert"}'
);
```

### Comptage Automatique des Projets :
```sql
-- Vue pour compter automatiquement
CREATE OR REPLACE VIEW project_counts AS
SELECT 
    'web' as category,
    COUNT(*) as completed_count,
    COUNT(*) FILTER (WHERE is_mega_project = true) as mega_count
FROM projects 
WHERE 'web' = ANY(category) AND status = 'completed';
```

## 🔄 Prochaines Étapes

### Phase 1 : Base
- [x] Implémenter le support multilingue
- [x] Restructurer la base de données
- [x] Adapter le code React

### Phase 2 : Intégration (À faire)
- [ ] Connecter Supabase au code React
- [ ] Remplacer les données statiques par des appels API
- [ ] Implémenter la gestion d'état (Redux/Zustand)
- [ ] Ajouter le cache et l'optimisation

### Phase 3 : Fonctionnalités Avancées (À faire)
- [ ] Admin panel pour gérer le contenu
- [ ] Système de traduction automatique
- [ ] Analytics multilingues
- [ ] SEO multilingue avec Next.js

## 📧 Support

### Requêtes Utiles Supabase :

```sql
-- Vérifier les données par langue
SELECT 
    title_fr, title_en, title_hi, title_ar
FROM profiles;

-- Compter les projets par catégorie
SELECT * FROM project_counts;

-- Projets mega seulement
SELECT title_fr, stack, priority 
FROM projects 
WHERE is_mega_project = true 
ORDER BY priority DESC;
```

### Variables d'Environnement :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

**✨ Votre portfolio est maintenant prêt pour un public international !**
