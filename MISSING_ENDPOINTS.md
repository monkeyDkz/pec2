# ENDPOINTS BACKEND MANQUANTS

## 1. GESTION UTILISATEURS
```javascript
// Routes à ajouter dans /routes/users.js
GET    /api/users/profile              // Profil utilisateur
PUT    /api/users/profile              // Modifier profil
POST   /api/users/change-password      // Changer mot de passe
GET    /api/users/merchants            // Mes marchands (où je suis membre)
```

## 2. GESTION MARCHANDS AVANCÉE
```javascript
// Routes à ajouter dans /routes/merchants.js
GET    /api/merchants/:id              // Détails d'un marchand
PUT    /api/merchants/:id              // Modifier marchand
GET    /api/merchants/:id/team         // Équipe du marchand
POST   /api/merchants/:id/team/invite  // Inviter membre
DELETE /api/merchants/:id/team/:userId // Retirer membre
GET    /api/merchants/:id/settings     // Paramètres marchand
PUT    /api/merchants/:id/settings     // Modifier paramètres
POST   /api/merchants/:id/regenerate-keys // Régénérer clés API
```

## 3. GESTION TRANSACTIONS AVANCÉE
```javascript
// Routes à ajouter dans /routes/transactions.js
GET    /api/transactions              // Liste paginée avec filtres
POST   /api/transactions/:id/refund   // Rembourser transaction
GET    /api/transactions/:id/operations // Opérations d'une transaction
POST   /api/transactions/:id/capture  // Capturer autorisation
POST   /api/transactions/:id/cancel   // Annuler transaction
```

## 4. WEBHOOKS ET NOTIFICATIONS
```javascript
// Routes à ajouter dans /routes/webhooks.js
POST   /api/webhooks/merchant/:merchantId // Webhook vers marchand
GET    /api/webhooks/logs             // Logs des webhooks
POST   /api/webhooks/retry/:id        // Relancer webhook
```

## 5. ADMINISTRATION AVANCÉE
```javascript
// Routes à ajouter dans /routes/admin.js
GET    /api/admin/dashboard/stats     // Statistiques dashboard
GET    /api/admin/users              // Gestion utilisateurs
POST   /api/admin/users/:id/suspend  // Suspendre utilisateur
GET    /api/admin/logs               // Logs système
GET    /api/admin/reports            // Rapports
POST   /api/admin/merchants/:id/suspend // Suspendre marchand
POST   /api/admin/merchants/:id/activate // Activer marchand
```

## 6. AUTHENTIFICATION AVANCÉE
```javascript
// Routes à ajouter dans /routes/auth.js
POST   /api/auth/forgot-password     // Mot de passe oublié
POST   /api/auth/reset-password      // Reset mot de passe
POST   /api/auth/change-email        // Changer email
GET    /api/auth/sessions            // Sessions actives
DELETE /api/auth/sessions/:id        // Supprimer session
```
