const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Envoyer email de vérification
async function sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${process.env.VERIFICATION_URL || 'http://localhost:8080/verify-email'}?token=${token}`;
    
    // En mode développement avec Resend, utiliser l'email de test configuré
    const testMode = process.env.NODE_ENV === 'development' && process.env.RESEND_TO_EMAIL;
    const recipientEmail = testMode ? process.env.RESEND_TO_EMAIL : email;
    
    try {
        console.log(`📧 Envoi email de vérification à: ${recipientEmail} ${testMode ? '(mode test)' : ''}`);
        
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [recipientEmail],
            subject: '🔐 Vérifiez votre email - Payment Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">Payment Platform</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Vérification de votre compte</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${firstName} ! 👋</h2>
                        
                        ${testMode ? `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ MODE TEST</strong><br>
                                Email original: <strong>${email}</strong><br>
                                Cet email a été redirigé vers votre adresse de test.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Merci de vous être inscrit sur Payment Platform ! 
                            Pour activer votre compte, cliquez sur le bouton ci-dessous :
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      padding: 15px 30px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      display: inline-block; 
                                      font-weight: bold;
                                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                ✅ Vérifier mon email
                            </a>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
                            <p style="margin: 0; color: #1565c0; font-size: 14px;">
                                <strong>⏰ Ce lien expire dans 24 heures</strong><br>
                                Si vous n'avez pas créé de compte, ignorez cet email.
                            </p>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                        
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                        </p>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; color: #999; font-size: 12px;">
                        © 2024 Payment Platform - Plateforme sécurisée de paiement
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Erreur envoi email de vérification:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
        }

        console.log('✅ Email de vérification envoyé à:', recipientEmail);
        console.log('📧 ID email Resend:', data?.id);
        
        if (testMode) {
            console.log(`🔧 MODE TEST: L'email pour ${email} a été envoyé à ${recipientEmail}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erreur service email:', error);
        throw error;
    }
}

// Envoyer email de bienvenue
async function sendWelcomeEmail(email, firstName) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
    
    // En mode développement avec Resend, utiliser l'email de test configuré
    const testMode = process.env.NODE_ENV === 'development' && process.env.RESEND_TO_EMAIL;
    const recipientEmail = testMode ? process.env.RESEND_TO_EMAIL : email;
    
    try {
        console.log(`📧 Envoi email de bienvenue à: ${recipientEmail} ${testMode ? '(mode test)' : ''}`);
        
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [recipientEmail],
            subject: '🎉 Bienvenue sur Payment Platform !',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">🎉 Bienvenue !</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre compte est maintenant actif</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333; margin-bottom: 20px;">Félicitations ${firstName} ! ✨</h2>
                        
                        ${testMode ? `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ MODE TEST</strong><br>
                                Email original: <strong>${email}</strong><br>
                                Cet email a été redirigé vers votre adresse de test.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Votre email a été vérifié avec succès ! 
                            Votre compte Payment Platform est maintenant actif et vous pouvez commencer à l'utiliser.
                        </p>
                        
                        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
                            <h3 style="margin: 0 0 10px 0; color: #2e7d32;">🚀 Prochaines étapes :</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #388e3c;">
                                <li>Connectez-vous à votre tableau de bord</li>
                                <li>Configurez vos préférences</li>
                                <li>Commencez à utiliser la plateforme</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${dashboardUrl}" 
                               style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); 
                                      color: white; 
                                      padding: 15px 30px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      display: inline-block; 
                                      font-weight: bold;
                                      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);">
                                📊 Accéder au tableau de bord
                            </a>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; color: #999; font-size: 12px;">
                        © 2024 Payment Platform - Plateforme sécurisée de paiement
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Erreur email bienvenue:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email de bienvenue');
        }

        console.log('✅ Email de bienvenue envoyé à:', recipientEmail);
        console.log('📧 ID email Resend:', data?.id);
        
        if (testMode) {
            console.log(`🔧 MODE TEST: L'email de bienvenue pour ${email} a été envoyé à ${recipientEmail}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erreur service email bienvenue:', error);
        throw error;
    }
}

// Envoyer email de confirmation d'approbation de demande marchand
async function sendMerchantApprovalEmail(email, firstName, merchantName, apiKey, apiSecret) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:8080/dashboard';
    
    // En mode développement avec Resend, utiliser l'email de test configuré
    const testMode = process.env.NODE_ENV === 'development' && process.env.RESEND_TO_EMAIL;
    const recipientEmail = testMode ? process.env.RESEND_TO_EMAIL : email;
    
    try {
        console.log(`📧 Envoi email d'approbation marchand à: ${recipientEmail} ${testMode ? '(mode test)' : ''}`);
        
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [recipientEmail],
            subject: '✅ Votre demande de compte marchand a été approuvée !',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">🎉 Demande Approuvée !</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre compte marchand est maintenant actif</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333; margin-bottom: 20px;">Félicitations ${firstName} ! ✨</h2>
                        
                        ${testMode ? `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ MODE TEST</strong><br>
                                Email original: <strong>${email}</strong><br>
                                Cet email a été redirigé vers votre adresse de test.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Excellente nouvelle ! Votre demande de création de compte marchand pour 
                            <strong>${merchantName}</strong> a été approuvée par notre équipe.
                        </p>
                        
                        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
                            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">🔑 Vos identifiants API :</h3>
                            <div style="background: #f1f8e9; padding: 15px; border-radius: 6px; font-family: monospace;">
                                <p style="margin: 0 0 10px 0; color: #333;"><strong>API Key:</strong></p>
                                <p style="margin: 0 0 15px 0; background: white; padding: 8px; border-radius: 4px; color: #2e7d32; word-break: break-all;">${apiKey}</p>
                                <p style="margin: 0 0 10px 0; color: #333;"><strong>API Secret:</strong></p>
                                <p style="margin: 0; background: white; padding: 8px; border-radius: 4px; color: #d32f2f; word-break: break-all;">${apiSecret}</p>
                            </div>
                            <p style="margin: 15px 0 0 0; color: #d32f2f; font-size: 14px;">
                                ⚠️ <strong>Important:</strong> Conservez ces identifiants en sécurité. L'API Secret ne sera plus affiché.
                            </p>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
                            <h3 style="margin: 0 0 10px 0; color: #1565c0;">🚀 Prochaines étapes :</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #1976d2;">
                                <li>Connectez-vous à votre tableau de bord marchand</li>
                                <li>Configurez vos paramètres de paiement</li>
                                <li>Intégrez l'API dans votre site web</li>
                                <li>Testez vos premiers paiements</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${dashboardUrl}" 
                               style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); 
                                      color: white; 
                                      padding: 15px 30px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      display: inline-block; 
                                      font-weight: bold;
                                      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);">
                                📊 Accéder au tableau de bord
                            </a>
                        </div>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; color: #999; font-size: 12px;">
                        © 2024 Payment Platform - Plateforme sécurisée de paiement
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Erreur email approbation marchand:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email d\'approbation');
        }

        console.log('✅ Email d\'approbation marchand envoyé à:', recipientEmail);
        console.log('📧 ID email Resend:', data?.id);
        
        if (testMode) {
            console.log(`🔧 MODE TEST: L'email d'approbation pour ${email} a été envoyé à ${recipientEmail}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erreur service email approbation marchand:', error);
        throw error;
    }
}

// Envoyer email de refus de demande marchand
async function sendMerchantRejectionEmail(email, firstName, merchantName, reason) {
    const supportUrl = process.env.SUPPORT_URL || 'http://localhost:8080/support';
    
    // En mode développement avec Resend, utiliser l'email de test configuré
    const testMode = process.env.NODE_ENV === 'development' && process.env.RESEND_TO_EMAIL;
    const recipientEmail = testMode ? process.env.RESEND_TO_EMAIL : email;
    
    try {
        console.log(`📧 Envoi email de refus marchand à: ${recipientEmail} ${testMode ? '(mode test)' : ''}`);
        
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [recipientEmail],
            subject: '❌ Votre demande de compte marchand nécessite une révision',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
                    <div style="background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">📋 Demande en révision</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre demande de compte marchand</p>
                    </div>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333; margin-bottom: 20px;">Bonjour ${firstName},</h2>
                        
                        ${testMode ? `
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>⚠️ MODE TEST</strong><br>
                                Email original: <strong>${email}</strong><br>
                                Cet email a été redirigé vers votre adresse de test.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Nous avons examiné votre demande de création de compte marchand pour 
                            <strong>${merchantName}</strong>, mais nous ne pouvons pas l'approuver dans son état actuel.
                        </p>
                        
                        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f44336;">
                            <h3 style="margin: 0 0 15px 0; color: #c62828;">📝 Raison du refus :</h3>
                            <p style="margin: 0; color: #d32f2f; background: white; padding: 15px; border-radius: 6px; line-height: 1.6;">
                                ${reason}
                            </p>
                        </div>
                        
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196f3;">
                            <h3 style="margin: 0 0 10px 0; color: #1565c0;">🔄 Que faire maintenant ?</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #1976d2; line-height: 1.6;">
                                <li>Prenez en compte les commentaires ci-dessus</li>
                                <li>Corrigez les éléments mentionnés</li>
                                <li>Soumettez une nouvelle demande</li>
                                <li>Contactez notre support si vous avez des questions</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${supportUrl}" 
                               style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); 
                                      color: white; 
                                      padding: 15px 30px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      display: inline-block; 
                                      font-weight: bold;
                                      box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                                💬 Contacter le support
                            </a>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
                            Notre équipe reste à votre disposition pour vous accompagner dans le processus d'approbation.
                            N'hésitez pas à nous contacter si vous avez besoin d'aide.
                        </p>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; color: #999; font-size: 12px;">
                        © 2024 Payment Platform - Plateforme sécurisée de paiement
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('❌ Erreur email refus marchand:', error);
            throw new Error('Erreur lors de l\'envoi de l\'email de refus');
        }

        console.log('✅ Email de refus marchand envoyé à:', recipientEmail);
        console.log('📧 ID email Resend:', data?.id);
        
        if (testMode) {
            console.log(`🔧 MODE TEST: L'email de refus pour ${email} a été envoyé à ${recipientEmail}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erreur service email refus marchand:', error);
        throw error;
    }
}

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendMerchantApprovalEmail,
    sendMerchantRejectionEmail
};