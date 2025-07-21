'use strict';

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Récupérer les marchands existants
    const merchants = await queryInterface.sequelize.query(
      'SELECT id FROM merchants WHERE status = "active" LIMIT 2',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (merchants.length < 2) {
      console.log('❌ Pas assez de marchands actifs pour créer des transactions de démonstration');
      return;
    }

    const [merchant1, merchant2] = merchants;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h plus tard

    // Données de transactions de démonstration
    const transactions = [
      {
        id: uuidv4(),
        merchant_id: merchant1.id,
        order_id: 'DEMO_ORDER_001',
        amount: 99.99,
        currency: 'EUR',
        description: 'Achat produit démonstration - Ordinateur portable',
        customer_email: 'demo.client1@example.com',
        customer_first_name: 'Pierre',
        customer_last_name: 'Démonstration',
        billing_address: JSON.stringify({
          street: '123 Avenue des Champs-Élysées',
          city: 'Paris',
          postal_code: '75008',
          country: 'FR'
        }),
        shipping_address: JSON.stringify({
          street: '123 Avenue des Champs-Élysées',
          city: 'Paris',
          postal_code: '75008',
          country: 'FR'
        }),
        success_url: 'https://demo-merchant.com/success',
        cancel_url: 'https://demo-merchant.com/cancel',
        webhook_url: 'https://demo-merchant.com/webhook',
        status: 'success',
        payment_token: crypto.randomBytes(32).toString('hex'),
        metadata: JSON.stringify({
          demo: true,
          product_category: 'electronics',
          campaign: 'WINTER2025'
        }),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        paid_at: now,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        merchant_id: merchant1.id,
        order_id: 'DEMO_ORDER_002',
        amount: 49.90,
        currency: 'EUR',
        description: 'Livre numérique - Guide du développement',
        customer_email: 'demo.client2@example.com',
        customer_first_name: 'Marie',
        customer_last_name: 'Testeur',
        billing_address: JSON.stringify({
          street: '456 Rue de Rivoli',
          city: 'Lyon',
          postal_code: '69000',
          country: 'FR'
        }),
        success_url: 'https://demo-merchant.com/success',
        cancel_url: 'https://demo-merchant.com/cancel',
        status: 'pending',
        payment_token: crypto.randomBytes(32).toString('hex'),
        metadata: JSON.stringify({
          demo: true,
          product_category: 'digital',
          download_type: 'pdf'
        }),
        ip_address: '192.168.1.101',
        expires_at: expiresAt,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        merchant_id: merchant2.id,
        order_id: 'DEMO_ORDER_003',
        amount: 199.00,
        currency: 'EUR',
        description: 'Service consultation - 2 heures',
        customer_email: 'demo.client3@example.com',
        customer_first_name: 'Jean',
        customer_last_name: 'Consultant',
        billing_address: JSON.stringify({
          street: '789 Boulevard Saint-Germain',
          city: 'Marseille',
          postal_code: '13000',
          country: 'FR'
        }),
        success_url: 'https://cloud-service-demo.com/success',
        cancel_url: 'https://cloud-service-demo.com/cancel',
        webhook_url: 'https://cloud-service-demo.com/webhook',
        status: 'failed',
        payment_token: crypto.randomBytes(32).toString('hex'),
        metadata: JSON.stringify({
          demo: true,
          service_type: 'consulting',
          duration_hours: 2
        }),
        ip_address: '192.168.1.102',
        expires_at: expiresAt,
        created_at: new Date(now.getTime() - 60 * 60 * 1000), // 1h avant
        updated_at: new Date(now.getTime() - 30 * 60 * 1000)  // 30min avant
      },
      {
        id: uuidv4(),
        merchant_id: merchant2.id,
        order_id: 'DEMO_ORDER_004',
        amount: 25.50,
        currency: 'EUR',
        description: 'Abonnement mensuel - Plan Basic',
        customer_email: 'demo.client4@example.com',
        customer_first_name: 'Sophie',
        customer_last_name: 'Abonnée',
        billing_address: JSON.stringify({
          street: '321 Rue du Commerce',
          city: 'Toulouse',
          postal_code: '31000',
          country: 'FR'
        }),
        success_url: 'https://cloud-service-demo.com/success',
        cancel_url: 'https://cloud-service-demo.com/cancel',
        status: 'partial_refund',
        payment_token: crypto.randomBytes(32).toString('hex'),
        metadata: JSON.stringify({
          demo: true,
          subscription_plan: 'basic',
          billing_cycle: 'monthly'
        }),
        ip_address: '192.168.1.103',
        paid_at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h avant
        expires_at: expiresAt,
        created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3h avant
        updated_at: new Date(now.getTime() - 60 * 60 * 1000)      // 1h avant
      }
    ];

    // Insérer les transactions
    await queryInterface.bulkInsert('transactions', transactions);

    // Récupérer les IDs des transactions créées pour créer les opérations
    const createdTransactions = await queryInterface.sequelize.query(
      'SELECT id, merchant_id, amount, status FROM transactions WHERE order_id LIKE "DEMO_ORDER_%"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const operations = [];

    for (const transaction of createdTransactions) {
      if (transaction.status === 'success' || transaction.status === 'partial_refund') {
        // Opération de capture (paiement)
        operations.push({
          id: uuidv4(),
          transaction_id: transaction.id,
          merchant_id: transaction.merchant_id,
          type: 'capture',
          amount: transaction.amount,
          currency: 'EUR',
          status: 'success',
          psp_reference: `PSP_CAPTURE_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          psp_transaction_id: `TXN_${Date.now()}`,
          psp_response: JSON.stringify({
            card_last4: '1111',
            authorization_code: 'AUTH123',
            processor_response: 'APPROVED'
          }),
          submitted_to_psp_at: new Date(now.getTime() - 30 * 60 * 1000), // 30min avant
          processed_at: new Date(now.getTime() - 29 * 60 * 1000),        // 29min avant
          created_at: new Date(now.getTime() - 30 * 60 * 1000),
          updated_at: new Date(now.getTime() - 29 * 60 * 1000)
        });

        // Si c'est un remboursement partiel, ajouter l'opération de remboursement
        if (transaction.status === 'partial_refund') {
          operations.push({
            id: uuidv4(),
            transaction_id: transaction.id,
            merchant_id: transaction.merchant_id,
            type: 'refund',
            amount: '10.00', // Remboursement partiel
            currency: 'EUR',
            status: 'success',
            psp_reference: `PSP_REFUND_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            psp_transaction_id: `REF_${Date.now()}`,
            refund_reason: 'Remboursement partiel demandé par le client',
            psp_response: JSON.stringify({
              refund_reference: 'REF123',
              processor_response: 'REFUND_APPROVED'
            }),
            submitted_to_psp_at: new Date(now.getTime() - 10 * 60 * 1000), // 10min avant
            processed_at: new Date(now.getTime() - 9 * 60 * 1000),         // 9min avant
            created_at: new Date(now.getTime() - 10 * 60 * 1000),
            updated_at: new Date(now.getTime() - 9 * 60 * 1000)
          });
        }
      } else if (transaction.status === 'failed') {
        // Opération de capture échouée
        operations.push({
          id: uuidv4(),
          transaction_id: transaction.id,
          merchant_id: transaction.merchant_id,
          type: 'capture',
          amount: transaction.amount,
          currency: 'EUR',
          status: 'failed',
          psp_reference: `PSP_FAILED_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          error_message: 'Insufficient funds',
          error_code: 'INSUFFICIENT_FUNDS',
          psp_response: JSON.stringify({
            decline_reason: 'Insufficient funds',
            processor_response: 'DECLINED'
          }),
          submitted_to_psp_at: new Date(now.getTime() - 45 * 60 * 1000), // 45min avant
          processed_at: new Date(now.getTime() - 44 * 60 * 1000),        // 44min avant
          created_at: new Date(now.getTime() - 45 * 60 * 1000),
          updated_at: new Date(now.getTime() - 44 * 60 * 1000)
        });
      }
    }

    // Insérer les opérations
    if (operations.length > 0) {
      await queryInterface.bulkInsert('operations', operations);
    }

    console.log(`✅ ${transactions.length} transactions de démonstration créées`);
    console.log(`✅ ${operations.length} opérations de démonstration créées`);
  },

  async down (queryInterface, Sequelize) {
    // Supprimer les opérations de démonstration
    await queryInterface.bulkDelete('operations', {
      transaction_id: {
        [Sequelize.Op.in]: queryInterface.sequelize.literal(
          '(SELECT id FROM transactions WHERE order_id LIKE "DEMO_ORDER_%")'
        )
      }
    });

    // Supprimer les transactions de démonstration
    await queryInterface.bulkDelete('transactions', {
      order_id: {
        [Sequelize.Op.like]: 'DEMO_ORDER_%'
      }
    });

    console.log('✅ Données de démonstration supprimées');
  }
};
