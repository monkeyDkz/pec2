const { Transaction, Operation, Merchant, WebhookEvent, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const axios = require('axios');
const paymentService = require('../services/paymentService');

/**
 * Créer une nouvelle transaction de paiement
 */
exports.createTransaction = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Merchant ID required'
      });
    }

    const {
      order_id,
      amount,
      currency = 'EUR',
      description,
      customer_email,
      customer_first_name,
      customer_last_name,
      billing_address,
      shipping_address,
      success_url,
      cancel_url,
      webhook_url,
      metadata
    } = req.body;

    // Validation des champs obligatoires
    if (!order_id || !amount || !customer_email || !success_url || !cancel_url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: order_id, amount, customer_email, success_url, cancel_url'
      });
    }

    // Vérifier que le marchand existe et est actif
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant || merchant.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Merchant not found or inactive'
      });
    }

    // Générer un token de paiement sécurisé
    const payment_token = crypto.randomBytes(32).toString('hex');
    
    // Date d'expiration (24h par défaut)
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    // Créer la transaction
    const transaction = await Transaction.create({
      merchant_id: merchantId,
      order_id,
      amount: parseFloat(amount).toFixed(2),
      currency,
      description,
      customer_email,
      customer_first_name,
      customer_last_name,
      billing_address,
      shipping_address,
      success_url,
      cancel_url,
      webhook_url: webhook_url || merchant.webhook_url,
      payment_token,
      metadata,
      expires_at,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Envoyer un webhook de création de transaction
    if (transaction.webhook_url) {
      await sendWebhook(transaction, 'transaction.created');
    }

    // URL de paiement
    const payment_url = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment/${transaction.id}?token=${payment_token}`;

    res.status(201).json({
      success: true,
      data: {
        transaction_id: transaction.id,
        payment_url,
        expires_at: transaction.expires_at,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Order ID already exists for this merchant'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Obtenir les détails d'une transaction
 */
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant?.id;

    const transaction = await Transaction.findOne({
      where: { 
        id,
        merchant_id: merchantId 
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
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Lister les transactions du marchand
 */
exports.getTransactions = async (req, res) => {
  try {
    const merchantId = req.merchant?.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      order_id,
      customer_email,
      from_date,
      to_date
    } = req.query;

    const where = { merchant_id: merchantId };
    
    // Filtres
    if (status) where.status = status;
    if (order_id) where.order_id = { [Op.iLike]: `%${order_id}%` };
    if (customer_email) where.customer_email = { [Op.iLike]: `%${customer_email}%` };
    
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at[Op.gte] = new Date(from_date);
      if (to_date) where.created_at[Op.lte] = new Date(to_date);
    }

    const offset = (page - 1) * limit;

    const { rows: transactions, count } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Operation,
          as: 'operations',
          order: [['created_at', 'DESC']],
          limit: 3 // Les 3 dernières opérations
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Traiter le paiement d'une transaction (page de paiement)
 */
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, payment_method } = req.body;

    // Vérifier le token et récupérer la transaction
    const transaction = await Transaction.findOne({
      where: { 
        id,
        payment_token: token,
        status: 'pending'
      },
      include: [
        {
          model: Merchant,
          as: 'merchant'
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or invalid token'
      });
    }

    // Vérifier l'expiration
    if (new Date() > transaction.expires_at) {
      await transaction.update({ status: 'cancelled' });
      return res.status(400).json({
        success: false,
        error: 'Transaction expired'
      });
    }

    // Mettre à jour le statut en processing
    await transaction.update({ status: 'processing' });

    // Créer l'opération de capture
    const operation = await Operation.create({
      transaction_id: transaction.id,
      merchant_id: transaction.merchant_id,
      type: 'capture',
      amount: transaction.amount,
      currency: transaction.currency,
      status: 'pending',
      metadata: { payment_method }
    });

    try {
      // Envoyer au PSP via le service de paiement
      const pspResult = await paymentService.sendPaymentToPSP(operation, transaction, {
        payment_method,
        customer: {
          email: transaction.customer_email,
          first_name: transaction.customer_first_name,
          last_name: transaction.customer_last_name
        }
      });

      // Envoyer webhook de début de traitement
      if (transaction.webhook_url) {
        await sendWebhook(transaction, 'transaction.processing', operation);
      }

      res.json({
        success: true,
        message: 'Payment processing initiated',
        data: {
          operation_id: operation.id,
          psp_reference: pspResult.psp_reference,
          estimated_completion: pspResult.estimated_completion,
          status: 'processing'
        }
      });

    } catch (pspError) {
      // Marquer l'opération et la transaction comme échouées
      await operation.update({
        status: 'failed',
        error_message: pspError.message,
        failed_at: new Date()
      });
      
      await transaction.update({ 
        status: 'failed',
        failed_at: new Date()
      });

      // Envoyer webhook d'échec
      if (transaction.webhook_url) {
        await sendWebhook(transaction, 'transaction.failed', operation);
      }

      res.status(400).json({
        success: false,
        error: pspError.message,
        data: {
          operation_id: operation.id,
          status: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Annuler une transaction
 */
exports.cancelTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    const transaction = await Transaction.findOne({
      where: { 
        id,
        payment_token: token,
        status: ['pending', 'processing']
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found or cannot be cancelled'
      });
    }

    await transaction.update({ status: 'cancelled' });

    // Envoyer webhook d'annulation
    if (transaction.webhook_url) {
      await sendWebhook(transaction, 'transaction.cancelled');
    }

    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        status: 'cancelled',
        redirect_url: transaction.cancel_url
      }
    });

  } catch (error) {
    console.error('Error cancelling transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Fonction utilitaire pour envoyer au PSP
 */
async function sendToPSP(operation, transaction, paymentMethod) {
  try {
    const pspUrl = process.env.PSP_URL || 'http://localhost:3002';
    
    const payload = {
      operation_id: operation.id,
      transaction_id: transaction.id,
      amount: operation.amount,
      currency: operation.currency,
      payment_method: paymentMethod,
      customer: {
        email: transaction.customer_email,
        first_name: transaction.customer_first_name,
        last_name: transaction.customer_last_name
      },
      callback_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/psp`
    };

    // Mettre à jour l'opération
    await operation.update({
      status: 'processing',
      submitted_to_psp_at: new Date(),
      psp_reference: operation.generatePspReference()
    });

    const response = await axios.post(`${pspUrl}/api/payment/process`, payload, {
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
    console.error('PSP Error:', error.message);
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
