import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';

// Load environment variables
dotenv.config();

// Import configurations
import { connectSupabase } from './config/supabase';
import { configureSocket } from './config/socket';
import { logger } from './config/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import mtoRoutes from './routes/mto.routes';
import poRoutes from './routes/po.routes';
import vocabularyRoutes from './routes/vocabulary.routes';
import inventoryRoutes from './routes/inventory.routes';
import barcodeRoutes from './routes/barcode.routes';
import defectRoutes from './routes/defect.routes';
import shipmentRoutes from './routes/shipment.routes';
import chatRoutes from './routes/chat.routes';
import syncRoutes from './routes/sync.routes';
import analyticsRoutes from './routes/analytics.routes';
import assignmentRoutes from './routes/assignment.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';

// Import controllers and services
import chatController from './controllers/chat.controller';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { requestLogger } from './middleware/logger.middleware';

class Server {
  private app: Application;
  private port: number;
  private httpServer: any;
  private io: SocketIOServer;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5010', 10);
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
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

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
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
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Compression middleware
    this.app.use(compression());
    
    // Logging middleware
    this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    this.app.use(requestLogger);
    
    // Rate limiting
    this.app.use('/api/', rateLimiter);
    
    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    });

    // API version endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
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
          users: '/api/users',
          companies: '/api/companies',
        },
      });
    });

    // Mount routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/mtos', mtoRoutes);
    this.app.use('/api/pos', poRoutes);
    this.app.use('/api/vocabulary', vocabularyRoutes);
    this.app.use('/api/inventory', inventoryRoutes);
    this.app.use('/api/barcodes', barcodeRoutes);
    this.app.use('/api/defects', defectRoutes);
    this.app.use('/api/shipments', shipmentRoutes);
    this.app.use('/api/chat', chatRoutes);
    this.app.use('/api/sync', syncRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/assignments', assignmentRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/companies', companyRoutes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    // Configure socket events
    configureSocket(this.io);
    
    // Pass socket instance to chat controller for universal chat
    chatController.setSocketIO(this.io);
  }

  public async start(): Promise<void> {
    try {
      // Connect to Supabase
      await connectSupabase();
      
      // Start server
      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 Server is running on port ${this.port}`);
        logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🔗 API URL: http://localhost:${this.port}/api`);
        logger.info(`🔌 WebSocket enabled on same port`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.shutdown.bind(this));
      process.on('SIGINT', this.shutdown.bind(this));
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    
    // Close Socket.IO connections
    this.io.close();
    
    // Close HTTP server
    this.httpServer.close(() => {
      logger.info('Server shut down successfully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});