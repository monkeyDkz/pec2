const { User } = require('../models');
const { generateJWT } = require('../utils/auth');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

// Inscription
const register = async (req, res) => {
    try {
        console.log('🔄 Tentative d\'inscription pour:', req.validatedData.email);
        const { email, password, firstName, lastName } = req.validatedData;

        const { user, verificationToken } = await User.createUser({
            email, password, firstName, lastName
        });

        console.log('✅ Utilisateur créé avec ID:', user.id);
        
        // Envoyer email de vérification
        try {
            await sendVerificationEmail(email, verificationToken, firstName);
            console.log('✅ Email de vérification envoyé');
        } catch (emailError) {
            console.error('❌ Erreur envoi email:', emailError.message);
            // On continue même si l'email échoue
        }

        res.status(201).json({
            success: true,
            message: 'Inscription réussie ! Vérifiez votre email pour activer votre compte.',
            data: { 
                user: user.toJSON(),
                emailSent: true 
            }
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        console.log('🔄 Tentative de connexion pour:', req.validatedData.email);
        const { email, password } = req.validatedData;

        const user = await User.authenticateUser(email, password);
        console.log('✅ Identifiants vérifiés pour l\'utilisateur ID:', user.id);

        const token = generateJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        console.log('✅ Connexion réussie pour:', email);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: { 
                user: user.toJSON(), 
                token,
                expiresIn: '24h'
            }
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error.message);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

// Vérification email
const verifyEmail = async (req, res) => {
    try {
        console.log('🔄 Tentative de vérification email avec token:', req.validatedData.token.substring(0, 10) + '...');
        const { token } = req.validatedData;

        const user = await User.verifyUserEmail(token);
        console.log('✅ Email vérifié pour l\'utilisateur ID:', user.id);

        // Envoyer email de bienvenue
        try {
            await sendWelcomeEmail(user.email, user.first_name);
            console.log('✅ Email de bienvenue envoyé');
        } catch (emailError) {
            console.error('❌ Erreur envoi email bienvenue:', emailError.message);
            // On continue même si l'email échoue
        }

        const authToken = generateJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: 'Email vérifié avec succès ! Votre compte est maintenant actif.',
            data: { 
                user: user.toJSON(), 
                token: authToken,
                expiresIn: '24h'
            }
        });

    } catch (error) {
        console.error('❌ Erreur vérification email:', error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Renvoyer vérification
const resendVerification = async (req, res) => {
    try {
        console.log('🔄 Renvoi de vérification pour:', req.validatedData.email);
        const { email } = req.validatedData;

        const { user, verificationToken } = await User.generateNewVerificationToken(email);
        
        // Envoyer nouvel email de vérification
        try {
            await sendVerificationEmail(email, verificationToken, user.first_name);
            console.log('✅ Nouvel email de vérification envoyé');
        } catch (emailError) {
            console.error('❌ Erreur envoi email:', emailError.message);
            throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
        }

        res.json({
            success: true,
            message: 'Nouvel email de vérification envoyé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur renvoi vérification:', error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Profil
const getProfile = async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user.toJSON() }
    });
};

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification,
    getProfile
};