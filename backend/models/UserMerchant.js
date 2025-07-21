const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserMerchant extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Relation avec User
      UserMerchant.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
      });
      
      // Relation avec Merchant
      UserMerchant.belongsTo(models.Merchant, { 
        foreignKey: 'merchant_id', 
        as: 'merchant' 
      });
    }

    /**
     * Vérifier si l'utilisateur est admin du marchand
     */
    isAdmin() {
      return this.role === 'admin';
    }

    /**
     * Vérifier si l'utilisateur est manager du marchand
     */
    isManager() {
      return this.role === 'manager';
    }

    /**
     * Vérifier si l'utilisateur est développeur du marchand
     */
    isDeveloper() {
      return this.role === 'developer';
    }

    /**
     * Vérifier si l'utilisateur a au moins le rôle manager
     */
    canManage() {
      return this.role === 'admin' || this.role === 'manager';
    }

    /**
     * Vérifier si l'utilisateur est actif
     */
    isActive() {
      return this.status === 'active';
    }

    /**
     * Suspendre l'accès de l'utilisateur
     */
    async suspend() {
      this.status = 'suspended';
      return await this.save();
    }

    /**
     * Réactiver l'accès de l'utilisateur
     */
    async activate() {
      this.status = 'active';
      return await this.save();
    }

    /**
     * Mettre à jour le rôle
     */
    async updateRole(newRole) {
      const validRoles = ['admin', 'manager', 'developer'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Rôle invalide');
      }
      
      this.role = newRole;
      return await this.save();
    }

    /**
     * Mettre à jour les permissions
     */
    async updatePermissions(permissions) {
      this.permissions = permissions;
      return await this.save();
    }

    /**
     * Obtenir les permissions par défaut selon le rôle
     */
    getDefaultPermissions() {
      const permissionSets = {
        admin: {
          transactions: { read: true, write: true, delete: true },
          settings: { read: true, write: true },
          users: { read: true, write: true, delete: true },
          api_keys: { read: true, write: true },
          webhooks: { read: true, write: true }
        },
        manager: {
          transactions: { read: true, write: true, delete: false },
          settings: { read: true, write: true },
          users: { read: true, write: false, delete: false },
          api_keys: { read: true, write: false },
          webhooks: { read: true, write: true }
        },
        developer: {
          transactions: { read: true, write: false, delete: false },
          settings: { read: true, write: false },
          users: { read: false, write: false, delete: false },
          api_keys: { read: true, write: false },
          webhooks: { read: true, write: false }
        }
      };

      return permissionSets[this.role] || permissionSets.developer;
    }

    /**
     * Vérifier une permission spécifique
     */
    hasPermission(resource, action) {
      const permissions = this.permissions || this.getDefaultPermissions();
      return permissions[resource] && permissions[resource][action] === true;
    }
  }

  UserMerchant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    merchant_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'developer'),
      defaultValue: 'developer',
      allowNull: false
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended'),
      defaultValue: 'active',
      allowNull: false
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserMerchant',
    tableName: 'user_merchants',
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
        fields: ['role']
      },
      {
        fields: ['user_id', 'merchant_id'],
        unique: true,
        name: 'unique_user_merchant'
      }
    ]
  });

  return UserMerchant;
};
