"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("./models/User");
const handlers_1 = require("./socket/handlers");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.IO setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5174', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json());
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmos';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
// API Routes
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/users', async (_req, res) => {
    try {
        const users = await User_1.User.find({});
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
app.post('/api/users', async (req, res) => {
    try {
        const { userId, username, position, color } = req.body;
        const user = new User_1.User({
            userId,
            username,
            position,
            color,
            lastActive: new Date(),
        });
        await user.save();
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
app.put('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { position } = req.body;
        const user = await User_1.User.findOneAndUpdate({ userId }, { position, lastActive: new Date() }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
app.delete('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await User_1.User.findOneAndDelete({ userId });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
// Setup Socket.IO handlers
(0, handlers_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map