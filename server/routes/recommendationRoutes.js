import express from 'express';
import { getRecommendations, getProjectRecommendations } from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getRecommendations);
router.get('/project/:projectId', protect, getProjectRecommendations);

export default router;
