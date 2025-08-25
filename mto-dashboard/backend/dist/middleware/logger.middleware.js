"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../config/logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request
    logger_1.logger.http({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger_1.logger.http({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
        });
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.middleware.js.map