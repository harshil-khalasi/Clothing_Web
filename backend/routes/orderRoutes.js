import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id/pay').post(protect, createRazorpayOrder);
router.route('/:id/verify').post(protect, verifyPayment);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
