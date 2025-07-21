'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un utilisateur peut créer plusieurs marchands
      User.hasMany(models.Merchant, { 
        foreignKey: 'created_by', 
        as: 'created_merchants' 
      });
      
      // Un utilisateur peut valider plusieurs marchands (admin)
      User.hasMany(models.Merchant, { 
        foreignKey: 'validated_by', 
        as: 'validated_merchants' 
      });
      
      // Relation many-to-many avec les marchands
      User.belongsToMany(models.Merchant, {
        through: models.UserMerchant,
        foreignKey: 'user_id',
        as: 'merchants'
      });
      
      // Un utilisateur peut faire plusieurs demandes
      User.hasMany(models.MerchantRequest, { 
        foreignKey: 'user_id', 
        as: 'merchant_requests' 
      });
      
      // Un utilisateur peut traiter plusieurs demandes (admin)
      User.hasMany(models.MerchantRequest, { 
        foreignKey: 'processed_by', 
        as: 'processed_requests' 
      });
    }

    // Méthodes d'instance
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password_hash);
    }

    // Méthodes statiques
    static async createUser(userData) {
      const { email, password, firstName, lastName } = userData;
      
      // Vérifier si l'email existe déjà
      const existingUser = await this.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Générer token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      const user = await this.create({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
        is_verified: false,
        role: 'merchant',
        status: 'pending'
      });

      return { user, verificationToken };
    }

    static async verifyUserEmail(token) {
      const user = await this.findOne({
        where: {
          verification_token: token,
          verification_expires: {
            [sequelize.Sequelize.Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Token de vérification invalide ou expiré');
      }

      await user.update({
        is_verified: true,
        verification_token: null,
        verification_expires: null,
        status: 'active'
      });

      return user;
    }

    static async authenticateUser(email, password) {
      const user = await this.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!user.is_verified) {
        throw new Error('Veuillez vérifier votre email avant de vous connecter');
      }

      return user;
    }

    static async generateNewVerificationToken(email) {
      const user = await this.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.is_verified) {
        throw new Error('Cet email est déjà vérifié');
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      await user.update({
        verification_token: verificationToken,
        verification_expires: verificationExpires
      });

      return { user, verificationToken };
    }

    // Sérialisation pour JSON (exclure les données sensibles)
    toJSON() {
      const values = { ...this.get() };
      delete values.password_hash;
      delete values.verification_token;
      delete values.verification_expires;
      return values;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'merchant'),
      defaultValue: 'merchant'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    verification_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['verification_token']
      }
    ]
  });

  return User;
};