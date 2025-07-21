const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MerchantRequest extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Une demande appartient à un utilisateur
      MerchantRequest.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
      
      // Une demande peut concerner un marchand existant (pour join)
      MerchantRequest.belongsTo(models.Merchant, { 
        foreignKey: 'merchant_id', 
        as: 'merchant' 
      });
      
      // Une demande peut être traitée par un admin
      MerchantRequest.belongsTo(models.User, { 
        foreignKey: 'processed_by', 
        as: 'processor' 
      });
    }

    /**
     * Vérifier si c'est une demande de création de marchand
     */
    isCreateRequest() {
      return this.type === 'create_merchant';
    }

    /**
     * Vérifier si c'est une demande de rejoindre un marchand
     */
    isJoinRequest() {
      return this.type === 'join_merchant';
    }

    /**
     * Vérifier si la demande est en attente
     */
    isPending() {
      return this.status === 'pending';
    }

    /**
     * Vérifier si la demande est approuvée
     */
    isApproved() {
      return this.status === 'approved';
    }

    /**
     * Vérifier si la demande est rejetée
     */
    isRejected() {
      return this.status === 'rejected';
    }

    /**
     * Approuver la demande
     */
    async approve(processedBy, adminNotes = null) {
      this.status = 'approved';
      this.processed_by = processedBy;
      this.processed_at = new Date();
      if (adminNotes) {
        this.admin_notes = adminNotes;
      }
      
      return await this.save();
    }

    /**
     * Rejeter la demande
     */
    async reject(processedBy, adminNotes = null) {
      this.status = 'rejected';
      this.processed_by = processedBy;
      this.processed_at = new Date();
      if (adminNotes) {
        this.admin_notes = adminNotes;
      }
      
      return await this.save();
    }

    /**
     * Obtenir les données formatées pour l'admin
     */
    getAdminView() {
      const baseData = {
        id: this.id,
        type: this.type,
        status: this.status,
        justification: this.justification,
        admin_notes: this.admin_notes,
        processed_at: this.processed_at,
        created_at: this.created_at,
        updated_at: this.updated_at
      };

      if (this.isCreateRequest()) {
        return {
          ...baseData,
          merchant_data: {
            name: this.requested_merchant_name,
            website_url: this.requested_website_url,
            business_type: this.requested_business_type,
            company_name: this.requested_company_name,
            company_address: this.requested_company_address,
            company_phone: this.requested_company_phone,
            company_email: this.requested_company_email,
            siret: this.requested_siret,
            description: this.requested_description
          }
        };
      } else {
        return {
          ...baseData,
          merchant_id: this.merchant_id,
          requested_role: this.requested_role
        };
      }
    }

    /**
     * Valider les données de création de marchand
     */
    validateCreateData() {
      const errors = [];
      
      if (!this.requested_merchant_name || this.requested_merchant_name.length < 2) {
        errors.push('Le nom du marchand est requis (min 2 caractères)');
      }
      
      if (!this.requested_website_url) {
        errors.push('L\'URL du site web est requise');
      }
      
      if (!this.requested_company_name || this.requested_company_name.length < 2) {
        errors.push('Le nom de l\'entreprise est requis (min 2 caractères)');
      }
      
      if (!this.requested_company_address) {
        errors.push('L\'adresse de l\'entreprise est requise');
      }
      
      if (!this.requested_company_email) {
        errors.push('L\'email de l\'entreprise est requis');
      }
      
      return errors;
    }
  }

  MerchantRequest.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('create_merchant', 'join_merchant'),
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // Données pour création de marchand
    requested_merchant_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    requested_website_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    requested_business_type: {
      type: DataTypes.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
      allowNull: true
    },
    requested_company_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    requested_company_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requested_company_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    requested_company_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    requested_siret: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    requested_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Pour les demandes de rejoindre un marchand
    requested_role: {
      type: DataTypes.ENUM('admin', 'manager', 'developer'),
      defaultValue: 'developer',
      allowNull: true
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processed_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MerchantRequest',
    tableName: 'merchant_requests',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['merchant_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      }
    ]
  });

  return MerchantRequest;
};
