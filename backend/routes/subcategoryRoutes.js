import express from 'express';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSubcategories)
  .post(protect, admin, createSubcategory);

router.route('/:id')
  .put(protect, admin, updateSubcategory)
  .delete(protect, admin, deleteSubcategory);

export default router;
