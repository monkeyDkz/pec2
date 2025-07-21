const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validation'); // Avec 's'
const { authenticateToken } = require('../middlewares/auth'); // Avec 's'

// Routes publiques
router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/verify-email', validate('verifyEmail'), authController.verifyEmail);
router.post('/resend-verification', validate('resendVerification'), authController.resendVerification);

// Routes protégées
router.get('/profile', authenticateToken, authController.getProfile);

// Route de test
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Routes auth fonctionnelles !',
        routes: ['POST /register', 'POST /login', 'POST /verify-email', 'POST /resend-verification', 'GET /profile']
    });
});

module.exports = router;