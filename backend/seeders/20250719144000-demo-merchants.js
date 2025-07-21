'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { v4: uuidv4 } = require('uuid');
    
    // Récupérer les IDs des utilisateurs
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('merchant1@example.com', 'merchant2@example.com', 'admin@payment-platform.com', 'test@example.com', 'newuser@example.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const userMap = {};
    users.forEach(user => {
      if (user.email === 'merchant1@example.com') userMap.merchant1 = user.id;
      if (user.email === 'merchant2@example.com') userMap.merchant2 = user.id;
      if (user.email === 'admin@payment-platform.com') userMap.admin = user.id;
      if (user.email === 'test@example.com') userMap.test = user.id;
      if (user.email === 'newuser@example.com') userMap.newuser = user.id;
    });

    // Créer quelques marchands de test
    const merchant1Id = uuidv4();
    const merchant2Id = uuidv4();
    
    const merchants = [
      {
        id: merchant1Id,
        name: 'TechShop Online',
        description: 'Boutique en ligne spécialisée dans les produits technologiques et électroniques.',
        website_url: 'https://techshop-online.example.com',
        business_type: 'e-commerce',
        company_name: 'TechShop SARL',
        company_address: '123 Avenue des Technologies, 75001 Paris, France',
        company_phone: '+33 1 23 45 67 89',
        company_email: 'contact@techshop-online.example.com',
        siret: '12345678901234',
        api_key: 'tech_shop_api_key_123456789abcdef',
        api_secret: 'tech_shop_api_secret_987654321fedcba0123456789abcdef',
        webhook_url: 'https://techshop-online.example.com/webhooks/payment',
        status: 'active',
        created_by: userMap.merchant1,
        validated_by: userMap.admin,
        validated_at: new Date('2025-07-15T10:00:00Z'),
        created_at: new Date('2025-07-15T09:00:00Z'),
        updated_at: new Date('2025-07-15T10:00:00Z')
      },
      {
        id: merchant2Id,
        name: 'CloudService Pro',
        description: 'Service SaaS pour la gestion d\'entreprise et la productivité.',
        website_url: 'https://cloudservice-pro.example.com',
        business_type: 'saas',
        company_name: 'CloudService Pro SAS',
        company_address: '456 Rue du Cloud, 69000 Lyon, France',
        company_phone: '+33 4 56 78 90 12',
        company_email: 'hello@cloudservice-pro.example.com',
        siret: '98765432109876',
        api_key: 'cloud_service_api_key_abcdef123456789',
        api_secret: 'cloud_service_api_secret_fedcba0987654321abcdef123456789',
        webhook_url: 'https://cloudservice-pro.example.com/api/webhooks/payment',
        status: 'active',
        created_by: userMap.merchant2,
        validated_by: userMap.admin,
        validated_at: new Date('2025-07-16T14:30:00Z'),
        created_at: new Date('2025-07-16T14:00:00Z'),
        updated_at: new Date('2025-07-16T14:30:00Z')
      }
    ];

    await queryInterface.bulkInsert('merchants', merchants, {});

    // Créer les relations user-merchant
    const userMerchants = [
      {
        id: uuidv4(),
        user_id: userMap.merchant1,
        merchant_id: merchant1Id,
        role: 'admin',
        status: 'active',
        joined_at: new Date('2025-07-15T10:00:00Z'),
        created_at: new Date('2025-07-15T10:00:00Z'),
        updated_at: new Date('2025-07-15T10:00:00Z')
      },
      {
        id: uuidv4(),
        user_id: userMap.merchant2,
        merchant_id: merchant2Id,
        role: 'admin',
        status: 'active',
        joined_at: new Date('2025-07-16T14:30:00Z'),
        created_at: new Date('2025-07-16T14:30:00Z'),
        updated_at: new Date('2025-07-16T14:30:00Z')
      }
    ];

    await queryInterface.bulkInsert('user_merchants', userMerchants, {});

    // Créer quelques demandes de test (en attente)
    const merchantRequests = [
      {
        id: uuidv4(),
        type: 'join_merchant',
        user_id: userMap.newuser,
        merchant_id: merchant1Id,
        requested_role: 'developer',
        justification: 'Je souhaite rejoindre l\'équipe TechShop en tant que développeur pour intégrer votre système de paiement. J\'ai 3 ans d\'expérience en développement web et API.',
        status: 'pending',
        created_at: new Date('2025-07-19T12:00:00Z'),
        updated_at: new Date('2025-07-19T12:00:00Z')
      }
    ];

    // Ajouter une demande de création si l'utilisateur test existe
    if (userMap.test) {
      merchantRequests.push({
        id: uuidv4(),
        type: 'create_merchant',
        user_id: userMap.test,
        requested_merchant_name: 'EcoMarketplace',
        requested_website_url: 'https://ecomarketplace.example.com',
        requested_business_type: 'marketplace',
        requested_company_name: 'EcoMarketplace SARL',
        requested_company_address: '789 Boulevard Écologique, 13000 Marseille, France',
        requested_company_phone: '+33 4 91 23 45 67',
        requested_company_email: 'contact@ecomarketplace.example.com',
        requested_siret: '11223344556677',
        requested_description: 'Marketplace écologique pour la vente de produits respectueux de l\'environnement.',
        justification: 'Je souhaite créer une marketplace dédiée aux produits écologiques. Notre mission est de promouvoir une consommation responsable.',
        status: 'pending',
        created_at: new Date('2025-07-19T13:00:00Z'),
        updated_at: new Date('2025-07-19T13:00:00Z')
      });
    }

    await queryInterface.bulkInsert('merchant_requests', merchantRequests, {});
  },

  async down(queryInterface, Sequelize) {
    // Supprimer dans l'ordre inverse à cause des contraintes de clés étrangères
    await queryInterface.bulkDelete('merchant_requests', null, {});
    await queryInterface.bulkDelete('user_merchants', null, {});
    await queryInterface.bulkDelete('merchants', null, {});
  }
};
