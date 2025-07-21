'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(12);
    
    // Générer des UUIDs fixes pour pouvoir les référencer
    const adminId = uuidv4();
    const merchant1Id = uuidv4();
    const merchant2Id = uuidv4();
    const newUserId = uuidv4();
    
    const users = [
      {
        id: adminId,
        email: 'admin@payment-platform.com',
        password_hash: await bcrypt.hash('AdminPassword123!', salt),
        first_name: 'Admin',
        last_name: 'Platform',
        role: 'admin',
        is_verified: true,
        verification_token: null,
        verification_expires: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: merchant1Id,
        email: 'merchant1@example.com',
        password_hash: await bcrypt.hash('MerchantPass123!', salt),
        first_name: 'Jean',
        last_name: 'Dupont',
        role: 'merchant',
        is_verified: true,
        verification_token: null,
        verification_expires: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: merchant2Id,
        email: 'merchant2@example.com',
        password_hash: await bcrypt.hash('MerchantPass123!', salt),
        first_name: 'Marie',
        last_name: 'Martin',
        role: 'merchant',
        is_verified: true,
        verification_token: null,
        verification_expires: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: newUserId,
        email: 'newuser@example.com',
        password_hash: await bcrypt.hash('UserPass123!', salt),
        first_name: 'Pierre',
        last_name: 'Durand',
        role: 'merchant',
        is_verified: true,
        verification_token: null,
        verification_expires: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
    
    // Stocker les IDs pour les autres seeders
    global.seedIds = {
      adminId,
      merchant1Id,
      merchant2Id,
      newUserId
    };
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'admin@payment-platform.com',
          'merchant1@example.com', 
          'merchant2@example.com',
          'newuser@example.com'
        ]
      }
    }, {});
  }
};
