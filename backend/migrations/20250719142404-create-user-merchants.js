'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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

    // Contrainte unique pour empêcher les doublons user-merchant
    await queryInterface.addConstraint('user_merchants', {
      fields: ['user_id', 'merchant_id'],
      type: 'unique',
      name: 'unique_user_merchant'
    });

    // Index pour les performances
    await queryInterface.addIndex('user_merchants', ['user_id']);
    await queryInterface.addIndex('user_merchants', ['merchant_id']);
    await queryInterface.addIndex('user_merchants', ['role']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_merchants');
  }
};
