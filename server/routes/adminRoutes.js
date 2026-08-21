import express from 'express';
import { getAdminStats, getRegisteredStudents } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/students', getRegisteredStudents);

export default router;
