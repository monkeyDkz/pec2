const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operationController');
const { authenticateApiKey, authenticateToken } = require('../middlewares/auth');

// =============================================================================
// ROUTES PSP (accès direct depuis le PSP Emulator)
// =============================================================================

/**
 * @route   POST /api/operations
 * @desc    Créer une nouvelle opération (appelé par le PSP)
 * @access  PSP (X-PSP-Secret)
 */
router.post('/', operationController.createOperation);

// =============================================================================
// ROUTES API MARCHAND (avec API key)
// =============================================================================

/**
 * @route   GET /api/operations/:id
 * @desc    Obtenir les détails d'une opération
 * @access  Marchand (API Key)
 */
router.get('/:id', authenticateApiKey, operationController.getOperation);

/**
 * @route   GET /api/operations
 * @desc    Lister toutes les opérations du marchand
 * @access  Marchand (API Key)
 * @params  ?page=1&limit=20&type=capture&status=success&transaction_id=...
 */
router.get('/', authenticateApiKey, operationController.getOperations);

/**
 * @route   POST /api/operations/:id/cancel
 * @desc    Annuler une opération (si possible)
 * @access  Marchand (API Key)
 */
router.post('/:id/cancel', authenticateApiKey, operationController.cancelOperation);

/**
 * @route   GET /api/operations/stats/summary
 * @desc    Obtenir les statistiques des opérations
 * @access  Marchand (API Key)
 * @params  ?from_date=...&to_date=...
 */
router.get('/stats/summary', authenticateApiKey, operationController.getOperationStats);

// =============================================================================
// ROUTES BACKOFFICE (avec authentification JWT)
// =============================================================================

/**
 * @route   GET /api/operations/backoffice/list
 * @desc    Lister toutes les opérations (admin/marchand connecté)
 * @access  Authentifié
 */
router.get('/backoffice/list', authenticateToken, (req, res) => {
  // Si l'utilisateur n'est pas admin, filtrer par ses marchands
  if (req.user.role !== 'admin') {
    // TODO: récupérer les marchands de l'utilisateur et filtrer
    req.merchant = { id: req.user.merchant_ids }; // À implémenter
  }
  operationController.getOperations(req, res);
});

/**
 * @route   GET /api/operations/backoffice/:id
 * @desc    Voir les détails d'une opération (admin/marchand)
 * @access  Authentifié
 */
router.get('/backoffice/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    // TODO: vérifier que l'utilisateur a accès à cette opération
    req.merchant = { id: req.user.merchant_ids };
  }
  operationController.getOperation(req, res);
});

/**
 * @route   GET /api/operations/backoffice/stats/summary
 * @desc    Statistiques globales des opérations (admin)
 * @access  Admin
 */
router.get('/backoffice/stats/summary', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  // TODO: implémenter les stats globales
  operationController.getOperationStats(req, res);
});

module.exports = router;
