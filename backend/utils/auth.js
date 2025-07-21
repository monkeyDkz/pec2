const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Utiliser bcryptjs
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_2024';

function generateJWT(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token invalide');
    }
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

function generateExpirationDate(hours = 24) {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
}

function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

module.exports = {
    generateJWT,
    verifyJWT,
    hashPassword,
    verifyPassword,
    generateVerificationToken,
    generateExpirationDate,
    extractTokenFromHeader
};