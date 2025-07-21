const Joi = require('joi');

const schemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'L\'email doit être valide',
            'any.required': 'L\'email est requis'
        }),
        password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
            'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
            'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
            'any.required': 'Le mot de passe est requis'
        }),
        firstName: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Le prénom doit contenir au moins 2 caractères',
            'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
            'any.required': 'Le prénom est requis'
        }),
        lastName: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Le nom doit contenir au moins 2 caractères',
            'string.max': 'Le nom ne peut pas dépasser 50 caractères',
            'any.required': 'Le nom est requis'
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'L\'email doit être valide',
            'any.required': 'L\'email est requis'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Le mot de passe est requis'
        }),
        rememberMe: Joi.boolean().optional()
    }),

    verifyEmail: Joi.object({
        token: Joi.string().required().messages({
            'any.required': 'Le token de vérification est requis'
        })
    }),

    resendVerification: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'L\'email doit être valide',
            'any.required': 'L\'email est requis'
        })
    }),

    // Nouvelles validations pour les transactions
    createTransaction: Joi.object({
        order_id: Joi.string().min(1).max(100).required().messages({
            'string.min': 'L\'ID de commande ne peut pas être vide',
            'string.max': 'L\'ID de commande ne peut pas dépasser 100 caractères',
            'any.required': 'L\'ID de commande est requis'
        }),
        amount: Joi.number().positive().precision(2).required().messages({
            'number.positive': 'Le montant doit être positif',
            'any.required': 'Le montant est requis'
        }),
        currency: Joi.string().valid('EUR', 'USD', 'GBP', 'JPY').default('EUR'),
        description: Joi.string().max(500).allow(''),
        customer_email: Joi.string().email().required().messages({
            'string.email': 'L\'email du client doit être valide',
            'any.required': 'L\'email du client est requis'
        }),
        customer_first_name: Joi.string().max(100).allow(''),
        customer_last_name: Joi.string().max(100).allow(''),
        billing_address: Joi.object().allow(null),
        shipping_address: Joi.object().allow(null),
        success_url: Joi.string().uri().required().messages({
            'string.uri': 'L\'URL de succès doit être valide',
            'any.required': 'L\'URL de succès est requise'
        }),
        cancel_url: Joi.string().uri().required().messages({
            'string.uri': 'L\'URL d\'annulation doit être valide',
            'any.required': 'L\'URL d\'annulation est requise'
        }),
        webhook_url: Joi.string().uri().allow(''),
        metadata: Joi.object().allow(null)
    }),

    processPayment: Joi.object({
        token: Joi.string().required().messages({
            'any.required': 'Le token de paiement est requis'
        }),
        payment_method: Joi.object({
            type: Joi.string().valid('card', 'bank_transfer', 'digital_wallet').required(),
            card_number: Joi.when('type', {
                is: 'card',
                then: Joi.string().pattern(/^\d{13,19}$/).required(),
                otherwise: Joi.forbidden()
            }),
            expiry_month: Joi.when('type', {
                is: 'card',
                then: Joi.number().min(1).max(12).required(),
                otherwise: Joi.forbidden()
            }),
            expiry_year: Joi.when('type', {
                is: 'card',
                then: Joi.number().min(new Date().getFullYear()).required(),
                otherwise: Joi.forbidden()
            }),
            cvv: Joi.when('type', {
                is: 'card',
                then: Joi.string().pattern(/^\d{3,4}$/).required(),
                otherwise: Joi.forbidden()
            }),
            cardholder_name: Joi.when('type', {
                is: 'card',
                then: Joi.string().required(),
                otherwise: Joi.forbidden()
            })
        }).required()
    }),

    createRefund: Joi.object({
        amount: Joi.number().positive().precision(2).optional().messages({
            'number.positive': 'Le montant du remboursement doit être positif'
        }),
        reason: Joi.string().max(500).required().messages({
            'string.max': 'La raison ne peut pas dépasser 500 caractères',
            'any.required': 'La raison du remboursement est requise'
        }),
        metadata: Joi.object().allow(null)
    })
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: error.details.map(detail => detail.message)
            });
        }

        req.validatedData = value;
        next();
    };
};

// Raccourcis pour les nouvelles validations
const validateCreateTransaction = validate('createTransaction');
const validateProcessPayment = validate('processPayment');
const validateCreateRefund = validate('createRefund');

module.exports = { 
    validate,
    validateCreateTransaction,
    validateProcessPayment,
    validateCreateRefund
};