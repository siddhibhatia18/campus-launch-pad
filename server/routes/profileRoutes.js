import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadPicture,
  removePicture,
  getStudents,
  getStudentById,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router
  .route('/picture')
  .post(protect, uploadProfileImage.single('image'), uploadPicture)
  .delete(protect, removePicture);

router.route('/students').get(protect, getStudents);
router.route('/students/:id').get(protect, getStudentById);

export default router;

