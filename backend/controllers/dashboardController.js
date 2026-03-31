import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });

    const totalOrders = await Order.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Total units across all products
    const totalUnitsData = await Product.aggregate([
      { $match: { sizeStock: { $exists: true, $type: 'array' } } },
      { $unwind: '$sizeStock' },
      { $group: { _id: null, total: { $sum: '$sizeStock.stock' } } }
    ]);
    const totalStockUnits = totalUnitsData.length > 0 ? totalUnitsData[0].total : 0;

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Category breakdown
    const categoryData = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalStockUnits,
        recentProducts,
        categoryData,
      },
    });
  } catch (error) {
    next(error);
  }
};