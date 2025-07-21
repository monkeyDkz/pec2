'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // IMPORTANT: Cette migration nécessite de supprimer et recréer les tables
    // car MySQL ne permet pas de modifier facilement les clés primaires
    
    console.log('🔄 Conversion des IDs en UUIDs...');
    
    // 1. Supprimer les tables dans l'ordre inverse des dépendances
    await queryInterface.dropTable('user_merchants');
    await queryInterface.dropTable('merchant_requests');
    await queryInterface.dropTable('merchants');
    await queryInterface.dropTable('users');
    
    // 2. Recréer la table users avec UUID
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'merchant'),
        defaultValue: 'merchant',
        allowNull: false
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      verification_token: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      verification_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending'),
        defaultValue: 'pending',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Index pour users
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['verification_token']);

    // 3. Recréer la table merchants avec UUID
    await queryInterface.createTable('merchants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      business_type: {
        type: Sequelize.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
        defaultValue: 'other',
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      company_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      company_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      company_email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      siret: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      api_key: {
        type: Sequelize.STRING(64),
        allowNull: true,
        unique: true
      },
      api_secret: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      validated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      validated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Index pour merchants
    await queryInterface.addIndex('merchants', ['status']);
    await queryInterface.addIndex('merchants', ['created_by']);
    await queryInterface.addIndex('merchants', ['api_key']);

    // 4. Recréer la table merchant_requests avec UUID
    await queryInterface.createTable('merchant_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('create_merchant', 'join_merchant'),
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requested_merchant_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      requested_website_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      requested_business_type: {
        type: Sequelize.ENUM('e-commerce', 'saas', 'marketplace', 'service', 'other'),
        allowNull: true
      },
      requested_company_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      requested_company_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_company_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      requested_company_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      requested_siret: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      requested_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_role: {
        type: Sequelize.ENUM('admin', 'manager', 'developer'),
        defaultValue: 'developer',
        allowNull: true
      },
      justification: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Index pour merchant_requests
    await queryInterface.addIndex('merchant_requests', ['user_id']);
    await queryInterface.addIndex('merchant_requests', ['merchant_id']);
    await queryInterface.addIndex('merchant_requests', ['status']);
    await queryInterface.addIndex('merchant_requests', ['type']);

    // 5. Recréer la table user_merchants avec UUID
    await queryInterface.createTable('user_merchants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'merchants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'developer'),
        defaultValue: 'developer',
        allowNull: false
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended'),
        defaultValue: 'active',
        allowNull: false
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Contrainte unique et index pour user_merchants
    await queryInterface.addConstraint('user_merchants', {
      fields: ['user_id', 'merchant_id'],
      type: 'unique',
      name: 'unique_user_merchant'
    });
    await queryInterface.addIndex('user_merchants', ['user_id']);
    await queryInterface.addIndex('user_merchants', ['merchant_id']);
    await queryInterface.addIndex('user_merchants', ['role']);

    console.log('✅ Conversion des IDs en UUIDs terminée !');
  },

  async down(queryInterface, Sequelize) {
    // Revenir aux entiers auto-incrémentés
    await queryInterface.dropTable('user_merchants');
    await queryInterface.dropTable('merchant_requests');
    await queryInterface.dropTable('merchants');
    await queryInterface.dropTable('users');
    
    // Recréer avec les anciens schémas (entiers)
    // ... (code de rollback si nécessaire)
  }
};
