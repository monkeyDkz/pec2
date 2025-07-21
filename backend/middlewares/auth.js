const { verifyJWT, extractTokenFromHeader } = require('../utils/auth');
const { User, Merchant } = require('../models');
const crypto = require('crypto');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'accès requis'
            });
        }

        const decoded = verifyJWT(token);
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.is_verified) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou email non vérifié'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
};

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - permissions administrateur requises'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur dans requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

/**
 * Middleware pour vérifier les permissions sur un marchand
 */
const requireMerchantAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const { User, UserMerchant } = require('../models');
      const merchantId = req.params.id || req.params.merchantId;
      const userId = req.user.id;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          message: 'ID du marchand requis'
        });
      }

      // Vérifier l'accès au marchand
      const userMerchant = await UserMerchant.findOne({
        where: { 
          user_id: userId, 
          merchant_id: merchantId, 
          status: 'active' 
        }
      });

      if (!userMerchant) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé - vous n\'êtes pas membre de ce marchand'
        });
      }

      // Vérifier le rôle spécifique si requis
      if (requiredRole) {
        const roleHierarchy = { 'developer': 1, 'manager': 2, 'admin': 3 };
        const userRoleLevel = roleHierarchy[userMerchant.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          return res.status(403).json({
            success: false,
            message: `Accès refusé - rôle ${requiredRole} requis`
          });
        }
      }

      // Ajouter les infos du marchand à la requête
      req.userMerchant = userMerchant;
      next();
    } catch (error) {
      console.error('Erreur dans requireMerchantAccess middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  };
};

/**
 * Middleware pour authentifier via API Key (pour les API marchands)
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiId = req.headers['x-api-id'];
    const apiSecret = req.headers['x-api-secret'];
    const signature = req.headers['x-api-signature'];
    const timestamp = req.headers['x-api-timestamp'];

    if (!apiId || !apiSecret) {
      return res.status(401).json({
        success: false,
        error: 'API credentials required (X-API-ID and X-API-SECRET headers)'
      });
    }

    // Récupérer le marchand
    const merchant = await Merchant.findOne({
      where: { 
        api_key: apiId,
        status: 'active'
      }
    });

    if (!merchant) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API credentials'
      });
    }

    // Vérifier le secret
    if (merchant.api_secret !== apiSecret) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API credentials'
      });
    }

    // Vérification optionnelle de la signature (pour sécurité renforcée)
    if (signature && timestamp) {
      const now = Date.now();
      const requestTime = parseInt(timestamp);
      
      // Vérifier que la requête n'est pas trop ancienne (5 minutes max)
      if (Math.abs(now - requestTime) > 300000) {
        return res.status(401).json({
          success: false,
          error: 'Request timestamp too old'
        });
      }

      // Calculer la signature attendue
      const method = req.method;
      const path = req.originalUrl;
      const body = JSON.stringify(req.body || {});
      const dataToSign = `${method}${path}${body}${timestamp}`;
      
      const expectedSignature = crypto
        .createHmac('sha256', merchant.api_secret)
        .update(dataToSign)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({
          success: false,
          error: 'Invalid request signature'
        });
      }
    }

    // Ajouter le marchand à la requête
    req.merchant = merchant;
    next();

  } catch (error) {
    console.error('Error in authenticateApiKey middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMerchantAccess,
  authenticateApiKey
};