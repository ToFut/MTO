import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Date.now() + 900000, // 15 minutes from now
    });
  },
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: 'Too many attempts, please try again later.',
});

export const uploadRateLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Upload limit exceeded. Please try again later.',
});