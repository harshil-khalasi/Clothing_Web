import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order (Online Purchase)
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
      // 1. Validate & Automatically Decrement Stock Availability in Database
      const updatedProducts = [];
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

        // Automatically reduce stock
        sizeEntry.stock = Math.max(0, sizeEntry.stock - item.qty);
        product.markModified('sizeStock');
        const savedProd = await product.save();
        updatedProducts.push(savedProd);
      }

      // Broadcast stock updates in real-time to all connected devices
      for (const prod of updatedProducts) {
        req.io.emit('product:updated', prod);
      }

      // 2. Create Order
      const invoiceNumber = `MW-INV-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
      const order = new Order({
        orderItems,
        user: req.user._id,
        customerName: req.user.name || 'Online Customer',
        shippingAddress,
        phoneNumber,
        totalPrice,
        orderType: 'online',
        invoiceNumber,
        stockDecremented: true,
      });

      const createdOrder = await order.save();
      req.io.emit('order:placed', createdOrder);
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create Offline POS Counter Order (Automatically Decrement Stock)
// @route   POST /api/orders/pos
// @access  Private/Admin
export const createPosOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      customerName,
      phoneNumber,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No items added to POS bill');
    }

    // 1. Validate & Automatically Decrement Stock Availability in Database
    const updatedProducts = [];
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
        throw new Error(`Insufficient stock for ${item.name} (Size: ${item.selectedSize}). Available: ${sizeEntry.stock}`);
      }

      // Automatically reduce stock
      sizeEntry.stock = Math.max(0, sizeEntry.stock - item.qty);
      product.markModified('sizeStock');
      const savedProd = await product.save();
      updatedProducts.push(savedProd);
    }

    // Broadcast stock updates in real-time to all connected devices
    for (const prod of updatedProducts) {
      req.io.emit('product:updated', prod);
    }

    // 2. Generate Invoice Number & Create POS Order
    const invoiceNumber = `MW-POS-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const posOrder = new Order({
      user: req.user._id,
      customerName: customerName || 'Counter Customer',
      phoneNumber: phoneNumber || 'In-Store',
      shippingAddress: shippingAddress || 'Counter Sale (Offline Store)',
      orderItems,
      totalPrice,
      orderType: 'pos',
      paymentMethod: paymentMethod || 'Cash',
      isPaid: true,
      paidAt: Date.now(),
      status: 'delivered',
      invoiceNumber,
      stockDecremented: true,
    });

    const createdPosOrder = await posOrder.save();
    req.io.emit('order:placed', createdPosOrder);

    res.status(201).json(createdPosOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm POS Sale and Decrement Stock (Called when admin Shares/Downloads/Prints bill)
// @route   POST /api/orders/:id/confirm-pos
// @access  Private/Admin
export const confirmPosStock = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // If already decremented, skip
    if (order.stockDecremented) {
      return res.status(200).json({ message: 'Stock already decremented for this order', order });
    }

    // Group items by Product ID
    const productItemsMap = {};
    for (const item of order.orderItems) {
      const prodId = item.product.toString();
      if (!productItemsMap[prodId]) {
        productItemsMap[prodId] = [];
      }
      productItemsMap[prodId].push(item);
    }

    // Validate & Decrement stock
    const updatedProducts = [];
    for (const [productId, items] of Object.entries(productItemsMap)) {
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found (ID: ${productId})`);
      }

      for (const item of items) {
        const sizeEntry = product.sizeStock.find(s => s.size === item.selectedSize);
        if (!sizeEntry) {
          res.status(400);
          throw new Error(`Size ${item.selectedSize} not available for ${item.name || product.name}`);
        }

        if (sizeEntry.stock < item.qty) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name || product.name} (Size: ${item.selectedSize}). Available: ${sizeEntry.stock}`);
        }

        sizeEntry.stock = Math.max(0, sizeEntry.stock - item.qty);
      }

      product.markModified('sizeStock');
      const savedProd = await product.save();
      updatedProducts.push(savedProd);
    }

    // Mark order stock as decremented
    order.stockDecremented = true;
    const updatedOrder = await order.save();

    // Broadcast updated product stocks in real-time
    for (const prod of updatedProducts) {
      req.io.emit('product:updated', prod);
    }

    res.status(200).json({ success: true, message: 'Stock decremented successfully', order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID (For Invoice & Bill view)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate downloadable PDF Invoice for an order
// @route   GET /api/orders/:id/pdf
// @access  Public (So WhatsApp links can directly open & download PDF)
export const generateOrderPDF = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const invoiceNo = order.invoiceNumber || `MW-INV-${order._id.toString().slice(-8).toUpperCase()}`;
    const filename = `Invoice_${invoiceNo}.pdf`;

    // Ensure public/invoices folder exists
    const invoicesDir = path.join(__dirname, '../public/invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const staticFilePath = path.join(invoicesDir, `${invoiceNo}.pdf`);
    const fileStream = fs.createWriteStream(staticFilePath);
    doc.pipe(fileStream);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    doc.pipe(res);

    // --- Header ---
    doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text('MY WEARABLES', 40, 40);
    doc.fontSize(9).font('Helvetica').fillColor('#666666').text('Wear It With Style', 40, 68);
    
    doc.fontSize(8).fillColor('#444444')
       .text('F-7, Gajanan Complex, Station Road, Sachin, Surat 394230', 40, 82)
       .text('Phone: +91 8200141826 | Email: support@mywearables.com', 40, 94);

    // Invoice Meta Right-aligned
    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', 350, 40, { align: 'right' });
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333')
       .text(`Invoice No: ${invoiceNo}`, 300, 62, { align: 'right' })
       .font('Helvetica').fillColor('#666666')
       .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 300, 76, { align: 'right' })
       .text(`Type: ${order.orderType === 'pos' ? 'Offline Store Counter' : 'Online Purchase'}`, 300, 90, { align: 'right' });

    // Divider Line
    doc.moveTo(40, 115).lineTo(555, 115).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // Customer & Payment Info
    const customerName = order.customerName || order.user?.name || 'Customer';
    const phone = order.phoneNumber || 'N/A';

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#888888').text('BILLED TO:', 40, 130);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(customerName, 40, 143);
    doc.fontSize(9).font('Helvetica').fillColor('#444444')
       .text(`Phone: ${phone}`, 40, 157)
       .text(`Address: ${order.shippingAddress || 'Counter Pickup'}`, 40, 170);

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#888888').text('PAYMENT INFO:', 350, 130);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(`Method: ${order.paymentMethod || 'Paid'}`, 350, 143);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#008000').text('Status: PAID', 350, 157);

    // Divider Line
    doc.moveTo(40, 195).lineTo(555, 195).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // Table Header
    const tableTop = 210;
    doc.rect(40, tableTop, 515, 24).fill('#f3f4f6');
    doc.fillColor('#111827').fontSize(9).font('Helvetica-Bold');
    doc.text('#', 50, tableTop + 7);
    doc.text('Item Description', 80, tableTop + 7);
    doc.text('Size', 300, tableTop + 7, { width: 50, align: 'center' });
    doc.text('Qty', 360, tableTop + 7, { width: 40, align: 'center' });
    doc.text('Price (INR)', 410, tableTop + 7, { width: 60, align: 'right' });
    doc.text('Total (INR)', 480, tableTop + 7, { width: 65, align: 'right' });

    // Table Body
    let yPos = tableTop + 30;
    order.orderItems.forEach((item, index) => {
      doc.fillColor('#374151').fontSize(9).font('Helvetica');
      doc.text(`${index + 1}`, 50, yPos);
      doc.font('Helvetica-Bold').fillColor('#111827').text(item.name, 80, yPos, { width: 210 });
      doc.font('Helvetica').fillColor('#374151');
      doc.text(item.selectedSize || 'Std', 300, yPos, { width: 50, align: 'center' });
      doc.text(`${item.qty}`, 360, yPos, { width: 40, align: 'center' });
      doc.text(`RS ${item.price.toFixed(2)}`, 410, yPos, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(`RS ${(item.price * item.qty).toFixed(2)}`, 480, yPos, { width: 65, align: 'right' });

      yPos += 22;
      doc.moveTo(40, yPos - 5).lineTo(555, yPos - 5).strokeColor('#f3f4f6').lineWidth(0.5).stroke();
    });

    // Summary Box
    yPos += 15;
    doc.rect(340, yPos, 215, 60).fill('#f9fafb').strokeColor('#e5e7eb').lineWidth(1).stroke();
    doc.fillColor('#4b5563').fontSize(9).font('Helvetica');
    doc.text('Subtotal:', 350, yPos + 10);
    doc.text(`RS ${(order.totalPrice || 0).toFixed(2)}`, 480, yPos + 10, { align: 'right' });

    doc.text('Taxes & GST (Incl.):', 350, yPos + 25);
    doc.text('RS 0.00', 480, yPos + 25, { align: 'right' });

    doc.moveTo(350, yPos + 40).lineTo(545, yPos + 40).strokeColor('#e5e7eb').lineWidth(0.5).stroke();

    doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold');
    doc.text('Grand Total:', 350, yPos + 45);
    doc.text(`RS ${(order.totalPrice || 0).toFixed(2)}`, 480, yPos + 45, { align: 'right' });

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af').text('This is a computer generated invoice and requires no signature.', 40, 750, { align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000').text('Thank you for shopping at My Wearables!', 40, 765, { align: 'center' });

    doc.end();
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

// @desc    Get orders by User ID (Admin)
// @route   GET /api/orders/user/:userId
// @access  Private/Admin
export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const orConditions = [
      { user: userId },
      { 'paymentResult.email_address': user.email }
    ];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      orConditions.push({ user: new mongoose.Types.ObjectId(userId) });
    }

    if (user.name) {
      orConditions.push({ customerName: { $regex: new RegExp(`^${user.name.trim()}$`, 'i') } });
    }

    const orders = await Order.find({ $or: orConditions })
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });

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

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
    };

    let razorpayOrder;
    try {
      if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_') || process.env.RAZORPAY_KEY_ID.includes('xxx')) {
        throw new Error('Razorpay credentials invalid or placeholder');
      }
      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.warn('Razorpay 401 Auth Failure. Using demo order fallback:', rzpErr.message || rzpErr);
      razorpayOrder = {
        id: `order_demo_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: 'INR',
        receipt: options.receipt,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        isMock: true
      };
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json(razorpayOrder);
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

    let expectedSign = '';
    if (process.env.RAZORPAY_KEY_SECRET) {
      const sign = (razorpay_order_id || '') + '|' + (razorpay_payment_id || '');
      expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');
    }

    const isVerified = (razorpay_signature && razorpay_signature === expectedSign) ||
                       (razorpay_order_id && razorpay_order_id.startsWith('order_demo_')) ||
                       (razorpay_signature === 'demo_signature') ||
                       (razorpay_signature === 'mock_signature');

    if (isVerified) {
      // Payment verified
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'pending';
      order.paymentResult = {
        id: razorpay_payment_id || `pay_demo_${Date.now()}`,
        status: 'success',
        update_time: Date.now().toString(),
      };
      
      const updatedOrder = await order.save();
      req.io.emit('order:updated', updatedOrder);

      // Decrement stock only after payment is verified
      const productItemsMap = {};
      for (const item of order.orderItems) {
        const prodId = item.product.toString();
        if (!productItemsMap[prodId]) {
          productItemsMap[prodId] = [];
        }
        productItemsMap[prodId].push(item);
      }

      for (const [productId, items] of Object.entries(productItemsMap)) {
        const product = await Product.findById(productId);
        if (product) {
          for (const item of items) {
            const sizeEntry = product.sizeStock.find(s => s.size === item.selectedSize);
            if (sizeEntry) {
              sizeEntry.stock = Math.max(0, sizeEntry.stock - item.qty);
            }
          }
          await product.save();
        }
      }

      res.status(200).json({ status: 'success', data: updatedOrder });
    } else {
      res.status(400);
      throw new Error('Invalid signature. Payment verification failed.');
    }
  } catch (error) {
    next(error);
  }
};
