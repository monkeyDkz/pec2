const { Model, DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  class Merchant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un marchand est créé par un utilisateur
      Merchant.belongsTo(models.User, { 
        foreignKey: 'created_by', 
        as: 'creator' 
      });
      
      // Un marchand peut être validé par un admin
      Merchant.belongsTo(models.User, { 
        foreignKey: 'validated_by', 
        as: 'validator' 
      });
      
      // Relation many-to-many avec les utilisateurs
      Merchant.belongsToMany(models.User, {
        through: models.UserMerchant,
        foreignKey: 'merchant_id',
        as: 'users'
      });
      
      // Association directe avec UserMerchant pour les requêtes
      Merchant.hasMany(models.UserMerchant, {
        foreignKey: 'merchant_id',
        as: 'userMerchants'
      });
      
      // Un marchand peut avoir plusieurs demandes
      Merchant.hasMany(models.MerchantRequest, { 
        foreignKey: 'merchant_id', 
        as: 'requests' 
      });
    }

    /**
     * Générer une API key unique pour le marchand
     */
    static generateApiKey() {
      return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Générer un secret API pour le marchand
     */
    static generateApiSecret() {
      return crypto.randomBytes(64).toString('hex');
    }

    /**
     * Activer le marchand (générer les clés API)
     */
    async activate(validatedBy = null) {
      this.status = 'active';
      this.api_key = Merchant.generateApiKey();
      this.api_secret = Merchant.generateApiSecret();
      this.validated_by = validatedBy;
      this.validated_at = new Date();
      
      return await this.save();
    }

    /**
     * Suspendre le marchand
     */
    async suspend() {
      this.status = 'suspended';
      return await this.save();
    }

    /**
     * Rejeter le marchand
     */
    async reject() {
      this.status = 'rejected';
      return await this.save();
    }

    /**
     * Vérifier si le marchand est actif
     */
    isActive() {
      return this.status === 'active';
    }

    /**
     * Obtenir les informations publiques du marchand
     */
    getPublicInfo() {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        website_url: this.website_url,
        business_type: this.business_type,
        status: this.status,
        created_at: this.created_at
      };
    }

    /**
     * Obtenir les informations privées (avec clés API)
     */
    getPrivateInfo() {
      return {
        ...this.getPublicInfo(),
        company_name: this.company_name,
        company_email: this.company_email,
        company_phone: this.company_phone,
        api_key: this.api_key,
        webhook_url: this.webhook_url,
        validated_at: this.validated_at,
        updated_at: this.updated_at
      };
    }

    /**
     * Sérialisation JSON (exclut les données sensibles)
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.api_secret;
      return values;
    }
  }

  Merchant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    business_type: {
      type: DataTypes.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
      defaultValue: 'other',
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    company_address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    company_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[\+]?[0-9\s\-\(\)]+$/i
      }
    },
    company_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    siret: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9]{14}$/i
      }
    },
    api_key: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true
    },
    api_secret: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    webhook_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    validated_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    validated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Merchant',
    tableName: 'merchants',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['api_key'],
        unique: true
      }
    ]
  });

  return Merchant;
};
