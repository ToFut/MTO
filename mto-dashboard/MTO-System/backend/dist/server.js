"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Import configurations
const supabase_1 = require("./config/supabase");
const socket_1 = require("./config/socket");
const logger_1 = require("./config/logger");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const mto_routes_1 = __importDefault(require("./routes/mto.routes"));
const po_routes_1 = __importDefault(require("./routes/po.routes"));
const vocabulary_routes_1 = __importDefault(require("./routes/vocabulary.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const barcode_routes_1 = __importDefault(require("./routes/barcode.routes"));
const defect_routes_1 = __importDefault(require("./routes/defect.routes"));
const shipment_routes_1 = __importDefault(require("./routes/shipment.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const sync_routes_1 = __importDefault(require("./routes/sync.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
// Import controllers and services
const chat_controller_1 = __importDefault(require("./controllers/chat.controller"));
// Import middleware
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '5010', 10);
        this.httpServer = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3010'],
                credentials: true,
            },
        });
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeSocketIO();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // In development, allow all localhost and local network origins
                if (process.env.NODE_ENV === 'development') {
                    if (!origin ||
                        origin.includes('localhost') ||
                        origin.includes('127.0.0.1') ||
                        origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/) || // Local network IPs
                        origin.match(/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/) || // Local network IPs
                        origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/)) { // Local network IPs
                        callback(null, true);
                        return;
                    }
                }
                // In production, use specific allowed origins
                const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
                    'http://localhost:3010',
                    'http://localhost:3000',
                    'http://localhost:5173', // Vite default port
                    'http://127.0.0.1:3010',
                    'http://127.0.0.1:3000',
                    'http://127.0.0.1:5173'
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    logger_1.logger.warn(`CORS blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Compression middleware
        this.app.use((0, compression_1.default)());
        // Logging middleware
        this.app.use((0, morgan_1.default)('combined', { stream: { write: (message) => logger_1.logger.info(message.trim()) } }));
        this.app.use(logger_middleware_1.requestLogger);
        // Rate limiting
        this.app.use('/api/', rateLimit_middleware_1.rateLimiter);
        // Static files
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
    }
    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (_req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV,
            });
        });
        // API version endpoint
        this.app.get('/api', (_req, res) => {
            res.status(200).json({
                name: 'MTO Platform API',
                version: '1.0.0',
                endpoints: {
                    auth: '/api/auth',
                    mtos: '/api/mtos',
                    pos: '/api/pos',
                    vocabulary: '/api/vocabulary',
                    inventory: '/api/inventory',
                    barcodes: '/api/barcodes',
                    defects: '/api/defects',
                    shipments: '/api/shipments',
                    chat: '/api/chat',
                    sync: '/api/sync',
                    analytics: '/api/analytics',
                    assignments: '/api/assignments',
                },
            });
        });
        // Mount routes
        this.app.use('/api/auth', auth_routes_1.default);
        this.app.use('/api/mtos', mto_routes_1.default);
        this.app.use('/api/pos', po_routes_1.default);
        this.app.use('/api/vocabulary', vocabulary_routes_1.default);
        this.app.use('/api/inventory', inventory_routes_1.default);
        this.app.use('/api/barcodes', barcode_routes_1.default);
        this.app.use('/api/defects', defect_routes_1.default);
        this.app.use('/api/shipments', shipment_routes_1.default);
        this.app.use('/api/chat', chat_routes_1.default);
        this.app.use('/api/sync', sync_routes_1.default);
        this.app.use('/api/analytics', analytics_routes_1.default);
        this.app.use('/api/assignments', assignment_routes_1.default);
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString(),
            });
        });
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.errorHandler);
    }
    initializeSocketIO() {
        // Configure socket events
        (0, socket_1.configureSocket)(this.io);
        // Pass socket instance to chat controller for universal chat
        chat_controller_1.default.setSocketIO(this.io);
    }
    async start() {
        try {
            // Connect to Supabase
            await (0, supabase_1.connectSupabase)();
            // Start server
            this.httpServer.listen(this.port, () => {
                logger_1.logger.info(`🚀 Server is running on port ${this.port}`);
                logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
                logger_1.logger.info(`🔗 API URL: http://localhost:${this.port}/api`);
                logger_1.logger.info(`🔌 WebSocket enabled on same port`);
            });
            // Graceful shutdown
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));
        }
        catch (error) {
            logger_1.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    async shutdown() {
        logger_1.logger.info('Shutting down server...');
        // Close Socket.IO connections
        this.io.close();
        // Close HTTP server
        this.httpServer.close(() => {
            logger_1.logger.info('Server shut down successfully');
            process.exit(0);
        });
        // Force close after 10 seconds
        setTimeout(() => {
            logger_1.logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);
    }
}
// Start the server
const server = new Server();
server.start().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map