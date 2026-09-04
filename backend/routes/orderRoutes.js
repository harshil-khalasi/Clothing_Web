import express from 'express';
import {
  addOrderItems,
  createPosOrder,
  confirmPosStock,
  getOrderById,
  generateOrderPDF,
  getMyOrders,
  getOrders,
  getUserOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/pos').post(protect, admin, createPosOrder);

router.route('/myorders').get(protect, getMyOrders);
router.route('/user/:userId').get(protect, admin, getUserOrders);

router.route('/:id/confirm-pos').post(protect, admin, confirmPosStock);
router.route('/:id/pdf').get(generateOrderPDF);
router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').post(protect, createRazorpayOrder);
router.route('/:id/verify').post(protect, verifyPayment);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;
