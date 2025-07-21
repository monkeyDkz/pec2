const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { authenticateToken, requireMerchantAccess } = require('../middlewares/auth');

// Middleware global pour toutes les routes
router.use(authenticateToken);

// =============================================================================
// DASHBOARD
// =============================================================================

/**
 * @route   GET /api/merchants/dashboard
 * @desc    Récupérer les données du dashboard marchand
 * @access  Authentifié
 */
router.get('/dashboard', merchantController.getDashboard);

// =============================================================================
// GESTION PRINCIPALE
// =============================================================================

/**
 * @route   GET /api/merchants
 * @desc    Lister mes marchands (où je suis membre)
 * @access  Authentifié
 */
router.get('/', merchantController.getMyMerchants);

// =============================================================================
// DÉCOUVERTE ET DEMANDES
// =============================================================================

/**
 * @route   GET /api/merchants/available
 * @desc    Lister les marchands disponibles pour rejoindre
 * @access  Authentifié
 * @params  ?business_type=e-commerce&page=1&limit=20
 */
router.get('/available', merchantController.getAvailableMerchants);

/**
 * @route   POST /api/merchants/request
 * @desc    Créer une demande de marchand (création ou rejoindre)
 * @access  Authentifié
 * @body    { "type": "create_merchant" | "join_merchant", ... }
 */
router.post('/request', merchantController.createMerchantRequest);

/**
 * @route   GET /api/merchants/my-requests
 * @desc    Récupérer mes demandes de marchand
 * @access  Authentifié
 */
router.get('/my-requests', merchantController.getUserMerchantRequests);

/**
 * @route   POST /api/merchants/join-request
 * @desc    Faire une demande pour rejoindre un marchand existant
 * @access  Authentifié
 * @body    { "merchantId": "uuid", "requestedRole": "developer", "justification": "..." }
 */
router.post('/join-request', merchantController.createJoinRequest);

/**
 * @route   POST /api/merchants/create-request
 * @desc    Faire une demande pour créer un nouveau marchand
 * @access  Authentifié
 * @body    { "merchantName": "...", "websiteUrl": "...", "companyName": "...", ... }
 */
router.post('/create-request', merchantController.createMerchantRequest);

/**
 * @route   GET /api/merchants/my-requests
 * @desc    Voir mes demandes en cours
 * @access  Authentifié
 * @params  ?status=pending
 */
router.get('/my-requests', merchantController.getMyRequests);

/**
 * @route   GET /api/merchants/my-merchants
 * @desc    Voir mes marchands (où je suis membre)
 * @access  Authentifié
 */
router.get('/my-merchants', merchantController.getMyMerchants);

// =============================================================================
// GESTION DES MARCHANDS (POUR LES MEMBRES)
// =============================================================================

/**
 * @route   GET /api/merchants/:id/details
 * @desc    Voir les détails d'un marchand dont je suis membre
 * @access  Membre du marchand
 */
router.get('/:id/details', requireMerchantAccess(), merchantController.getMerchantDetails);

/**
 * @route   GET /api/merchants/:id/members
 * @desc    Voir les membres d'un marchand (si admin/manager)
 * @access  Manager/Admin du marchand
 */
router.get('/:id/members', requireMerchantAccess('manager'), merchantController.getMerchantMembers);

/**
 * @route   PUT /api/merchants/:id
 * @desc    Mettre à jour les informations d'un marchand (si admin/manager)
 * @access  Manager/Admin du marchand
 * @body    { "description": "...", "webhook_url": "..." }
 */
router.put('/:id', requireMerchantAccess('manager'), merchantController.updateMerchant);

/**
 * @route   POST /api/merchants/:id/regenerate-keys
 * @desc    Régénérer les clés API (si admin)
 * @access  Admin du marchand
 */
router.post('/:id/regenerate-keys', requireMerchantAccess('admin'), merchantController.regenerateApiKeys);

// =============================================================================
// MERCHANT DASHBOARD API ROUTES
// =============================================================================

/**
 * @route   GET /api/merchants/:id/transactions
 * @desc    Lister les transactions d'un marchand
 * @access  Membre du marchand
 */
router.get('/:id/transactions', requireMerchantAccess(), merchantController.getMerchantTransactions);

/**
 * @route   GET /api/merchants/:id/credentials
 * @desc    Obtenir les credentials d'un marchand
 * @access  Membre du marchand
 */
router.get('/:id/credentials', requireMerchantAccess(), merchantController.getMerchantCredentials);

/**
 * @route   POST /api/merchants/:id/refund
 * @desc    Effectuer un remboursement
 * @access  Manager/Admin du marchand
 */
router.post('/:id/refund', requireMerchantAccess('manager'), merchantController.createRefund);

/**
 * @route   GET /api/merchants/:id/refunds
 * @desc    Lister les remboursements d'un marchand
 * @access  Membre du marchand
 */
router.get('/:id/refunds', requireMerchantAccess(), merchantController.getMerchantRefunds);

/**
 * @route   POST /api/merchants/:id/regenerate-secret
 * @desc    Régénérer le secret API
 * @access  Admin du marchand
 */
router.post('/:id/regenerate-secret', requireMerchantAccess('admin'), merchantController.regenerateSecret);

/**
 * @route   POST /api/merchants/:id/test-webhook
 * @desc    Tester le webhook d'un marchand
 * @access  Manager/Admin du marchand
 */
router.post('/:id/test-webhook', requireMerchantAccess('manager'), merchantController.testWebhook);

// =============================================================================
// ROUTE DE TEST
// =============================================================================

/**
 * @route   GET /api/merchants/test
 * @desc    Route de test pour vérifier l'authentification
 * @access  Authentifié
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Routes marchands fonctionnelles !',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
