const { User, Merchant, MerchantRequest, UserMerchant, Transaction, Operation } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

class MerchantController {

  /**
   * Dashboard du marchand - données pour l'interface
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Statistiques simulées pour le dashboard
      const stats = {
        todayTransactions: 42,
        monthlyRevenue: 15750,
        successRate: 97.5,
        pendingTransactions: 3
      };

      // Transactions récentes simulées
      const recentTransactions = [
        {
          id: 'txn_1234567890',
          amount: '99.99',
          status: 'success',
          created_at: new Date().toISOString()
        },
        {
          id: 'txn_0987654321', 
          amount: '149.50',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: {
          stats,
          recentTransactions
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement du dashboard'
      });
    }
  }
  
  /**
   * Lister les marchands disponibles pour rejoindre
   */
  async getAvailableMerchants(req, res) {
    try {
      const { page = 1, limit = 20, business_type } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user.id;

      const whereClause = { status: 'active' };
      if (business_type) whereClause.business_type = business_type;

      // Récupérer les marchands auxquels l'utilisateur n'appartient pas déjà
      const userMerchantIds = await UserMerchant.findAll({
        where: { user_id: userId },
        attributes: ['merchant_id']
      }).then(results => results.map(r => r.merchant_id));

      if (userMerchantIds.length > 0) {
        whereClause.id = { [Op.notIn]: userMerchantIds };
      }

      const merchants = await Merchant.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'name', 'description', 'website_url', 'business_type', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          merchants: merchants.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(merchants.count / limit),
            total_items: merchants.count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des marchands:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Faire une demande pour rejoindre un marchand
   */
  async createJoinRequest(req, res) {
    try {
      const { merchantId, requestedRole = 'developer', justification } = req.body;
      const userId = req.user.id;

      // Vérifications
      if (!merchantId || !justification) {
        return res.status(400).json({
          success: false,
          message: 'ID du marchand et justification sont requis'
        });
      }

      // Vérifier que le marchand existe et est actif
      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant || merchant.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé ou inactif'
        });
      }

      // Vérifier que l'utilisateur n'est pas déjà membre
      const existingMembership = await UserMerchant.findOne({
        where: { user_id: userId, merchant_id: merchantId }
      });

      if (existingMembership) {
        return res.status(400).json({
          success: false,
          message: 'Vous êtes déjà membre de ce marchand'
        });
      }

      // Vérifier qu'il n'y a pas déjà une demande en attente
      const existingRequest = await MerchantRequest.findOne({
        where: {
          user_id: userId,
          merchant_id: merchantId,
          type: 'join_merchant',
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà une demande en attente pour ce marchand'
        });
      }

      // Créer la demande
      const request = await MerchantRequest.create({
        type: 'join_merchant',
        user_id: userId,
        merchant_id: merchantId,
        requested_role: requestedRole,
        justification,
        status: 'pending'
      });

      const requestWithDetails = await MerchantRequest.findByPk(request.id, {
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name', 'business_type']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Demande d\'affiliation créée avec succès',
        data: { request: requestWithDetails }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la demande d\'affiliation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Faire une demande pour créer un nouveau marchand
   */
  async createMerchantRequest(req, res) {
    try {
      const {
        merchantName,
        websiteUrl,
        businessType = 'other',
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        siret,
        description,
        justification
      } = req.body;
      const userId = req.user.id;

      // Validations requises
      const requiredFields = {
        merchantName,
        websiteUrl,
        companyName,
        companyAddress,
        companyEmail,
        justification
      };

      const missingFields = Object.keys(requiredFields).filter(
        key => !requiredFields[key] || requiredFields[key].toString().trim() === ''
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Champs manquants requis',
          missing_fields: missingFields
        });
      }

      // Validation de l'URL
      try {
        new URL(websiteUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'URL du site web invalide'
        });
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(companyEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Email de l\'entreprise invalide'
        });
      }

      // Vérifier qu'il n'y a pas déjà une demande de création en attente
      const existingRequest = await MerchantRequest.findOne({
        where: {
          user_id: userId,
          type: 'create_merchant',
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà une demande de création de marchand en attente'
        });
      }

      // Créer la demande
      const request = await MerchantRequest.create({
        type: 'create_merchant',
        user_id: userId,
        requested_merchant_name: merchantName,
        requested_website_url: websiteUrl,
        requested_business_type: businessType,
        requested_company_name: companyName,
        requested_company_address: companyAddress,
        requested_company_phone: companyPhone,
        requested_company_email: companyEmail,
        requested_siret: siret,
        requested_description: description,
        justification,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        message: 'Demande de création de marchand créée avec succès',
        data: { request }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la demande de marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Voir mes demandes en cours
   */
  async getMyRequests(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const whereClause = { user_id: userId };
      if (status) whereClause.status = status;

      const requests = await MerchantRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name', 'business_type'],
            required: false
          },
          {
            model: User,
            as: 'processor',
            attributes: ['id', 'first_name', 'last_name'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: { requests }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Voir mes marchands (où je suis membre)
   */
  async getMyMerchants(req, res) {
    try {
      const userId = req.user.id;

      const userMerchants = await UserMerchant.findAll({
        where: { user_id: userId, status: 'active' },
        include: [
          {
            model: Merchant,
            as: 'merchant',
            include: [
              {
                model: User,
                as: 'creator',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ],
        order: [['joined_at', 'DESC']]
      });

      const merchantsData = userMerchants.map(um => ({
        membership: {
          role: um.role,
          status: um.status,
          joined_at: um.joined_at,
          permissions: um.permissions || um.getDefaultPermissions()
        },
        merchant: um.merchant.getPublicInfo()
      }));

      res.json({
        success: true,
        data: { merchants: merchantsData }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des marchands:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Voir les détails d'un marchand dont je suis membre
   */
  async getMerchantDetails(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que l'utilisateur est membre du marchand
      const userMerchant = await UserMerchant.findOne({
        where: { user_id: userId, merchant_id: id, status: 'active' }
      });

      if (!userMerchant) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - vous n\'êtes pas membre de ce marchand'
        });
      }

      const merchant = await Merchant.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: User,
            as: 'validator',
            attributes: ['id', 'first_name', 'last_name'],
            required: false
          }
        ]
      });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      // Données selon les permissions
      let merchantData;
      if (userMerchant.canManage()) {
        merchantData = merchant.getPrivateInfo();
      } else {
        merchantData = merchant.getPublicInfo();
      }

      res.json({
        success: true,
        data: {
          merchant: merchantData,
          my_role: userMerchant.role,
          my_permissions: userMerchant.permissions || userMerchant.getDefaultPermissions(),
          creator: merchant.creator,
          validator: merchant.validator
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Voir les membres d'un marchand (si admin/manager)
   */
  async getMerchantMembers(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier les permissions
      const userMerchant = await UserMerchant.findOne({
        where: { user_id: userId, merchant_id: id, status: 'active' }
      });

      if (!userMerchant || !userMerchant.canManage()) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - permissions insuffisantes'
        });
      }

      const members = await UserMerchant.findAll({
        where: { merchant_id: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['joined_at', 'ASC']]
      });

      res.json({
        success: true,
        data: { members }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Mettre à jour un marchand (si admin/manager)
   */
  async updateMerchant(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { description, webhook_url } = req.body;

      // Vérifier les permissions
      const userMerchant = await UserMerchant.findOne({
        where: { user_id: userId, merchant_id: id, status: 'active' }
      });

      if (!userMerchant || !userMerchant.canManage()) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - permissions insuffisantes'
        });
      }

      const merchant = await Merchant.findByPk(id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      // Mise à jour des champs autorisés
      const updateData = {};
      if (description !== undefined) updateData.description = description;
      if (webhook_url !== undefined) {
        if (webhook_url && webhook_url.trim() !== '') {
          try {
            new URL(webhook_url);
            updateData.webhook_url = webhook_url;
          } catch {
            return res.status(400).json({
              success: false,
              message: 'URL de webhook invalide'
            });
          }
        } else {
          updateData.webhook_url = null;
        }
      }

      await merchant.update(updateData);

      res.json({
        success: true,
        message: 'Marchand mis à jour avec succès',
        data: { merchant: merchant.getPrivateInfo() }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Régénérer les clés API (si admin)
   */
  async regenerateApiKeys(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Vérifier que l'utilisateur est admin du marchand
      const userMerchant = await UserMerchant.findOne({
        where: { user_id: userId, merchant_id: id, status: 'active', role: 'admin' }
      });

      if (!userMerchant) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - vous devez être admin du marchand'
        });
      }

      const merchant = await Merchant.findByPk(id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      // Régénérer les clés
      const newApiKey = Merchant.generateApiKey();
      const newApiSecret = Merchant.generateApiSecret();

      await merchant.update({
        api_key: newApiKey,
        api_secret: newApiSecret
      });

      res.json({
        success: true,
        message: 'Clés API régénérées avec succès',
        data: {
          api_key: newApiKey,
          api_secret: newApiSecret,
          warning: 'Assurez-vous de mettre à jour vos systèmes avec les nouvelles clés'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la régénération des clés API:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister les transactions d'un marchand
   */
  async getMerchantTransactions(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (page - 1) * limit;

      if (!Transaction) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            items_per_page: parseInt(limit)
          }
        });
      }

      const whereClause = { merchant_id: id };
      if (status && status !== 'all') whereClause.status = status;

      const transactions = await Transaction.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: transactions.rows.map(tx => ({
          id: tx.id,
          order_id: tx.order_id,
          amount: tx.amount,
          status: tx.status,
          customer_email: tx.customer_email,
          payment_method: tx.payment_method || 'Carte',
          created_at: tx.created_at
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(transactions.count / limit),
          total_items: transactions.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des transactions'
      });
    }
  }

  /**
   * Obtenir les credentials d'un marchand
   */
  async getMerchantCredentials(req, res) {
    try {
      const { id } = req.params;
      
      const merchant = await Merchant.findByPk(id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      res.json({
        success: true,
        data: {
          merchant_id: merchant.id,
          app_id: merchant.api_key,
          app_secret: merchant.api_secret,
          webhook_url: merchant.webhook_url || '',
          test_mode: true, // Par défaut en mode test
          payment_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/payment`,
          api_url: `${process.env.API_URL || 'http://localhost:3000'}/api`
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des credentials:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des credentials'
      });
    }
  }

  /**
   * Effectuer un remboursement
   */
  async createRefund(req, res) {
    try {
      const { id } = req.params;
      const { transaction_id, amount, reason } = req.body;

      if (!Transaction || !Operation) {
        return res.status(501).json({
          success: false,
          message: 'Fonctionnalité de remboursement non disponible'
        });
      }

      const transaction = await Transaction.findOne({
        where: { 
          id: transaction_id,
          merchant_id: id 
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction non trouvée'
        });
      }

      if (transaction.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: 'Seules les transactions réussies peuvent être remboursées'
        });
      }

      const refundAmount = amount || transaction.amount;
      if (refundAmount > transaction.amount) {
        return res.status(400).json({
          success: false,
          message: 'Le montant du remboursement ne peut pas dépasser le montant de la transaction'
        });
      }

      // Créer l'opération de remboursement
      const refund = await Operation.create({
        transaction_id: transaction_id,
        type: 'refund',
        amount: refundAmount,
        status: 'success',
        reason: reason || 'Remboursement marchand',
        processed_by: req.user.id
      });

      res.json({
        success: true,
        message: 'Remboursement effectué avec succès',
        data: { 
          refund_id: refund.id,
          amount: refundAmount,
          transaction_id: transaction_id
        }
      });
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du remboursement'
      });
    }
  }

  /**
   * Lister les remboursements d'un marchand
   */
  async getMerchantRefunds(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      if (!Operation || !Transaction) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            items_per_page: parseInt(limit)
          }
        });
      }

      const refunds = await Operation.findAndCountAll({
        where: { type: 'refund' },
        include: [
          {
            model: Transaction,
            as: 'transaction',
            where: { merchant_id: id },
            attributes: ['id', 'order_id', 'amount', 'customer_email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: refunds.rows.map(refund => ({
          id: refund.id,
          transaction_id: refund.transaction_id,
          original_amount: refund.transaction.amount,
          refund_amount: refund.amount,
          reason: refund.reason,
          status: refund.status,
          created_at: refund.created_at,
          transaction: {
            order_id: refund.transaction.order_id,
            customer_email: refund.transaction.customer_email
          }
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(refunds.count / limit),
          total_items: refunds.count,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des remboursements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des remboursements'
      });
    }
  }

  /**
   * Régénérer le secret API uniquement
   */
  async regenerateSecret(req, res) {
    try {
      const { id } = req.params;
      
      const merchant = await Merchant.findByPk(id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      const newApiSecret = crypto.randomBytes(32).toString('hex');

      await merchant.update({
        api_secret: newApiSecret
      });

      res.json({
        success: true,
        message: 'Secret API régénéré avec succès',
        data: {
          api_secret: newApiSecret,
          warning: 'Assurez-vous de mettre à jour vos systèmes avec le nouveau secret'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la régénération du secret:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la régénération du secret'
      });
    }
  }

  /**
   * Tester le webhook d'un marchand
   */
  async testWebhook(req, res) {
    try {
      const { id } = req.params;
      
      const merchant = await Merchant.findByPk(id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      if (!merchant.webhook_url) {
        return res.status(400).json({
          success: false,
          message: 'Aucune URL de webhook configurée'
        });
      }

      // Simuler un test de webhook
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        merchant_id: merchant.id,
        data: {
          message: 'Test webhook depuis le dashboard marchand'
        }
      };

      // Ici on enverrait réellement le webhook
      // Pour l'instant on simule
      
      res.json({
        success: true,
        message: 'Test webhook envoyé avec succès',
        data: {
          webhook_url: merchant.webhook_url,
          payload: testPayload,
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Erreur lors du test webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du test webhook'
      });
    }
  }
  /**
   * Récupérer les marchands disponibles pour rejoindre
   */
  async getAvailableMerchants(req, res) {
    try {
      const userId = req.user.id;

      // Récupérer tous les marchands actifs où l'utilisateur n'est pas déjà membre
      const merchants = await Merchant.findAll({
        where: {
          status: 'active'
        },
        include: [
          {
            model: UserMerchant,
            as: 'userMerchants',
            where: {
              user_id: userId
            },
            required: false
          }
        ]
      });

      // Filtrer les marchands où l'utilisateur n'est pas déjà membre
      const availableMerchants = merchants.filter(merchant => 
        !merchant.userMerchants || merchant.userMerchants.length === 0
      );

      res.json({
        success: true,
        data: {
          merchants: availableMerchants.map(merchant => ({
            id: merchant.id,
            name: merchant.name,
            description: merchant.description,
            status: merchant.status,
            business_type: merchant.business_type,
            website_url: merchant.website_url
          }))
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des marchands disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Créer une demande de marchand (création ou rejoindre)
   */
  async createMerchantRequest(req, res) {
    try {
      const userId = req.user.id;
      const {
        type,
        merchant_id,
        requested_merchant_name,
        requested_company_name,
        requested_website_url,
        requested_business_type,
        requested_company_email,
        requested_company_phone,
        requested_company_address,
        requested_siret,
        requested_description,
        requested_role,
        justification
      } = req.body;

      // Validation du type
      if (!['create_merchant', 'join_merchant'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type de demande invalide'
        });
      }

      // Vérifier s'il y a déjà une demande en attente
      const existingRequest = await MerchantRequest.findOne({
        where: {
          user_id: userId,
          status: 'pending',
          ...(type === 'join_merchant' && merchant_id ? { merchant_id } : {})
        }
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà une demande en cours pour ce marchand'
        });
      }

      // Créer la demande
      const requestData = {
        type,
        user_id: userId,
        justification,
        status: 'pending'
      };

      if (type === 'create_merchant') {
        // Validation des champs obligatoires pour création
        if (!requested_merchant_name || !requested_company_name || !requested_business_type || !requested_description) {
          return res.status(400).json({
            success: false,
            message: 'Tous les champs obligatoires doivent être renseignés'
          });
        }

        Object.assign(requestData, {
          requested_merchant_name,
          requested_company_name,
          requested_website_url,
          requested_business_type,
          requested_company_email,
          requested_company_phone,
          requested_company_address,
          requested_siret,
          requested_description
        });
      } else if (type === 'join_merchant') {
        // Validation pour rejoindre un marchand
        if (!merchant_id) {
          return res.status(400).json({
            success: false,
            message: 'ID du marchand requis'
          });
        }

        // Vérifier que le marchand existe et est actif
        const merchant = await Merchant.findByPk(merchant_id);
        if (!merchant || merchant.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Marchand non trouvé ou inactif'
          });
        }

        Object.assign(requestData, {
          merchant_id,
          requested_role: requested_role || 'developer'
        });
      }

      const request = await MerchantRequest.create(requestData);

      res.status(201).json({
        success: true,
        message: 'Demande créée avec succès',
        data: { request }
      });
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Récupérer les demandes de l'utilisateur actuel
   */
  async getUserMerchantRequests(req, res) {
    try {
      const userId = req.user.id;

      const requests = await MerchantRequest.findAll({
        where: {
          user_id: userId
        },
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          requests: requests.map(request => ({
            id: request.id,
            type: request.type,
            status: request.status,
            requested_merchant_name: request.requested_merchant_name,
            requested_description: request.requested_description,
            justification: request.justification,
            admin_notes: request.admin_notes,
            created_at: request.created_at,
            processed_at: request.processed_at,
            merchant: request.merchant
          }))
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes utilisateur:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

}

module.exports = new MerchantController();
