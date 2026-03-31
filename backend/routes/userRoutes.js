import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
} from '../controllers/authController.js';
import {
  getUsers,
  deleteUser,
  getUserById,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById);

export default router;