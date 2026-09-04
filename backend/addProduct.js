import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const addSampleProduct = async () => {
  try {
    const mongoUrl = process.env.LOCAL_DB === 'true'
      ? process.env.MONGO_URL_LOCAL
      : process.env.MONGO_URL;

    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const newProduct = new Product({
      name: 'Monochrome Premium Oversized Hoodie',
      price: 1499,
      description: 'Ultra-soft heavy cotton blend hoodie with sleek minimalist monochrome finish. Perfect for daily casual wear.',
      category: 'Men',
      subcategory: 'Hoodies',
      brand: 'My Wearables',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
      ],
      sizeStock: [
        { size: 'S', stock: 15 },
        { size: 'M', stock: 25 },
        { size: 'L', stock: 20 },
        { size: 'XL', stock: 10 }
      ],
      colors: ['Black', 'White'],
      status: 'active',
      isActive: true,
    });

    const saved = await newProduct.save();
    console.log('✅ New Product Added Successfully!');
    console.log(`Product ID: ${saved._id}`);
    console.log(`Name: ${saved.name}`);
    console.log(`Category: ${saved.category}`);
    console.log(`Price: ₹${saved.price}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding product:', error);
    process.exit(1);
  }
};

addSampleProduct();
