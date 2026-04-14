import User from "../models/User.js";

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user.cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Sync cart with database
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.cart = cartItems.map((item) => ({
        product: item.product._id || item._id,
        qty: item.qty,
        selectedSize: item.selectedSize,
      }));
      await user.save();
      const updatedUser = await User.findById(req.user._id).populate("cart.product");
      res.json(updatedUser.cart);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty, selectedSize } = req.body;
    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId && item.selectedSize === selectedSize
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].qty += qty;
    } else {
      user.cart.push({ product: productId, qty, selectedSize });
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { selectedSize } = req.query;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => !(item.product.toString() === productId && item.selectedSize === selectedSize)
    );

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
