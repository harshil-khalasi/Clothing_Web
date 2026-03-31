import React, { useState } from 'react';
import { 
  Upload, CheckCircle, AlertCircle, Loader, X, Plus, PlusCircle, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Trash2, Check
} from 'lucide-react';
import { createProduct } from '../services/api';

const DEFAULT_CATEGORIES = [
  'Jeans', 'T-Shirts', 'Shirts', 'Formal', 'Track Pants',
  'Sport Wear', 'Shoes', 'Watch', 'Drop Shoulder T-Shirts', 'Color T-Shirts',
];

const SIZE_OPTIONS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36', '38'],
  shoes: ['6', '7', '8', '9', '10', '11'],
  none: [],
};

const getSizeType = (category) => {
  if (!category) return 'clothing';
  const cat = category.toLowerCase();
  if (cat.includes('shoe') || cat.includes('sneaker') || cat.includes('footwear')) return 'shoes';
  if (cat.includes('jeans') || cat.includes('pant') || cat.includes('trouser') || cat.includes('track')) return 'pants';
  if (cat.includes('watch') || cat.includes('belt') || cat.includes('accessory')) return 'none';
  return 'clothing';
};

const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Pink', 'Purple', 'Orange', 'Grey', 'Brown', 'Navy',
];

const categoryTypeMap = {};

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    description: '',
    stock: '',
    status: 'active',
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');
  const [newCategorySizeType, setNewCategorySizeType] = useState('clothing');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showRemoveCategory, setShowRemoveCategory] = useState(false);

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColor, setCustomColor] = useState('');
  const [colorOptions, setColorOptions] = useState(COLOR_OPTIONS);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category') setSelectedSizes([]);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      setErrorMessage('Category name cannot be empty');
      return;
    }
    if (categories.includes(trimmed)) {
      setErrorMessage('This category already exists');
      return;
    }
    categoryTypeMap[trimmed] = newCategorySizeType;
    setCategories(prev => [...prev, trimmed]);
    setFormData(prev => ({ ...prev, category: trimmed }));
    setSelectedSizes([]);
    setNewCategory('');
    setNewCategorySizeType('clothing');
    setShowAddCategory(false);
    setErrorMessage('');
  };

  const handleRemoveCategory = (cat) => {
    if (DEFAULT_CATEGORIES.includes(cat)) return;
    setCategories(prev => prev.filter(c => c !== cat));
    if (formData.category === cat) {
      setFormData(prev => ({ ...prev, category: '' }));
      setSelectedSizes([]);
    }
    delete categoryTypeMap[cat];
  };

  const getEffectiveSizeType = (category) => {
    if (categoryTypeMap[category]) return categoryTypeMap[category];
    return getSizeType(category);
  };

  const sizeType = getEffectiveSizeType(formData.category);
  const sizesToShow = SIZE_OPTIONS[sizeType] || [];

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleAddCustomColor = () => {
    const trimmed = customColor.trim();
    if (!trimmed) {
      setErrorMessage('Color name cannot be empty');
      return;
    }
    if (colorOptions.includes(trimmed)) {
      setErrorMessage('This color already exists');
      return;
    }
    setColorOptions(prev => [...prev, trimmed]);
    setSelectedColors(prev => [...prev, trimmed]);
    setCustomColor('');
    setErrorMessage('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer?.files || []);
    processFiles(files);
  };

  const processFiles = (files) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validFiles = [];
    const validUrls = [];
    const errors = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only PNG, JPG, and WEBP images are allowed`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 5MB`);
        continue;
      }
      validFiles.push(file);
      validUrls.push(URL.createObjectURL(file));
    }

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...validUrls]);
      setErrorMessage('');
    }
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (currentImageIndex >= updated.length && updated.length > 0) {
        setCurrentImageIndex(updated.length - 1);
      } else if (updated.length === 0) {
        setCurrentImageIndex(0);
      }
      return updated;
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || price < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    const stock = parseInt(formData.stock);
    if (!formData.stock) {
      newErrors.stock = 'Stock count is required';
    } else if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock must be a valid non-negative integer';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required';
    }

    if (selectedFiles.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('brand', formData.brand.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('stock', parseInt(formData.stock));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('sizes', JSON.stringify(selectedSizes));
      formDataToSend.append('colors', JSON.stringify(selectedColors));
      
      for (const file of selectedFiles) {
        formDataToSend.append('images', file);
      }

      const response = await createProduct(formDataToSend);
      
      if (response.success) {
        setIsSuccess(true);
        
        setFormData({
          name: '',
          price: '',
          brand: '',
          category: '',
          description: '',
          stock: '',
          status: 'active',
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setCurrentImageIndex(0);
        setErrors({});

        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add product. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Add New Product</h1>
              <p className="text-sm text-gray-500 mt-1">Create a premium listing for your collection</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-pink-600 uppercase">Ready to Publish</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {isSuccess && (
          <div className="animate-in slide-in-from-top-2 duration-500 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-green-100/50">
            <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-green-900 text-lg">Success!</h3>
              <p className="text-sm text-green-700 mt-1">Your product has been published successfully. 🎉</p>
            </div>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="animate-in slide-in-from-top-2 duration-500 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-red-100/50">
            <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-red-900 text-lg">Error</h3>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">

            {/* Section: Basic Information */}
            <Section title="📦 Basic Information" subtitle="Product name, price, and key details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  label="Product Name"
                  name="name"
                  type="text"
                  placeholder="e.g. Premium Denim Jacket"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                
                <FormField
                  label="Price (₹)"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                  required
                />

                <FormField
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  placeholder="Units available"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  error={errors.stock}
                  required
                />

                <FormField
                  label="Brand Name"
                  name="brand"
                  type="text"
                  placeholder="e.g. US POLO"
                  value={formData.brand}
                  onChange={handleChange}
                />

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-3">
                    Product Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all hover:border-gray-300"
                  >
                    <option value="active">🟢 Active Listing</option>
                    <option value="inactive">⚪ Draft / Hidden</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Section: Category & Sizes */}
            <Section title="🏷️ Classification & Sizing" subtitle="Category and size variants">
              <div className="space-y-8">
                {/* Category Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategory(!showAddCategory);
                          setShowRemoveCategory(false);
                        }}
                        className="text-xs font-bold uppercase tracking-tight text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRemoveCategory(!showRemoveCategory);
                          setShowAddCategory(false);
                        }}
                        className="text-xs font-bold uppercase tracking-tight text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${
                      errors.category
                        ? 'border-red-300 ring-2 ring-red-100 focus:ring-red-500 focus:border-red-500 text-red-600'
                        : 'border-gray-200 text-gray-900 focus:ring-pink-500 focus:border-pink-500 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.category}
                    </p>
                  )}

                  {/* Add Category Panel */}
                  {showAddCategory && (
                    <div className="mt-4 p-6 bg-pink-50 rounded-2xl border-2 border-dashed border-pink-200 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-pink-700 uppercase tracking-wider">New Category Name</label>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="e.g. Streetwear"
                          className="w-full px-4 py-3.5 bg-white border border-pink-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all placeholder:text-gray-400"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-black text-pink-700 uppercase tracking-wider">Size Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'clothing', label: '👕 Clothing' },
                            { value: 'pants', label: '👖 Pants' },
                            { value: 'shoes', label: '👟 Shoes' },
                            { value: 'none', label: '❌ None' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setNewCategorySizeType(opt.value)}
                              className={`px-4 py-2.5 rounded-lg border-2 text-xs font-bold uppercase transition-all ${
                                newCategorySizeType === opt.value
                                  ? 'border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-200'
                                  : 'border-pink-100 bg-white text-pink-600 hover:border-pink-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="flex-1 bg-pink-600 text-white rounded-lg py-3 font-bold uppercase tracking-wider text-xs hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 active:scale-95"
                        >
                          Add Category
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCategory(false)}
                          className="px-6 bg-white text-gray-500 rounded-lg py-3 font-bold uppercase tracking-wider text-xs border border-pink-100 hover:bg-pink-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Remove Category Panel */}
                  {showRemoveCategory && (
                    <div className="mt-4 p-6 bg-red-50 rounded-2xl border-2 border-dashed border-red-200 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-4">Delete Custom Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).length === 0 ? (
                          <p className="text-xs font-medium text-red-400 italic py-4">No custom categories to delete</p>
                        ) : (
                          categories.filter(c => !DEFAULT_CATEGORIES.includes(c)).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleRemoveCategory(cat)}
                              className="bg-white border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-bold text-gray-700 hover:border-red-400 hover:bg-red-50 transition-all group"
                            >
                              {cat}
                              <X size={14} className="text-red-300 group-hover:text-red-500" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizes Grid */}
                {formData.category && sizeType !== 'none' && sizesToShow.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider">Available Sizes</label>
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                        {selectedSizes.length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {sizesToShow.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`py-3 px-2 rounded-lg border-2 font-bold text-sm transition-all duration-300 flex items-center justify-center ${
                            selectedSizes.includes(size)
                              ? 'border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-200'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Section: Colors */}
            <Section title="🎨 Color Variants" subtitle="Available color options">
              <div className="space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={`h-12 flex items-center justify-center rounded-lg border-2 font-bold text-xs uppercase transition-all duration-300 ${
                        selectedColors.includes(color)
                          ? 'border-pink-600 bg-pink-600 text-white shadow-lg shadow-pink-200'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="Add custom color..."
                    className="flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomColor())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    className="px-6 bg-pink-50 text-pink-600 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-95 border border-pink-200"
                  >
                    Add
                  </button>
                </div>

                {selectedColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    {selectedColors.map(c => (
                      <span
                        key={c}
                        className="text-xs font-bold uppercase tracking-wide bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-pink-200"
                      >
                        <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* Section: Description */}
            <Section title="📝 Product Description" subtitle="Tell the story of your product">
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-600 uppercase tracking-wider">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows="6"
                  placeholder="Describe fabric, fit, design details, care instructions, etc..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 bg-white border rounded-xl font-medium text-gray-900 resize-none focus:outline-none focus:ring-2 transition-all leading-relaxed placeholder:text-gray-400 ${
                    errors.description
                      ? 'border-red-300 ring-2 ring-red-100 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-200 focus:ring-pink-500 focus:border-pink-500 hover:border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 font-medium ml-auto">{formData.description.length} characters</p>
                </div>
              </div>
            </Section>
          </div>

          {/* Right Column - Image Upload */}
          <div className="h-fit lg:sticky lg:top-32 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Product Images</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                    <span className="text-red-500 font-bold">*</span> At least 1 image required
                  </p>
                </div>

                {/* Image Preview */}
                {previewUrls.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Preview */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200 group shadow-md hover:shadow-lg transition-shadow">
                      <img
                        src={previewUrls[currentImageIndex]}
                        alt={`Preview ${currentImageIndex + 1}`}
                        className="w-full h-full object-contain p-2"
                      />

                      {/* Navigation Buttons */}
                      {previewUrls.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCurrentImageIndex(i => (i - 1 + previewUrls.length) % previewUrls.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentImageIndex(i => (i + 1) % previewUrls.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(currentImageIndex)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Counter */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                        {currentImageIndex + 1} / {previewUrls.length}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {previewUrls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {previewUrls.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex
                                ? 'border-pink-600 ring-2 ring-pink-100 shadow-md'
                                : 'border-gray-200 opacity-50 hover:opacity-100 hover:border-pink-300'
                            }`}
                          >
                            <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-1 bg-white" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-md">
                      <ImageIcon size={28} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm uppercase tracking-wide">No Images</p>
                      <p className="text-gray-400 text-xs font-medium mt-1 italic">Upload product photos</p>
                    </div>
                  </div>
                )}

                {errors.images && (
                  <p className="text-xs font-bold text-red-500 text-center flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> {errors.images}
                  </p>
                )}

                {/* Upload Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDragDrop}
                  className="relative group h-28 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-pink-50 hover:border-pink-400 transition-all cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-input"
                    multiple
                  />
                  <label htmlFor="image-input" className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <Upload className="text-pink-600 group-hover:-translate-y-1 transition-transform" size={24} />
                    <p className="text-xs font-bold text-pink-600 uppercase tracking-wider text-center px-4">
                      Add Images
                      <br />
                      <span className="text-gray-400 lowercase font-medium tracking-normal italic">jpg, png, webp (max 5MB)</span>
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 disabled:from-gray-300 disabled:to-gray-300 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-pink-200 hover:shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    Publish Product
                  </>
                )}
              </button>
              <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Fields with <span className="text-red-500">*</span> are required
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

/**
 * FormField Component - Reusable input field
 */
const FormField = ({ label, name, type = 'text', placeholder, value, onChange, error, required, ...props }) => (
  <div className="space-y-3">
    <label className="block text-xs font-black text-gray-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3.5 bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 ${
        error
          ? 'border-red-300 ring-2 ring-red-100 text-red-600 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-200 text-gray-900 focus:ring-pink-500 focus:border-pink-500 hover:border-gray-300'
      }`}
      {...props}
    />
    {error && (
      <p className="text-xs font-bold text-red-500 flex items-center gap-1">
        <AlertCircle size={14} /> {error}
      </p>
    )}
  </div>
);

/**
 * Section Component - Reusable section container
 */
const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 transition-all">
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-2 border-l-4 border-pink-600 pl-6">
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  </div>
);

export default AddProduct;