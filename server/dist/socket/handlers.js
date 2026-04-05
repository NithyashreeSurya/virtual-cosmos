"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const User_1 = require("../models/User");
// Map of userId to ConnectedUser (primary connection)
const connectedUsers = new Map();
// Map of socketId to userId for quick lookup
const socketToUserMap = new Map();
const PROXIMITY_RADIUS = 150;
// Generate a color based on userId
function generateColor(userId) {
    const colors = ['#00d4ff', '#ff6b9d', '#00ff88', '#ffaa00', '#aa88ff', '#ff5588', '#88ff00', '#00aaff'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
// Calculate distance between two points
function calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
}
// Check and update proximity connections
function updateProximityConnections(io, userId) {
    const user = connectedUsers.get(userId);
    if (!user)
        return;
    const currentConnections = new Set();
    // Check distance to all other users
    connectedUsers.forEach((otherUser, otherUserId) => {
        if (otherUserId === userId)
            return;
        const distance = calculateDistance(user.position, otherUser.position);
        if (distance <= PROXIMITY_RADIUS) {
            currentConnections.add(otherUserId);
        }
    });
    // Find new connections
    currentConnections.forEach((connectedUserId) => {
        if (!user.connectedUsers.has(connectedUserId)) {
            // New connection
            user.connectedUsers.add(connectedUserId);
            const otherUser = connectedUsers.get(connectedUserId);
            if (otherUser) {
                otherUser.connectedUsers.add(userId);
                // Notify both users
                io.to(user.socketId).emit('proximity:connected', {
                    userId: connectedUserId,
                    username: otherUser.username,
                });
                io.to(otherUser.socketId).emit('proximity:connected', {
                    userId: userId,
                    username: user.username,
                });
            }
        }
    });
    // Find disconnected connections
    user.connectedUsers.forEach((connectedUserId) => {
        if (!currentConnections.has(connectedUserId)) {
            // Lost connection
            user.connectedUsers.delete(connectedUserId);
            const otherUser = connectedUsers.get(connectedUserId);
            if (otherUser) {
                otherUser.connectedUsers.delete(userId);
                // Notify both users
                io.to(user.socketId).emit('proximity:disconnected', {
                    userId: connectedUserId,
                    username: otherUser.username,
                });
                io.to(otherUser.socketId).emit('proximity:disconnected', {
                    userId: userId,
                    username: user.username,
                });
            }
        }
    });
}
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Handle user joining
        socket.on('user:join', async (data) => {
            const { userId, username, position } = data;
            // Track socket to user mapping
            socketToUserMap.set(socket.id, userId);
            socket.data.userId = userId;
            // Check if this user is already connected from another tab
            const existingUser = connectedUsers.get(userId);
            const isReconnect = !!existingUser;
            // Try to find existing user in MongoDB
            let user = await User_1.User.findOne({ userId });
            if (!user) {
                // Create new user with the position from the join request
                user = new User_1.User({
                    userId,
                    username,
                    position,
                    color: generateColor(userId),
                    lastActive: new Date(),
                });
                await user.save();
            }
            else {
                // Update position and lastActive for existing user
                user.username = username; // Update username in case it changed
                user.position = position;
                user.lastActive = new Date();
                await user.save();
            }
            // Store connected user (update existing or create new)
            // For new users, use the position from the join request (not from MongoDB)
            // For reconnecting users, keep their existing position
            let storePosition = position;
            let connectedUserSet = new Set();
            if (isReconnect && existingUser) {
                storePosition = existingUser.position;
                connectedUserSet = existingUser.connectedUsers;
            }
            const connectedUser = {
                socketId: socket.id, // Keep the latest socket connection
                userId,
                username: user.username,
                position: storePosition,
                color: user.color,
                connectedUsers: connectedUserSet, // Keep connections on reconnect
            };
            connectedUsers.set(userId, connectedUser);
            // Join socket room
            socket.join(userId);
            // Send current users to the new user (exclude self from the list)
            const allUsers = Array.from(connectedUsers.values())
                .filter((u) => u.userId !== userId)
                .map((u) => ({
                userId: u.userId,
                username: u.username,
                position: u.position,
                color: u.color,
            }));
            socket.emit('users:list', allUsers);
            // Only notify other users if this is a NEW user (not a reconnect from another tab)
            if (!isReconnect) {
                // Notify other users with the position from the join request
                socket.broadcast.emit('user:joined', {
                    userId,
                    username: user.username,
                    position: storePosition,
                    color: user.color,
                });
            }
            else {
                // For reconnects, just notify the reconnecting socket about other users
                // (other users already know about this user from previous join)
                console.log(`User reconnected: ${username} (${userId}) from another tab`);
            }
            // Update proximity connections for the new user
            updateProximityConnections(io, userId);
            // Also update proximity for all other users
            connectedUsers.forEach((_, otherUserId) => {
                if (otherUserId !== userId) {
                    updateProximityConnections(io, otherUserId);
                }
            });
            console.log(`User joined: ${username} (${userId})`);
        });
        // Handle user movement
        socket.on('user:move', async (data) => {
            const { userId, position } = data;
            const user = connectedUsers.get(userId);
            if (!user)
                return;
            user.position = position;
            // Update in MongoDB
            await User_1.User.findOneAndUpdate({ userId }, { position, lastActive: new Date() });
            // Broadcast to other users
            socket.broadcast.emit('user:moved', {
                userId,
                position,
            });
            // Update proximity connections
            updateProximityConnections(io, userId);
        });
        // Handle chat messages
        socket.on('chat:message', (data) => {
            const { fromUserId, toUserId, message } = data;
            const fromUser = connectedUsers.get(fromUserId);
            const toUser = connectedUsers.get(toUserId);
            if (!fromUser || !toUser)
                return;
            // Check if users are within proximity
            const distance = calculateDistance(fromUser.position, toUser.position);
            if (distance > PROXIMITY_RADIUS)
                return;
            // Send message to both users
            io.to(toUser.socketId).emit('chat:message', {
                fromUserId,
                fromUsername: fromUser.username,
                message,
                timestamp: new Date().toISOString(),
            });
            io.to(fromUser.socketId).emit('chat:message', {
                fromUserId,
                fromUsername: fromUser.username,
                message,
                timestamp: new Date().toISOString(),
            });
        });
        // Handle disconnection
        socket.on('disconnect', async () => {
            const userId = socketToUserMap.get(socket.id) || socket.data.userId;
            if (!userId)
                return;
            // Remove from socket lookup
            socketToUserMap.delete(socket.id);
            const user = connectedUsers.get(userId);
            if (!user)
                return;
            // Check if there are other connections from this userId
            let hasOtherConnection = false;
            socketToUserMap.forEach((uid) => {
                if (uid === userId)
                    hasOtherConnection = true;
            });
            // Only fully disconnect if no other connections exist
            if (hasOtherConnection) {
                // Just update the socketId to another connection if available
                for (const [sid, uid] of socketToUserMap) {
                    if (uid === userId) {
                        user.socketId = sid;
                        break;
                    }
                }
                return;
            }
            // Notify connected users about disconnection
            user.connectedUsers.forEach((connectedUserId) => {
                const otherUser = connectedUsers.get(connectedUserId);
                if (otherUser) {
                    otherUser.connectedUsers.delete(userId);
                    io.to(otherUser.socketId).emit('proximity:disconnected', {
                        userId,
                        username: user.username,
                    });
                }
            });
            // Remove from connected users
            connectedUsers.delete(userId);
            // Delete from MongoDB
            await User_1.User.findOneAndDelete({ userId });
            // Notify other users
            socket.broadcast.emit('user:left', { userId });
            console.log(`User disconnected: ${user.username} (${userId})`);
        });
    });
}
//# sourceMappingURL=handlers.js.map