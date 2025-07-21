const { Operation, Transaction, Merchant, WebhookEvent, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const axios = require('axios');
const paymentService = require('../services/paymentService');

/**
 * Créer une nouvelle opération (appelé par le PSP)
 */
exports.createOperation = async (req, res) => {
  try {
    // Vérifier que l'appel vient du PSP
    const pspSecret = req.headers['x-psp-secret'];
    if (pspSecret !== (process.env.PSP_SECRET || 'psp-secret-key-2024')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized PSP access'
      });
    }

    const {
      operation_id,
      transaction_id,
      type,
      amount,
      currency,
      psp_reference,
      status = 'processing'
    } = req.body;

    // Validation des champs obligatoires
    if (!operation_id || !transaction_id || !type || !amount || !psp_reference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: operation_id, transaction_id, type, amount, psp_reference'
      });
    }

    // Vérifier que la transaction existe
    const transaction = await Transaction.findByPk(transaction_id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Créer l'opération
    const operation = await Operation.create({
      id: operation_id,
      transaction_id,
      merchant_id: transaction.merchant_id,
      type,
      amount: parseFloat(amount).toFixed(2),
      currency: currency || 'EUR',
      status,
      psp_reference,
      submitted_to_psp_at: new Date()
    });

    console.log(`✅ Backend: Operation ${operation_id} created for transaction ${transaction_id}`);

    res.status(201).json({
      success: true,
      data: {
        operation_id: operation.id,
        transaction_id: operation.transaction_id,
        status: operation.status,
        psp_reference: operation.psp_reference
      }
    });

  } catch (error) {
    console.error('❌ Backend: Error creating operation:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Operation ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Effectuer un remboursement (total ou partiel)
 */
exports.createRefund = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { transaction_id } = req.params;
    const { amount, reason, metadata } = req.body;

    // Vérifier que la transaction existe et appartient au marchand
    const transaction = await Transaction.findOne({
      where: { 
        id: transaction_id,
        merchant_id: merchantId,
        status: 'success'
      },
      include: [
        {
          model: Operation,
          as: 'operations',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or cannot be refunded'
      });
    }

    // Calculer le montant remboursable
    const refundableAmount = await transaction.getRefundableAmount();
    const refundAmount = amount ? parseFloat(amount) : parseFloat(transaction.amount);

    if (refundAmount > refundableAmount) {
      return res.status(400).json({
        success: false,
        error: `Refund amount exceeds refundable amount (${refundableAmount} ${transaction.currency})`
      });
    }

    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount must be positive'
      });
    }

    // Trouver l'opération de capture originale
    const captureOperation = transaction.operations.find(op => op.type === 'capture' && op.status === 'success');
    
    if (!captureOperation) {
      return res.status(400).json({
        success: false,
        error: 'No successful capture operation found'
      });
    }

    // Créer l'opération de remboursement
    const refundOperation = await Operation.create({
      transaction_id: transaction.id,
      merchant_id: merchantId,
      type: 'refund',
      amount: refundAmount.toFixed(2),
      currency: transaction.currency,
      status: 'pending',
      refund_reason: reason,
      parent_operation_id: captureOperation.id,
      metadata
    });

    // Envoyer au PSP via le service de paiement
    try {
      const pspResult = await paymentService.sendRefundToPSP(refundOperation, transaction, captureOperation);

      // Envoyer webhook de début de traitement
      if (transaction.webhook_url) {
        await sendWebhook(transaction, 'operation.refund.processing', refundOperation);
      }

      res.status(201).json({
        success: true,
        message: 'Refund processing initiated',
        data: {
          operation_id: refundOperation.id,
          psp_reference: pspResult.psp_reference,
          estimated_completion: pspResult.estimated_completion,
          status: 'processing'
        }
      });

    } catch (pspError) {
      // Marquer l'opération comme échouée
      await refundOperation.update({
        status: 'failed',
        error_message: pspError.message,
        failed_at: new Date()
      });

      // Envoyer webhook d'échec
      if (transaction.webhook_url) {
        await sendWebhook(transaction, 'operation.refund.failed', refundOperation);
      }

      res.status(400).json({
        success: false,
        error: pspError.message,
        data: {
          operation_id: refundOperation.id,
          status: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Obtenir les détails d'une opération
 */
exports.getOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant?.id;

    const operation = await Operation.findOne({
      where: { 
        id,
        merchant_id: merchantId 
      },
      include: [
        {
          model: Transaction,
          as: 'transaction'
        },
        {
          model: Operation,
          as: 'parentOperation', // Si c'est un refund, récupérer l'opération parent
          foreignKey: 'parent_operation_id'
        }
      ]
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'Operation not found'
      });
    }

    res.json({
      success: true,
      data: operation
    });

  } catch (error) {
    console.error('Error getting operation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Lister toutes les opérations du marchand
 */
exports.getOperations = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status,
      transaction_id,
      from_date,
      to_date
    } = req.query;

    const where = { merchant_id: merchantId };
    
    // Filtres
    if (type) where.type = type;
    if (status) where.status = status;
    if (transaction_id) where.transaction_id = transaction_id;
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const offset = (page - 1) * limit;

    const { rows: operations, count } = await Operation.findAndCountAll({
      where,
      include: [
        {
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'order_id', 'customer_email', 'status']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        operations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting operations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Annuler une opération (si possible)
 */
exports.cancelOperation = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant?.id;

    const operation = await Operation.findOne({
      where: { 
        id,
        merchant_id: merchantId,
        status: ['pending', 'processing']
      }
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'Operation not found or cannot be cancelled'
      });
    }

    await operation.update({ status: 'cancelled' });

    res.json({
      success: true,
      data: {
        operation_id: operation.id,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Error cancelling operation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Obtenir les statistiques des opérations
 */
exports.getOperationStats = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { from_date, to_date } = req.query;

    const where = { merchant_id: merchantId };
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    // Statistiques par type et statut
    const [captures, refunds] = await Promise.all([
      Operation.findAll({
        where: { ...where, type: 'capture' },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        group: ['status'],
        raw: true
      }),
      Operation.findAll({
        where: { ...where, type: 'refund' },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
        ],
        group: ['status'],
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        captures: captures.map(stat => ({
          status: stat.status,
          count: parseInt(stat.count),
          total_amount: parseFloat(stat.total_amount || 0)
        })),
        refunds: refunds.map(stat => ({
          status: stat.status,
          count: parseInt(stat.count),
          total_amount: parseFloat(stat.total_amount || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error getting operation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Fonction utilitaire pour envoyer un remboursement au PSP
 */
async function sendRefundToPSP(operation, transaction, captureOperation) {
  try {
    const pspUrl = process.env.PSP_URL || 'http://localhost:3002';
    
    const payload = {
      operation_id: operation.id,
      transaction_id: transaction.id,
      capture_reference: captureOperation.psp_reference,
      refund_amount: operation.amount,
      currency: operation.currency,
      reason: operation.refund_reason,
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/psp`
    };

    // Mettre à jour l'opération
    await operation.update({
      status: 'processing',
      submitted_to_psp_at: new Date(),
      psp_reference: operation.generatePspReference()
    });

    const response = await axios.post(`${pspUrl}/api/payment/refund`, payload, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-PSP-Signature': generatePSPSignature(payload)
      }
    });

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('PSP Refund Error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      data: error.response?.data
    };
  }
}

/**
 * Fonction utilitaire pour envoyer des webhooks
 */
async function sendWebhook(transaction, eventType, operation = null) {
  try {
    const payload = {
      event_type: eventType,
      transaction_id: transaction.id,
      merchant_id: transaction.merchant_id,
      order_id: transaction.order_id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timestamp: new Date().toISOString()
    };

    if (operation) {
      payload.operation_id = operation.id;
      payload.operation_type = operation.type;
      payload.operation_status = operation.status;
      payload.operation_amount = operation.amount;
    }

    const signature = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || 'default-secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    // Créer l'événement webhook
    await WebhookEvent.create({
      merchant_id: transaction.merchant_id,
      transaction_id: transaction.id,
      operation_id: operation?.id,
      event_type: eventType,
      webhook_url: transaction.webhook_url,
      payload,
      signature
    });

    console.log(`Webhook ${eventType} created for transaction ${transaction.id}`);

  } catch (error) {
    console.error('Error creating webhook:', error);
  }
}

/**
 * Générer signature PSP
 */
function generatePSPSignature(payload) {
  return crypto
    .createHmac('sha256', process.env.PSP_SECRET || 'psp-secret')
    .update(JSON.stringify(payload))
    .digest('hex');
}
