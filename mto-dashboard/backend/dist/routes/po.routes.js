"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Purchase Order routes
router.get('/', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'PO list endpoint' });
});
router.get('/:id', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'PO detail endpoint', id: req.params.id });
});
router.post('/', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'Create PO endpoint' });
});
router.put('/:id', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'Update PO endpoint', id: req.params.id });
});
router.delete('/:id', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'Delete PO endpoint', id: req.params.id });
});
exports.default = router;
//# sourceMappingURL=po.routes.js.map