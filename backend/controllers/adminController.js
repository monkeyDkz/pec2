const { User, Merchant, MerchantRequest, UserMerchant, Transaction, Operation, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendMerchantApprovalEmail, sendMerchantRejectionEmail } = require('../services/emailService');

class AdminController {
  
  /**
   * Lister toutes les demandes avec filtres
   */
  async getMerchantRequests(req, res) {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;

      const requests = await MerchantRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name']
          },
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name', 'status'],
            required: false
          },
          {
            model: User,
            as: 'processor',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          requests: requests.rows,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(requests.count / limit),
            total_items: requests.count,
            items_per_page: parseInt(limit)
          }
        }
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
   * Voir le détail d'une demande
   */
  async getMerchantRequest(req, res) {
    try {
      const { id } = req.params;

      const request = await MerchantRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name', 'created_at']
          },
          {
            model: Merchant,
            as: 'merchant',
            required: false
          },
          {
            model: User,
            as: 'processor',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Demande non trouvée'
        });
      }

      res.json({
        success: true,
        data: {
          request: request.getAdminView(),
          user: request.user,
          merchant: request.merchant,
          processor: request.processor
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Approuver une demande
   */
  async approveMerchantRequest(req, res) {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      const adminId = req.user.id;

      const request = await MerchantRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Demande non trouvée'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cette demande a déjà été traitée'
        });
      }

      // Approuver la demande
      await request.approve(adminId, adminNotes);

      let result = { request };

      // Si c'est une demande de création de marchand
      if (request.isCreateRequest()) {
        // Valider les données
        const validationErrors = request.validateCreateData();
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: validationErrors
          });
        }

        // Créer le marchand
        const merchant = await Merchant.create({
          name: request.requested_merchant_name,
          description: request.requested_description,
          website_url: request.requested_website_url,
          business_type: request.requested_business_type,
          company_name: request.requested_company_name,
          company_address: request.requested_company_address,
          company_phone: request.requested_company_phone,
          company_email: request.requested_company_email,
          siret: request.requested_siret,
          created_by: request.user_id,
          status: 'pending'
        });

        // Activer le marchand et générer les clés API
        await merchant.activate(adminId);

        // Ajouter l'utilisateur comme admin du marchand
        await UserMerchant.create({
          user_id: request.user_id,
          merchant_id: merchant.id,
          role: 'admin',
          status: 'active'
        });

        result.merchant = merchant;
      }
      // Si c'est une demande pour rejoindre un marchand
      else if (request.isJoinRequest()) {
        // Vérifier que le marchand existe et est actif
        const merchant = await Merchant.findByPk(request.merchant_id);
        if (!merchant || !merchant.isActive()) {
          return res.status(400).json({
            success: false,
            message: 'Marchand non trouvé ou inactif'
          });
        }

        // Vérifier que l'utilisateur n'est pas déjà membre
        const existingMembership = await UserMerchant.findOne({
          where: {
            user_id: request.user_id,
            merchant_id: request.merchant_id
          }
        });

        if (existingMembership) {
          return res.status(400).json({
            success: false,
            message: 'L\'utilisateur est déjà membre de ce marchand'
          });
        }

        // Ajouter l'utilisateur au marchand
        const userMerchant = await UserMerchant.create({
          user_id: request.user_id,
          merchant_id: request.merchant_id,
          role: request.requested_role || 'developer',
          status: 'active'
        });

        result.userMerchant = userMerchant;
      }

      // Envoi de l'email de confirmation d'approbation
      try {
        if (request.isCreateRequest() && result.merchant) {
          // Envoyer l'email avec les clés API pour une nouvelle création de marchand
          await sendMerchantApprovalEmail(
            request.user.email,
            request.user.first_name,
            request.requested_merchant_name,
            result.merchant.api_key,
            result.merchant.api_secret
          );
          console.log(`✅ Email d'approbation envoyé à ${request.user.email} pour le marchand ${request.requested_merchant_name}`);
        } else if (request.isJoinRequest()) {
          // Pour une demande de rejoindre un marchand existant, on peut envoyer un email simplifié
          const merchant = await Merchant.findByPk(request.merchant_id);
          await sendMerchantApprovalEmail(
            request.user.email,
            request.user.first_name,
            merchant.name,
            'N/A - Accès via marchand existant',
            'N/A - Accès via marchand existant'
          );
          console.log(`✅ Email d'approbation envoyé à ${request.user.email} pour rejoindre le marchand ${merchant.name}`);
        }
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email d\'approbation:', emailError);
        // On ne fait pas échouer la demande si l'email ne peut pas être envoyé
      }

      res.json({
        success: true,
        message: 'Demande approuvée avec succès',
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Rejeter une demande
   */
  async rejectMerchantRequest(req, res) {
    try {
      const { id } = req.params;
      const { adminNotes, reason } = req.body;
      const adminId = req.user.id;

      const request = await MerchantRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user'
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Demande non trouvée'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cette demande a déjà été traitée'
        });
      }

      // Rejeter la demande
      await request.reject(adminId, adminNotes);

      // Envoi de l'email de refus
      try {
        const rejectionReason = reason || adminNotes || 'Aucune raison spécifiée';
        await sendMerchantRejectionEmail(
          request.user.email,
          request.user.first_name,
          request.requested_merchant_name,
          rejectionReason
        );
        console.log(`✅ Email de refus envoyé à ${request.user.email} pour le marchand ${request.requested_merchant_name}`);
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email de refus:', emailError);
        // On ne fait pas échouer la demande si l'email ne peut pas être envoyé
      }

      res.json({
        success: true,
        message: 'Demande rejetée',
        data: { request }
      });
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister tous les marchands
   */
  async getMerchants(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;

      const merchants = await Merchant.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'first_name', 'last_name']
          },
          {
            model: User,
            as: 'validator',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          },
          {
            model: User,
            as: 'users',
            through: {
              model: UserMerchant,
              attributes: ['role', 'status', 'joined_at']
            },
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          }
        ],
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
   * Suspendre un marchand
   */
  async suspendMerchant(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const merchant = await Merchant.findByPk(id);

      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      if (merchant.status === 'suspended') {
        return res.status(400).json({
          success: false,
          message: 'Ce marchand est déjà suspendu'
        });
      }

      await merchant.suspend();

      res.json({
        success: true,
        message: 'Marchand suspendu avec succès',
        data: { 
          merchant: merchant.getPublicInfo(),
          reason 
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suspension du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Réactiver un marchand
   */
  async activateMerchant(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminId = req.user.id;

      const merchant = await Merchant.findByPk(id);

      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      if (merchant.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Ce marchand est déjà actif'
        });
      }

      await merchant.activate(adminId);

      res.json({
        success: true,
        message: 'Marchand réactivé avec succès',
        data: { 
          merchant: merchant.getPublicInfo(),
          notes 
        }
      });
    } catch (error) {
      console.error('Erreur lors de la réactivation du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Dashboard admin - données complètes
   */
  async getDashboard(req, res) {
    try {
      // Récupérer les KPIs principaux
      const [
        totalMerchants,
        totalTransactions,
        totalVolume,
        pendingRequests,
        recentTransactions
      ] = await Promise.all([
        // Total marchands
        Merchant.count(),
        // Total transactions 
        Transaction ? Transaction.count() : 0,
        // Volume total (si le modèle Transaction existe)
        Transaction ? Transaction.sum('amount') : 0,
        // Demandes en attente
        MerchantRequest.findAll({
          where: { status: 'pending' },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'first_name', 'last_name']
            }
          ],
          limit: 10,
          order: [['created_at', 'DESC']]
        }),
        // Transactions récentes
        Transaction ? Transaction.findAll({
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: Merchant,
              as: 'merchant',
              attributes: ['id', 'name']
            }
          ]
        }) : []
      ]);

      // Calcul des pourcentages de croissance (simulés pour l'exemple)
      const stats = {
        totalMerchants: totalMerchants || 0,
        merchantsGrowth: 12, // Simulé
        totalVolume: totalVolume || 0,
        volumeGrowth: 8,
        totalTransactions: totalTransactions || 0,
        transactionsGrowth: 15,
        successRate: 97.2,
        successRateChange: 0.5
      };

      res.json({
        success: true,
        data: {
          stats,
          pendingRequests: pendingRequests.map(req => ({
            id: req.id,
            requested_merchant_name: req.requested_merchant_name,
            User: req.user,
            created_at: req.created_at
          })),
          recentTransactions: recentTransactions.map(tx => ({
            id: tx.id,
            amount: tx.amount,
            status: tx.status,
            merchantName: tx.merchant?.name || 'N/A',
            created_at: tx.created_at
          }))
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard admin:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du chargement du dashboard',
        data: {
          stats: {
            totalMerchants: 0,
            merchantsGrowth: 0,
            totalVolume: 0,
            volumeGrowth: 0,
            totalTransactions: 0,
            transactionsGrowth: 0,
            successRate: 0,
            successRateChange: 0
          },
          pendingRequests: [],
          recentTransactions: []
        }
      });
    }
  }

  /**
   * Lister toutes les transactions de la plateforme
   */
  async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 20, status, search, date } = req.query;
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

      const whereClause = {};
      if (status && status !== 'all') whereClause.status = status;
      if (date) {
        const selectedDate = new Date(date);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.created_at = {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay
        };
      }

      const transactions = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: transactions.rows.map(tx => ({
          id: tx.id,
          merchantName: tx.merchant?.name || 'N/A',
          customerEmail: tx.customer_email || 'N/A',
          amount: tx.amount,
          status: tx.status,
          paymentMethod: tx.payment_method || 'Carte',
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
   * Effectuer un remboursement administratif
   */
  async refundTransaction(req, res) {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      if (!Transaction || !Operation) {
        return res.status(501).json({
          success: false,
          message: 'Fonctionnalité de remboursement non disponible'
        });
      }

      const transaction = await Transaction.findByPk(id);
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

      // Créer l'opération de remboursement
      const refund = await Operation.create({
        transaction_id: id,
        type: 'refund',
        amount: amount || transaction.amount,
        status: 'success',
        reason: reason || 'Remboursement administratif',
        processed_by: req.user.id
      });

      res.json({
        success: true,
        message: 'Remboursement effectué avec succès',
        data: { refund }
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
   * Exporter les transactions
   */
  async exportTransactions(req, res) {
    try {
      const { status, search, date } = req.body;
      
      // Simuler l'export (ici on pourrait générer un CSV)
      res.json({
        success: true,
        message: 'Export en cours de génération',
        data: {
          downloadUrl: '/api/admin/downloads/transactions.csv',
          filters: { status, search, date }
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'export'
      });
    }
  }

  /**
   * Impersonate un utilisateur (se connecter en tant que)
   */
  async impersonateUser(req, res) {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Générer un token d'impersonation
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          impersonated: true,
          impersonated_by: req.user.id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: `Impersonation de ${user.email} activée`,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'impersonation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'impersonation'
      });
    }
  }

  /**
   * Obtenir les paramètres de la plateforme
   */
  async getPlatformSettings(req, res) {
    try {
      // Simuler des paramètres (en réalité, ils seraient stockés en DB)
      const settings = {
        defaultCommission: 2.5,
        minAmount: 1.00,
        maxAmount: 10000.00,
        defaultCurrency: 'EUR',
        maintenanceMode: false,
        emailNotifications: true
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des paramètres'
      });
    }
  }

  /**
   * Sauvegarder les paramètres de la plateforme
   */
  async savePlatformSettings(req, res) {
    try {
      const settings = req.body;
      
      // Ici on sauvegarderait en base de données
      // Pour l'instant, on simule la sauvegarde
      
      res.json({
        success: true,
        message: 'Paramètres sauvegardés avec succès',
        data: settings
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde des paramètres'
      });
    }
  }

  /**
   * Statistiques admin
   */
  async getStats(req, res) {
    try {
      const stats = await Promise.all([
        // Demandes en attente
        MerchantRequest.count({ where: { status: 'pending' } }),
        // Total des marchands
        Merchant.count(),
        // Marchands actifs
        Merchant.count({ where: { status: 'active' } }),
        // Utilisateurs total
        User.count(),
        // Demandes créées cette semaine
        MerchantRequest.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          pending_requests: stats[0],
          total_merchants: stats[1],
          active_merchants: stats[2],
          total_users: stats[3],
          requests_this_week: stats[4]
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister tous les marchands avec filtres
   */
  async getMerchants(req, res) {
    try {
      const { status, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { sector: { [Op.iLike]: `%${search}%` } },
          { contact_email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const merchants = await Merchant.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'users',
            through: { attributes: ['role'] },
            attributes: ['id', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: merchants.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: merchants.count
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
   * Suspendre un marchand
   */
  async suspendMerchant(req, res) {
    try {
      const { merchantId } = req.params;
      const { reason } = req.body;

      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      await merchant.update({
        status: 'suspended',
        suspension_reason: reason || 'Suspendu par l\'administrateur'
      });

      res.json({
        success: true,
        message: 'Marchand suspendu avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suspension du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Activer un marchand
   */
  async activateMerchant(req, res) {
    try {
      const { merchantId } = req.params;

      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      await merchant.update({
        status: 'active',
        suspension_reason: null
      });

      res.json({
        success: true,
        message: 'Marchand activé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'activation du marchand:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Régénérer les clés API d'un marchand
   */
  async regenerateApiKeys(req, res) {
    try {
      const { merchantId } = req.params;

      const merchant = await Merchant.findByPk(merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          message: 'Marchand non trouvé'
        });
      }

      // Générer nouvelles clés
      const newApiKey = 'pk_' + crypto.randomBytes(16).toString('hex');
      const newSecretKey = 'sk_' + crypto.randomBytes(32).toString('hex');

      await merchant.update({
        api_key: newApiKey,
        secret_key: newSecretKey
      });

      res.json({
        success: true,
        message: 'Clés API régénérées avec succès',
        data: {
          api_key: newApiKey,
          secret_key: newSecretKey
        }
      });
    } catch (error) {
      console.error('Erreur lors de la régénération des clés:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Lister toutes les transactions avec filtres
   */
  async getTransactions(req, res) {
    try {
      const { status, merchantId, startDate, endDate, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (merchantId) whereClause.merchant_id = merchantId;
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate + ' 23:59:59');
      }

      const transactions = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          data: transactions.rows,
          total: transactions.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Statistiques des transactions
   */
  async getTransactionStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [
        todayStats,
        monthlyStats,
        successRate,
        pendingCount
      ] = await Promise.all([
        // Stats aujourd'hui
        Transaction.findOne({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
          ],
          where: {
            created_at: { [Op.gte]: today }
          }
        }),
        // Stats mensuelles
        Transaction.findOne({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
          ],
          where: {
            created_at: { [Op.gte]: thisMonth }
          }
        }),
        // Taux de succès (dernières 24h)
        Transaction.findAll({
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            created_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          },
          group: ['status']
        }),
        // Transactions en attente
        Transaction.count({
          where: { status: 'pending' }
        })
      ]);

      // Calculer le taux de succès
      let totalLast24h = 0;
      let successLast24h = 0;
      successRate.forEach(stat => {
        totalLast24h += parseInt(stat.dataValues.count);
        if (stat.dataValues.status === 'completed') {
          successLast24h += parseInt(stat.dataValues.count);
        }
      });

      const successRatePercent = totalLast24h > 0 ? Math.round((successLast24h / totalLast24h) * 100) : 0;

      res.json({
        success: true,
        data: {
          todayCount: todayStats?.dataValues?.count || 0,
          todayTotal: todayStats?.dataValues?.total || 0,
          monthlyCount: monthlyStats?.dataValues?.count || 0,
          monthlyTotal: monthlyStats?.dataValues?.total || 0,
          successRate: successRatePercent,
          pendingCount
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des stats transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Rembourser une transaction
   */
  async refundTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;

      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction non trouvée'
        });
      }

      if (transaction.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Seules les transactions complétées peuvent être remboursées'
        });
      }

      // Créer une nouvelle transaction de remboursement
      await Transaction.create({
        id: crypto.randomUUID(),
        merchant_id: transaction.merchant_id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'completed',
        type: 'refund',
        parent_transaction_id: transaction.id,
        description: reason || 'Remboursement initié par l\'administrateur'
      });

      // Marquer la transaction originale comme remboursée
      await transaction.update({
        status: 'refunded',
        refund_reason: reason
      });

      res.json({
        success: true,
        message: 'Transaction remboursée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Forcer la completion d'une transaction
   */
  async forceCompleteTransaction(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction non trouvée'
        });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Seules les transactions en attente peuvent être forcées'
        });
      }

      await transaction.update({
        status: 'completed',
        completed_at: new Date(),
        completion_method: 'admin_forced'
      });

      res.json({
        success: true,
        message: 'Transaction validée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la validation forcée:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
}

module.exports = new AdminController();
