const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class WebSocketService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // userId -> { ws, user }
        this.rooms = new Map(); // roomId -> Set of userIds
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ 
            server,
            path: '/ws'
        });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        console.log('✅ WebSocket service initialized on /ws');
    }

    async handleConnection(ws, req) {
        try {
            // Extract token from query params or headers
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                ws.close(1008, 'Token required');
                return;
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                ws.close(1008, 'Invalid user');
                return;
            }

            // Store client
            this.clients.set(user.id, { ws, user });
            
            // Join user room
            this.joinRoom(`user_${user.id}`, user.id);
            
            // Join role-based rooms
            if (user.role === 'admin') {
                this.joinRoom('admin', user.id);
            }

            console.log(`✅ User ${user.email} connected to WebSocket`);

            // Send connection confirmation
            this.sendToUser(user.id, {
                type: 'connection_established',
                data: {
                    userId: user.id,
                    timestamp: new Date().toISOString()
                }
            });

            // Handle client messages
            ws.on('message', (message) => {
                this.handleMessage(user.id, message);
            });

            // Handle disconnection
            ws.on('close', () => {
                this.handleDisconnection(user.id);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for user ${user.id}:`, error);
                this.handleDisconnection(user.id);
            });

        } catch (error) {
            console.error('WebSocket connection error:', error);
            ws.close(1008, 'Authentication failed');
        }
    }

    handleMessage(userId, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'ping':
                    this.sendToUser(userId, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                    
                case 'subscribe_merchant':
                    this.joinRoom(`merchant_${data.merchantId}`, userId);
                    break;
                    
                case 'unsubscribe_merchant':
                    this.leaveRoom(`merchant_${data.merchantId}`, userId);
                    break;
                    
                default:
                    console.log(`Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    handleDisconnection(userId) {
        // Remove from all rooms
        for (const [roomId, userIds] of this.rooms) {
            userIds.delete(userId);
            if (userIds.size === 0) {
                this.rooms.delete(roomId);
            }
        }

        // Remove client
        this.clients.delete(userId);
        console.log(`🔌 User ${userId} disconnected from WebSocket`);
    }

    joinRoom(roomId, userId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(userId);
    }

    leaveRoom(roomId, userId) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(userId);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
            }
        }
    }

    sendToUser(userId, data) {
        const client = this.clients.get(userId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    sendToRoom(roomId, data) {
        const userIds = this.rooms.get(roomId);
        if (!userIds) return 0;

        let sentCount = 0;
        for (const userId of userIds) {
            if (this.sendToUser(userId, data)) {
                sentCount++;
            }
        }
        return sentCount;
    }

    // Notification methods
    notifyTransactionUpdate(transaction) {
        const notification = {
            type: 'transaction_update',
            data: {
                id: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                merchant_id: transaction.merchant_id,
                timestamp: new Date().toISOString()
            }
        };

        // Notify merchant members
        this.sendToRoom(`merchant_${transaction.merchant_id}`, notification);
        
        // Notify admins
        this.sendToRoom('admin', notification);
    }

    notifyMerchantRequest(request) {
        const notification = {
            type: 'merchant_request',
            data: {
                id: request.id,
                type: request.type,
                status: request.status,
                user_id: request.user_id,
                merchant_id: request.merchant_id,
                timestamp: new Date().toISOString()
            }
        };

        // Notify user who made the request
        this.sendToUser(request.user_id, notification);
        
        // Notify admins
        this.sendToRoom('admin', notification);
        
        // If it's a join request, notify merchant members
        if (request.merchant_id) {
            this.sendToRoom(`merchant_${request.merchant_id}`, notification);
        }
    }

    notifyNewMerchant(merchant) {
        const notification = {
            type: 'new_merchant',
            data: {
                id: merchant.id,
                name: merchant.name,
                status: merchant.status,
                timestamp: new Date().toISOString()
            }
        };

        // Notify all admins
        this.sendToRoom('admin', notification);
    }

    notifySystemAlert(alert) {
        const notification = {
            type: 'system_alert',
            data: {
                level: alert.level, // info, warning, error
                message: alert.message,
                timestamp: new Date().toISOString()
            }
        };

        // Notify all admins
        this.sendToRoom('admin', notification);
    }

    // Stats methods
    getStats() {
        return {
            connectedClients: this.clients.size,
            activeRooms: this.rooms.size,
            roomDetails: Array.from(this.rooms.entries()).map(([roomId, userIds]) => ({
                roomId,
                userCount: userIds.size
            }))
        };
    }
}

// Singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
