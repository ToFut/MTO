"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, (req, res) => {
    res.json({ message: 'chat endpoint' });
});
exports.default = router;
//# sourceMappingURL=chat.routes.js.map