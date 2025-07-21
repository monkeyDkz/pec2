// scripts/init-mongodb.js
// Script d'initialisation pour MongoDB

// Connexion à la base payment_analytics
db = db.getSiblingDB('payment_analytics');

// Créer les collections pour les statistiques
db.createCollection('transaction_stats');
db.createCollection('merchant_analytics');
db.createCollection('daily_volumes');
db.createCollection('search_logs');
db.createCollection('user_activity');
db.createCollection('payment_events');

// Index pour optimiser les performances des statistiques
db.transaction_stats.createIndex({ "date": 1 });
db.transaction_stats.createIndex({ "merchant_id": 1, "date": 1 });
db.transaction_stats.createIndex({ "status": 1, "date": 1 });

db.merchant_analytics.createIndex({ "merchant_id": 1 });
db.merchant_analytics.createIndex({ "period": 1, "merchant_id": 1 });

db.daily_volumes.createIndex({ "date": 1 });
db.daily_volumes.createIndex({ "merchant_id": 1, "date": 1 });

db.search_logs.createIndex({ "timestamp": 1 });
db.search_logs.createIndex({ "user_id": 1, "timestamp": 1 });

db.user_activity.createIndex({ "user_id": 1, "timestamp": 1 });
db.user_activity.createIndex({ "timestamp": 1 });

db.payment_events.createIndex({ "transaction_id": 1 });
db.payment_events.createIndex({ "timestamp": 1 });
db.payment_events.createIndex({ "event_type": 1, "timestamp": 1 });

// Insérer des données d'exemple pour les statistiques
db.transaction_stats.insertMany([
    {
        date: new Date('2024-01-01'),
        merchant_id: 1,
        total_transactions: 150,
        successful_transactions: 142,
        failed_transactions: 8,
        total_volume: 45678.90,
        average_amount: 304.53,
        currency: 'EUR',
        created_at: new Date()
    },
    {
        date: new Date('2024-01-02'),
        merchant_id: 1,
        total_transactions: 203,
        successful_transactions: 195,
        failed_transactions: 8,
        total_volume: 67890.45,
        average_amount: 334.30,
        currency: 'EUR',
        created_at: new Date()
    }
]);

print('✅ Base MongoDB payment_analytics initialisée avec succès !');
print('📊 Collections créées : transaction_stats, merchant_analytics, daily_volumes, search_logs, user_activity, payment_events');
print('🔍 Index optimisés pour les requêtes de statistiques et recherches');
