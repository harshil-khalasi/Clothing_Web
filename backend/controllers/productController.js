import Product from '../models/Product.js';
import { uploadToS3, deleteFromS3 } from '../utils/S3utils.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WEBP images are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// @desc    Get all products
// @route   GET /api/products
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, stock, brand, sizes, colors, status } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToS3(file.buffer, file.originalname));
        const s3Results = await Promise.all(uploadPromises);
        imageUrls = s3Results.map(res => res.imageUrl);
      } catch (uploadError) {
        return res.status(500).json({ message: uploadError.message });
      }
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      category,
      brand,
      status: status || 'active',
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      image: imageUrls[0] || '', // Use first image as thumbnail
      images: imageUrls,
      stock: parseInt(stock) || 0,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, price, description, category, stock, brand, sizes, colors, status } = req.body;

    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToS3(file.buffer, file.originalname));
        const s3Results = await Promise.all(uploadPromises);
        const newImageUrls = s3Results.map(res => res.imageUrl);
        product.images = [...product.images, ...newImageUrls];
        if (!product.image) product.image = product.images[0];
      } catch (uploadError) {
        return res.status(500).json({ message: uploadError.message });
      }
    }

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (description) product.description = description;
    if (category) product.category = category;
    if (stock) product.stock = parseInt(stock);
    if (brand) product.brand = brand;
    if (status) product.status = status;
    if (sizes) product.sizes = JSON.parse(sizes);
    if (colors) product.colors = JSON.parse(colors);

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Optional: Delete from S3 if you have the key
    // if (product.imageKey) await deleteFromS3(product.imageKey);

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};