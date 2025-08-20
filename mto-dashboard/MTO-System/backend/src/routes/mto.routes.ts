import { Router } from 'express';
import mtoController from '../controllers/mto.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import { body, query, param } from 'express-validator';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mto-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
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
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
});

// Validation rules
const createMTOValidation = [
  body('internal_id').optional().isString(),
  body('po_id').isUUID().withMessage('Valid PO ID is required'),
  body('po_line_id').notEmpty().withMessage('PO Line ID is required'),
  body('reference_number').notEmpty().withMessage('Reference number is required'),
  body('display_name').notEmpty().withMessage('Display name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('bag_base_pid').notEmpty().withMessage('Base product ID is required'),
];

const updateMTOValidation = [
  body('display_name').optional().isString(),
  body('quantity').optional().isInt({ min: 1 }),
  body('expected_ship_date').optional().isISO8601(),
  body('actual_ship_date').optional().isISO8601(),
];

// Routes
router.get(
  '/',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('status').optional().isIn(['pending', 'proceed', 'qc', 'shipping', 'shipped']),
    query('productionCategory').optional().isIn(['daily', 'monthly']),
    query('priority').optional().isIn(['urgent', 'high', 'normal', 'low']),
  ],
  mtoController.getMTOs
);

router.get(
  '/statistics',
  authenticate,
  mtoController.getMTOStatistics
);

router.get(
  '/export',
  authenticate,
  mtoController.exportMTOs
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  mtoController.getMTO
);

router.get(
  '/:id/timeline',
  authenticate,
  [param('id').isUUID()],
  mtoController.getMTOTimeline
);

router.post(
  '/',
  authenticate,
  authorize(['admin', 'brand_manager']),
  createMTOValidation,
  mtoController.createMTO
);

router.post(
  '/bulk-upload',
  authenticate,
  authorize(['admin', 'brand_manager']),
  uploadRateLimiter,
  upload.single('file'),
  [body('poId').isUUID().withMessage('Valid PO ID is required')],
  mtoController.bulkUploadMTOs
);

router.put(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  updateMTOValidation,
  mtoController.updateMTO
);

router.patch(
  '/:id/status',
  authenticate,
  [
    param('id').isUUID(),
    body('status').isIn(['pending', 'proceed', 'qc', 'shipping', 'shipped']),
  ],
  mtoController.updateMTOStatus
);

router.patch(
  '/:id/production-stage',
  authenticate,
  authorize(['admin', 'factory_manager', 'production']),
  [
    param('id').isUUID(),
    body('stage').isIn(['receive', 'cutting', 'sewing', 'embroidery', 'qc', 'packing', 'ready']),
  ],
  mtoController.updateProductionStage
);

router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  [param('id').isUUID()],
  mtoController.deleteMTO
);

export default router;