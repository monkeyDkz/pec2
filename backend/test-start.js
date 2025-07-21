console.log('🔄 Test de démarrage simplifié...');

try {
    console.log('1. Chargement dotenv...');
    require('dotenv').config();
    console.log('✅ Dotenv chargé');

    console.log('2. Chargement Express...');
    const express = require('express');
    console.log('✅ Express chargé');

    console.log('3. Chargement models...');
    const { sequelize, User } = require('./models');
    console.log('✅ Models chargés');

    console.log('4. Création app Express...');
    const app = express();
    console.log('✅ App créée');

    console.log('5. Configuration middlewares...');
    app.use(express.json());
    console.log('✅ Middlewares configurés');

    console.log('6. Route de test...');
    app.get('/test', (req, res) => {
        res.json({ success: true, message: 'Test réussi!' });
    });
    console.log('✅ Route créée');

    console.log('7. Démarrage serveur...');
    const PORT = process.env.APP_PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Test serveur démarré sur le port ${PORT}`);
    });

} catch (error) {
    console.error('❌ ERREUR DÉTECTÉE:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
