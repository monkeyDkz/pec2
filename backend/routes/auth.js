// Récupérer l'utilisateur courant via le token
// (déplacé plus bas après la déclaration du router)
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

// Récupérer l'utilisateur courant via le token (pour la persistance de session)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' })
    }
    res.json(req.user.toJSON())
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message })
  }
});

// Route de test
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Routes auth fonctionnelles !',
        routes: ['POST /register', 'POST /login', 'POST /verify-email', 'POST /resend-verification', 'GET /profile']
    });
});

module.exports = router;