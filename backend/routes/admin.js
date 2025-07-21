const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Middleware global pour toutes les routes admin
router.use(authenticateToken);
router.use(requireAdmin);

// =============================================================================
// GESTION DES DEMANDES DE MARCHANDS
// =============================================================================

/**
 * @route   GET /api/admin/merchant-requests
 * @desc    Lister toutes les demandes avec filtres optionnels
 * @access  Admin
 * @params  ?status=pending&type=create_merchant&page=1&limit=20
 */
router.get('/merchant-requests', adminController.getMerchantRequests);

/**
 * @route   GET /api/admin/merchant-requests/:id
 * @desc    Voir le détail d'une demande
 * @access  Admin
 */
router.get('/merchant-requests/:id', adminController.getMerchantRequest);

/**
 * @route   POST /api/admin/merchant-requests/:id/approve
 * @desc    Approuver une demande (création ou affiliation)
 * @access  Admin
 * @body    { "adminNotes": "Notes optionnelles" }
 */
router.post('/merchant-requests/:id/approve', adminController.approveMerchantRequest);

/**
 * @route   POST /api/admin/merchant-requests/:id/reject
 * @desc    Rejeter une demande
 * @access  Admin
 * @body    { "adminNotes": "Raison du rejet" }
 */
router.post('/merchant-requests/:id/reject', adminController.rejectMerchantRequest);

// =============================================================================
// GESTION DES MARCHANDS
// =============================================================================

/**
 * @route   GET /api/admin/merchants
 * @desc    Lister tous les marchands avec filtres
 * @access  Admin
 * @params  ?status=active&page=1&limit=20
 */
router.get('/merchants', adminController.getMerchants);

/**
 * @route   POST /api/admin/merchants/:id/suspend
 * @desc    Suspendre un marchand
 * @access  Admin
 * @body    { "reason": "Raison de la suspension" }
 */
router.post('/merchants/:id/suspend', adminController.suspendMerchant);

/**
 * @route   POST /api/admin/merchants/:id/activate
 * @desc    Réactiver un marchand suspendu
 * @access  Admin
 * @body    { "notes": "Notes de réactivation" }
 */
router.post('/merchants/:id/activate', adminController.activateMerchant);

/**
 * @route   POST /api/admin/merchants/:id/regenerate-keys
 * @desc    Régénérer les clés API d'un marchand
 * @access  Admin
 */
router.post('/merchants/:id/regenerate-keys', adminController.regenerateApiKeys);

// =============================================================================
// GESTION DES TRANSACTIONS
// =============================================================================

/**
 * @route   GET /api/admin/transactions
 * @desc    Lister toutes les transactions avec filtres
 * @access  Admin
 * @params  ?status=pending&merchantId=123&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
 */
router.get('/transactions', adminController.getTransactions);

/**
 * @route   GET /api/admin/transactions/stats
 * @desc    Obtenir les statistiques des transactions
 * @access  Admin
 */
router.get('/transactions/stats', adminController.getTransactionStats);

/**
 * @route   POST /api/admin/transactions/:id/refund
 * @desc    Rembourser une transaction
 * @access  Admin
 * @body    { "reason": "Raison du remboursement" }
 */
router.post('/transactions/:id/refund', adminController.refundTransaction);

/**
 * @route   POST /api/admin/transactions/:id/force-complete
 * @desc    Forcer la validation d'une transaction
 * @access  Admin
 */
router.post('/transactions/:id/force-complete', adminController.forceCompleteTransaction);

// =============================================================================
// STATISTIQUES ET MONITORING
// =============================================================================

/**
 * @route   GET /api/admin/stats
 * @desc    Obtenir les statistiques de la plateforme
 * @access  Admin
 */
router.get('/stats', adminController.getStats);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Obtenir les données du dashboard admin
 * @access  Admin
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   POST /api/admin/impersonate/:userId
 * @desc    Se connecter en tant qu'utilisateur (impersonation)
 * @access  Admin
 */
router.post('/impersonate/:userId', adminController.impersonateUser);

/**
 * @route   GET /api/admin/settings
 * @desc    Obtenir les paramètres de la plateforme
 * @access  Admin
 */
router.get('/settings', adminController.getPlatformSettings);

/**
 * @route   POST /api/admin/settings
 * @desc    Sauvegarder les paramètres de la plateforme
 * @access  Admin
 */
router.post('/settings', adminController.savePlatformSettings);

// =============================================================================
// ROUTE DE TEST
// =============================================================================

/**
 * @route   GET /api/admin/test
 * @desc    Route de test pour vérifier l'accès admin
 * @access  Admin
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Accès admin validé !',
    admin: {
      id: req.user.id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
