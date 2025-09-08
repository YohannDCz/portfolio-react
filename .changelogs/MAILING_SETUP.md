# 📧 Configuration du Système de Mailing

Ce guide explique comment configurer le système de mailing complet pour votre portfolio.

## 🚀 Fonctionnalités Implémentées

### ✅ Déjà Fonctionnel (sans configuration supplémentaire)
- ✅ Formulaire de contact multilingue (FR, EN, HI, AR)
- ✅ Sauvegarde des messages dans Supabase
- ✅ Interface admin pour consulter les messages (`/admin/contact`)
- ✅ Gestion des statuts (nouveau, lu, répondu)
- ✅ Notifications visuelles élégantes
- ✅ Validation des données
- ✅ Support RTL et responsive design

### 📧 Envoi d'Emails (Configuration Requise)
- 📧 Envoi automatique d'emails via Resend
- 📧 Templates HTML responsive
- 📧 Support multilingue des emails
- 📧 Auto-reply avec les détails du contact

## ⚙️ Configuration

### 1. Variables d'Environnement

Créez un fichier `.env.local` avec les variables suivantes :

```bash
# Supabase Configuration (Requis)
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_supabase

# Email Configuration via Resend (Optionnel)
RESEND_API_KEY=votre_cle_api_resend
FROM_EMAIL=portfolio@votredomaine.com
TO_EMAIL=votre@email.com
```

### 2. Configuration Resend (Optionnel)

1. **Créer un compte Resend** : [https://resend.com](https://resend.com)
2. **Obtenir votre clé API** : Dashboard → API Keys → Create API Key
3. **Configurer votre domaine** : Dashboard → Domains → Add Domain
4. **Ajouter les variables d'environnement** dans `.env.local`

### 3. Base de Données Supabase

La table `contact_messages` doit exister dans votre base Supabase :

```sql
CREATE TABLE contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    language VARCHAR(2) DEFAULT 'fr',
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_language ON contact_messages (language);
```

## 🎯 Utilisation

### Interface Publique
- **Formulaire de contact** : Section "Contact" sur la page principale
- **Notifications** : Feedback visuel automatique après envoi
- **Support multilingue** : Interface adaptée à la langue sélectionnée

### Interface Admin
- **Accès** : `/admin/contact` (authentification requise)
- **Fonctionnalités** :
  - Voir tous les messages reçus
  - Filtrer par statut et langue
  - Marquer comme lu/répondu
  - Répondre directement par email
  - Supprimer les messages

## 🔄 Flux de Fonctionnement

1. **Utilisateur remplit le formulaire** → Validation côté client
2. **Envoi vers l'API** → `/api/send-email`
3. **Sauvegarde en base** → Table `contact_messages`
4. **Envoi d'email** → Resend (si configuré)
5. **Notification utilisateur** → Confirmation visuelle
6. **Consultation admin** → Interface dédiée

## 🛠️ Personnalisation

### Templates d'Email
Modifiez la fonction `getEmailTemplate` dans `/src/app/api/send-email/route.js` pour personnaliser :
- Design des emails
- Contenu multilingue
- Branding/couleurs

### Interface Admin
L'interface admin se trouve dans `/src/app/admin/contact/page.jsx` :
- Colonnes affichées
- Filtres disponibles
- Actions possibles

### Notifications
Personnalisez les notifications dans `/src/components/Notification.jsx` :
- Styles visuels
- Durée d'affichage
- Types de notifications

## 🚨 Résolution de Problèmes

### Build Errors
Si vous avez des erreurs de build liées à Resend ou Supabase :
```bash
# Le système fonctionne même sans configuration complète
# Les emails ne seront simplement pas envoyés
npm run build
```

### Messages Non Sauvegardés
Vérifiez :
1. Variables Supabase dans `.env.local`
2. Permissions RLS sur la table `contact_messages`
3. Clé de service Supabase

### Emails Non Envoyés
Vérifiez :
1. Variable `RESEND_API_KEY` dans `.env.local`
2. Domaine configuré dans Resend
3. Quotas Resend respectés

## 📈 Améliorations Futures

- [ ] Support de webhooks pour notifications en temps réel
- [ ] Intégration avec d'autres services email (SendGrid, Mailgun)
- [ ] Système de templates d'email via l'interface admin
- [ ] Analytics des messages reçus
- [ ] Auto-classification des messages (spam, urgent, etc.)

## 🔗 Liens Utiles

- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Guide Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

✨ **Le système fonctionne immédiatement avec la configuration Supabase seule !**
L'ajout de Resend est optionnel pour l'envoi d'emails automatiques.
