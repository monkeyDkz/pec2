const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const operationController = require('../controllers/operationController');
const { authenticateApiKey, authenticateToken } = require('../middlewares/auth');
const { validateCreateTransaction, validateProcessPayment } = require('../middlewares/validation');

// =============================================================================
// ROUTES PUBLIQUES (avec token de paiement)
// =============================================================================

/**
 * @route   POST /api/transactions/:id/process
 * @desc    Traiter le paiement d'une transaction (page de paiement)
 * @access  Public (avec token)
 * @body    { "token": "...", "payment_method": { ... } }
 */
router.post('/:id/process', validateProcessPayment, transactionController.processPayment);

/**
 * @route   POST /api/transactions/:id/cancel
 * @desc    Annuler une transaction
 * @access  Public (avec token)
 * @body    { "token": "..." }
 */
router.post('/:id/cancel', transactionController.cancelTransaction);

// =============================================================================
// ROUTES API MARCHAND (avec API key)
// =============================================================================

/**
 * @route   POST /api/transactions
 * @desc    Créer une nouvelle transaction de paiement
 * @access  Marchand (API Key)
 * @body    { "order_id": "...", "amount": 100.00, "customer_email": "...", ... }
 */
router.post('/', authenticateApiKey, validateCreateTransaction, transactionController.createTransaction);

/**
 * @route   GET /api/transactions/:id
 * @desc    Obtenir les détails d'une transaction
 * @access  Marchand (API Key)
 */
router.get('/:id', authenticateApiKey, transactionController.getTransaction);

/**
 * @route   GET /api/transactions
 * @desc    Lister les transactions du marchand
 * @access  Marchand (API Key)
 * @params  ?page=1&limit=20&status=success&order_id=...
 */
router.get('/', authenticateApiKey, transactionController.getTransactions);

// =============================================================================
// ROUTES OPÉRATIONS/REMBOURSEMENTS
// =============================================================================

/**
 * @route   POST /api/transactions/:transaction_id/refund
 * @desc    Effectuer un remboursement (total ou partiel)
 * @access  Marchand (API Key)
 * @body    { "amount": 50.00, "reason": "...", "metadata": {} }
 */
router.post('/:transaction_id/refund', authenticateApiKey, operationController.createRefund);

/**
 * @route   GET /api/transactions/:transaction_id/operations
 * @desc    Lister les opérations d'une transaction
 * @access  Marchand (API Key)
 */
router.get('/:transaction_id/operations', authenticateApiKey, (req, res) => {
  req.query.transaction_id = req.params.transaction_id;
  operationController.getOperations(req, res);
});

// =============================================================================
// ROUTES BACKOFFICE (avec authentification JWT)
// =============================================================================

/**
 * @route   GET /api/transactions/backoffice/list
 * @desc    Lister toutes les transactions (admin/marchand connecté)
 * @access  Authentifié
 */
router.get('/backoffice/list', authenticateToken, (req, res) => {
  // Si l'utilisateur n'est pas admin, filtrer par ses marchands
  if (req.user.role !== 'admin') {
    // TODO: récupérer les marchands de l'utilisateur et filtrer
    req.merchant = { id: req.user.merchant_ids }; // À implémenter
  }
  transactionController.getTransactions(req, res);
});

/**
 * @route   GET /api/transactions/backoffice/:id
 * @desc    Voir les détails d'une transaction (admin/marchand)
 * @access  Authentifié
 */
router.get('/backoffice/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    // TODO: vérifier que l'utilisateur a accès à cette transaction
    req.merchant = { id: req.user.merchant_ids };
  }
  transactionController.getTransaction(req, res);
});

module.exports = router;
