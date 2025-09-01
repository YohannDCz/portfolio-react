# Configuration Base de Données Portfolio - Supabase

## 📋 Vue d'ensemble

Ce document contient toutes les commandes SQL nécessaires pour créer et configurer votre base de données PostgreSQL sur Supabase pour votre portfolio.

## 🚀 Instructions d'installation

### Étape 1: Connexion à Supabase
1. Connectez-vous à votre projet Supabase
2. Allez dans l'onglet **SQL Editor**

### Étape 2: Exécution du script
Copiez et exécutez le contenu du fichier `supabase_complete.sql` dans l'éditeur SQL de Supabase.

**OU** exécutez les fichiers séparément dans cet ordre :
1. `supabase_schema.sql` (Création des tables et structure)
2. `supabase_data.sql` (Insertion des données)

## 📊 Structure de la Base de Données

### Tables créées :

1. **`profiles`** - Informations personnelles du portfolio
2. **`skills`** - Compétences techniques avec niveaux
3. **`projects`** - Projets avec catégories, tags et étoiles
4. **`freelance_platforms`** - Plateformes de freelance
5. **`certifications`** - Certifications et formations
6. **`roadmap_categories`** - Catégories de la roadmap
7. **`roadmap_items`** - Éléments de la roadmap de développement
8. **`mega_projects`** - Grands projets stratégiques
9. **`production_goals`** - Objectifs de production (100 sites, 100 apps, etc.)
10. **`contact_messages`** - Messages de contact (optionnel)

## 🔧 Fonctionnalités Avancées

### Triggers automatiques :
- **`updated_at`** : Mise à jour automatique des timestamps
- **Compteur de projets** : Mise à jour automatique des objectifs de production

### Index pour performance :
- Index GIN sur les catégories et tags des projets
- Index sur les statuts et features

### Types de données spéciaux :
- **Arrays** pour catégories multiples et tags
- **UUID** comme clés primaires
- **Timestamps** avec timezone

## 📈 Données Pré-remplies

Le script inclut toutes vos données actuelles :
- **21 projets** avec leurs catégories et tags
- **10 compétences** principales
- **4 plateformes** de freelance
- **5 certifications** planifiées
- **Roadmap complète** avec catégories
- **4 mega projets** stratégiques
- **3 objectifs** de production

## 🔒 Sécurité (Optionnel)

Le script inclut des politiques RLS (Row Level Security) commentées. Pour les activer :

1. Décommentez les lignes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
2. Décommentez les politiques `CREATE POLICY`

## 🧪 Tests et Vérification

### Requêtes de vérification incluses :

```sql
-- Compter les enregistrements par table
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
-- ... etc

-- Projets par catégorie
SELECT 
    UNNEST(category) as category,
    COUNT(*) as project_count
FROM projects 
GROUP BY UNNEST(category)
ORDER BY project_count DESC;
```

## 📱 Intégration avec votre App React

### Variables d'environnement nécessaires :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Exemple de requête TypeScript :
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Récupérer tous les projets
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .order('stars', { ascending: false })

// Récupérer le profil
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

## 🔄 Migration des Données Statiques

Pour migrer de vos données statiques actuelles vers Supabase :

1. Remplacez les constantes dans `page.jsx` par des appels API
2. Créez des hooks custom pour récupérer les données
3. Implémentez un système de cache pour les performances

## 🎯 Prochaines Étapes

1. ✅ Exécuter le script SQL dans Supabase
2. 🔧 Installer les dépendances Supabase dans votre projet React
3. 🔗 Modifier le code pour utiliser les APIs Supabase
4. 🧪 Tester les requêtes et la performance
5. 🚀 Déployer la nouvelle version

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Supabase Dashboard
2. Assurez-vous que toutes les extensions sont activées
3. Contrôlez les permissions et politiques RLS
4. Testez les requêtes une par une dans l'éditeur SQL

---

**Note :** Ce script est optimisé pour PostgreSQL/Supabase et inclut toutes les données de votre portfolio actuel.
