const cron = require('node-cron');
require('dotenv').config();

console.log('🕐 Cron Service démarré');

// Tâche d'exemple - mise à jour des taux de change toutes les minutes (pour test)
cron.schedule('* * * * *', () => {
    console.log('📊 Tâche cron exécutée:', new Date().toISOString());
});

// Tâche de nettoyage quotidien
cron.schedule('0 2 * * *', () => {
    console.log('🧹 Nettoyage quotidien des logs');
});

// Garder le processus en vie
console.log('⏰ Cron jobs programmés - Service en attente...');

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu - Arrêt du Cron Service');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Signal SIGINT reçu - Arrêt du Cron Service');
    process.exit(0);
});

// Empêcher le processus de se terminer
setInterval(() => {
    // Ne rien faire, juste garder le processus actif
}, 30000);