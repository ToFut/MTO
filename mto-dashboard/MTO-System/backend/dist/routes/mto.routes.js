"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mto_controller_1 = __importDefault(require("../controllers/mto.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'mto-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only Excel files are allowed.'));
        }
    },
});
// Validation rules
const createMTOValidation = [
    (0, express_validator_1.body)('internal_id').optional().isString(),
    (0, express_validator_1.body)('po_id').isUUID().withMessage('Valid PO ID is required'),
    (0, express_validator_1.body)('po_line_id').notEmpty().withMessage('PO Line ID is required'),
    (0, express_validator_1.body)('reference_number').notEmpty().withMessage('Reference number is required'),
    (0, express_validator_1.body)('display_name').notEmpty().withMessage('Display name is required'),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('bag_base_pid').notEmpty().withMessage('Base product ID is required'),
];
const updateMTOValidation = [
    (0, express_validator_1.body)('display_name').optional().isString(),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('expected_ship_date').optional().isISO8601(),
    (0, express_validator_1.body)('actual_ship_date').optional().isISO8601(),
];
// Routes
router.get('/', auth_middleware_1.authenticate, [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('offset').optional().isInt({ min: 0 }),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'proceed', 'qc', 'shipping', 'shipped']),
    (0, express_validator_1.query)('productionCategory').optional().isIn(['daily', 'monthly']),
    (0, express_validator_1.query)('priority').optional().isIn(['urgent', 'high', 'normal', 'low']),
], mto_controller_1.default.getMTOs);
router.get('/statistics', auth_middleware_1.authenticate, mto_controller_1.default.getMTOStatistics);
router.get('/export', auth_middleware_1.authenticate, mto_controller_1.default.exportMTOs);
router.get('/:id', auth_middleware_1.authenticate, [(0, express_validator_1.param)('id').isUUID()], mto_controller_1.default.getMTO);
router.get('/:id/timeline', auth_middleware_1.authenticate, [(0, express_validator_1.param)('id').isUUID()], mto_controller_1.default.getMTOTimeline);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'brand_manager']), createMTOValidation, mto_controller_1.default.createMTO);
router.post('/bulk-upload', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'brand_manager']), rateLimit_middleware_1.uploadRateLimiter, upload.single('file'), [(0, express_validator_1.body)('poId').isUUID().withMessage('Valid PO ID is required')], mto_controller_1.default.bulkUploadMTOs);
router.put('/:id', auth_middleware_1.authenticate, [(0, express_validator_1.param)('id').isUUID()], updateMTOValidation, mto_controller_1.default.updateMTO);
router.patch('/:id/status', auth_middleware_1.authenticate, [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('status').isIn(['pending', 'proceed', 'qc', 'shipping', 'shipped']),
], mto_controller_1.default.updateMTOStatus);
router.patch('/:id/production-stage', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'factory_manager', 'production']), [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('stage').isIn(['receive', 'cutting', 'sewing', 'embroidery', 'qc', 'packing', 'ready']),
], mto_controller_1.default.updateProductionStage);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), [(0, express_validator_1.param)('id').isUUID()], mto_controller_1.default.deleteMTO);
exports.default = router;
//# sourceMappingURL=mto.routes.js.map