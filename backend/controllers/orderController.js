import Order from '../models/Order.js';
import Product from '../models/Product.js';

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

      // 3. Decrement Stock
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        const sizeEntry = product.sizeStock.find(s => s.size === item.selectedSize);
        sizeEntry.stock -= item.qty;
        await product.save();
      }

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
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};
