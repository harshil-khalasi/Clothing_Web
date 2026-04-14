import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      phoneNumber,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      // 1. Validate Stock Availability for each item and size
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          res.status(404);
          throw new Error(`Product ${item.name} not found`);
        }

        const sizeEntry = product.sizeStock.find(s => s.size === item.selectedSize);
        if (!sizeEntry) {
          res.status(400);
          throw new Error(`Size ${item.selectedSize} not available for ${item.name}`);
        }

        if (sizeEntry.stock < item.qty) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name} (Size: ${item.selectedSize})`);
        }
      }

      // 2. Create Order
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        phoneNumber,
        totalPrice,
      });

      const createdOrder = await order.save();
      req.io.emit('order:placed', createdOrder);
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      if (req.body.status === 'delivered') {
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      req.io.emit('order:updated', updatedOrder);
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/pay
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const options = {
        amount: Math.round(order.totalPrice * 100),
        currency: 'INR',
        receipt: `receipt_order_${order._id}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.status(200).json(razorpayOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/:id/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'shipped'; // Or stay pending until shipped manually
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'success',
        update_time: Date.now().toString(),
      };
      
      const updatedOrder = await order.save();
      req.io.emit('order:updated', updatedOrder);

      // Decrement stock only after payment is verified
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const sizeEntry = product.sizeStock.find(s => s.size === item.selectedSize);
          if (sizeEntry) {
            sizeEntry.stock -= item.qty;
            await product.save();
          }
        }
      }

      res.status(200).json({ status: 'success', order: updatedOrder });
    } else {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    next(error);
  }
};
