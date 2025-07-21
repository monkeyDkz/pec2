'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupérer quelques utilisateurs existants pour créer des demandes
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM users WHERE role = "user" OR role = "merchant" LIMIT 5'
    );
    
    const userRows = users[0];
    
    if (userRows.length === 0) {
      console.log('Aucun utilisateur trouvé, création d\'utilisateurs de test...');
      
      // Créer quelques utilisateurs de test
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      
      const testUsers = [
        {
          id: uuidv4(),
          email: 'user1@test.com',
          password_hash: await bcrypt.hash('TestPass123!', salt),
          first_name: 'Alice',
          last_name: 'Johnson',
          role: 'user',
          is_verified: true,
          verification_token: null,
          verification_expires: null,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          email: 'user2@test.com',
          password_hash: await bcrypt.hash('TestPass123!', salt),
          first_name: 'Bob',
          last_name: 'Smith',
          role: 'user',
          is_verified: true,
          verification_token: null,
          verification_expires: null,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          email: 'user3@test.com',
          password_hash: await bcrypt.hash('TestPass123!', salt),
          first_name: 'Carol',
          last_name: 'Williams',
          role: 'user',
          is_verified: true,
          verification_token: null,
          verification_expires: null,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      await queryInterface.bulkInsert('users', testUsers);
      
      // Utiliser les nouveaux utilisateurs créés
      userRows.push(...testUsers);
    }
    
    // Créer des demandes de marchands
    const merchantRequests = [
      {
        id: uuidv4(),
        user_id: userRows[0].id,
        type: 'create_merchant',
        requested_merchant_name: 'TechStart',
        requested_company_name: 'TechStart SARL',
        requested_siret: '12345678901234',
        requested_company_address: '123 Rue de la Tech, 75001 Paris',
        requested_description: 'Startup spécialisée dans les solutions de paiement en ligne',
        requested_website_url: 'https://techstart.example.com',
        requested_business_type: 'saas',
        requested_company_email: 'contact@techstart.example.com',
        requested_company_phone: '+33123456789',
        justification: 'Nous souhaitons intégrer votre plateforme de paiement pour nos clients',
        status: 'pending',
        admin_notes: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: userRows[1] ? userRows[1].id : userRows[0].id,
        type: 'create_merchant',
        requested_merchant_name: 'E-commerce Plus',
        requested_company_name: 'E-commerce Plus SAS',
        requested_siret: '98765432109876',
        requested_company_address: '456 Avenue du Commerce, 69002 Lyon',
        requested_description: 'Plateforme de vente en ligne multi-marchands',
        requested_website_url: 'https://ecommerce-plus.example.com',
        requested_business_type: 'marketplace',
        requested_company_email: 'admin@ecommerce-plus.example.com',
        requested_company_phone: '+33987654321',
        justification: 'Besoin d\'une solution de paiement robuste pour notre marketplace',
        status: 'pending',
        admin_notes: null,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        user_id: userRows[2] ? userRows[2].id : userRows[0].id,
        type: 'join_merchant',
        merchant_id: null, // On mettra un ID existant si on en trouve
        requested_role: 'developer',
        justification: 'Demande de rejoindre l\'équipe de développement d\'un marchand existant',
        status: 'pending',
        admin_notes: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        user_id: userRows[0].id,
        type: 'create_merchant',
        requested_merchant_name: 'Digital Services',
        requested_company_name: 'Digital Services Co',
        requested_siret: '11223344556677',
        requested_company_address: '789 Boulevard Innovation, 31000 Toulouse',
        requested_description: 'Services digitaux et consulting IT',
        requested_website_url: 'https://digital-services.example.com',
        requested_business_type: 'service',
        requested_company_email: 'info@digital-services.example.com',
        requested_company_phone: '+33511223344',
        justification: 'Expansion de nos services de consulting avec paiements en ligne',
        status: 'approved',
        admin_notes: 'Demande approuvée - documentation complète',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        user_id: userRows[1] ? userRows[1].id : userRows[0].id,
        type: 'create_merchant',
        requested_merchant_name: 'Fake Company',
        requested_company_name: 'Fake Company Ltd',
        requested_siret: '00000000000000',
        requested_company_address: 'Adresse incomplète',
        requested_description: 'Description suspecte et incomplète',
        requested_website_url: 'https://suspicious-site.fake',
        requested_business_type: 'other',
        requested_company_email: 'fake@fake.fake',
        requested_company_phone: '0000000000',
        justification: 'Justification peu convaincante',
        status: 'rejected',
        admin_notes: 'Demande rejetée - informations non vérifiables',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Il y a 14 jours
        updated_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('merchant_requests', merchantRequests);
    
    console.log(`✅ ${merchantRequests.length} demandes de marchands créées`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('merchant_requests', null, {});
  }
};
