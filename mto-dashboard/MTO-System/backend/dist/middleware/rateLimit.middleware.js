"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRateLimiter = exports.strictRateLimiter = exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: Date.now() + 900000, // 15 minutes from now
        });
    },
});
exports.strictRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60000, // 1 minute
    max: 5, // limit each IP to 5 requests per minute
    message: 'Too many attempts, please try again later.',
});
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 3600000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: 'Upload limit exceeded. Please try again later.',
});
//# sourceMappingURL=rateLimit.middleware.js.map