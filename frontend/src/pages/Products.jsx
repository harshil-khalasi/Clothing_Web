import React, { useState, useEffect } from 'react';
import {
  Search,
  Edit3,
  Trash2,
  Package,
  Loader2,
  X,
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getAllProducts, updateProduct, deleteProduct, getAllSubcategories } from '../services/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_OPTIONS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36', '38'],
  shoes: ['6', '7', '8', '9', '10', '11'],
  none: [],
};

const COLOR_OPTIONS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Pink', 'Purple', 'Orange', 'Grey', 'Brown', 'Navy',
];

const getSizeType = (category) => {
  if (!category) return 'clothing';
  const cat = category.toLowerCase();
  if (cat.includes('shoe') || cat.includes('sneaker') || cat.includes('footwear')) return 'shoes';
  if (cat.includes('jeans') || cat.includes('pant') || cat.includes('trouser') || cat.includes('track')) return 'pants';
  if (cat.includes('watch') || cat.includes('belt') || cat.includes('accessory')) return 'none';
  return 'clothing';
};

// ─── Shared number input props to block scroll & arrow key changes ────────────
const noScrollNumberProps = {
  onWheel: (e) => e.target.blur(),
  onKeyDown: (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      const uniqueSubcats = ['All', ...new Set(data.map(p => p.subcategory || p.category))];
      setCategories(uniqueSubcats);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('product:created', (newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`New Product: ${newProduct.name}`, { icon: '📦' });
    });

    socket.on('product:updated', (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      toast.success(`Updated: ${updatedProduct.name}`, { icon: '📝' });
    });

    socket.on('product:deleted', (deletedId) => {
      setProducts((prev) => prev.filter((p) => p._id !== deletedId));
      toast.error(`Product Deleted`, { icon: '🗑️' });
    });

    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
    };
  }, [socket]);

  const handleDelete = async (id) => {
    if (window.confirm('Permanent Action: Remove this item from the collection?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.subcategory === categoryFilter || (!p.subcategory && p.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="text-gray-500 font-medium italic">Manage all your products in one place</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all shadow-sm text-sm font-bold text-gray-900"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-100 rounded-2xl py-4 px-8 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all shadow-sm font-bold text-gray-900 text-sm cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat} Collection</option>)}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
        {loading
          ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : filteredProducts.length > 0
            ? filteredProducts.map(product => (
              <AdminProductCard
                key={product._id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDelete(product._id)}
              />
            ))
            : (
              <div className="col-span-full py-24 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-[32px] shadow-lg flex items-center justify-center text-gray-200">
                  <Package size={48} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Products Found</h3>
                </div>
              </div>
            )
        }
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); fetchProducts(); }}
        />
      )}
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditProductModal = ({ product, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    price: product.price || '',
    brand: product.brand || '',
    category: product.category || 'Men',
    subcategory: product.subcategory || '',
    description: product.description || '',
    status: product.status || 'active',
  });

  const [sizeStock, setSizeStock] = useState(product.sizeStock || []);

  const [existingImages, setExistingImages] = useState(
    Array.isArray(product.images) ? product.images : product.image ? [product.image] : []
  );
  const [removedExisting, setRemovedExisting] = useState(new Set());
  const [newFiles, setNewFiles] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [selectedColors, setSelectedColors] = useState(product.colors || []);
  const [customColor, setCustomColor] = useState('');
  const [colorOptions, setColorOptions] = useState(COLOR_OPTIONS);

  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    getAllSubcategories().then(data => setSubcategories(data)).catch(console.error);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({});

  const activeExisting = existingImages.filter(url => !removedExisting.has(url));
  const allPreviews = [
    ...activeExisting.map(url => ({ type: 'existing', src: url })),
    ...newFiles.map(f => ({ type: 'new', src: f.previewUrl, file: f.file })),
  ];

  useEffect(() => {
    if (currentImageIndex >= allPreviews.length && allPreviews.length > 0) {
      setCurrentImageIndex(allPreviews.length - 1);
    }
  }, [allPreviews.length]);

  const sizeType = getSizeType(formData.subcategory);
  const sizesToShow = SIZE_OPTIONS[sizeType] || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category') setSizeStock([]);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSize = (size) => {
    setSizeStock(prev => {
      const exists = prev.find(s => s.size === size);
      if (exists) return prev.filter(s => s.size !== size);
      return [...prev, { size, stock: 0 }];
    });
  };

  const handleSizeStockChange = (size, value) => {
    setSizeStock(prev => prev.map(s =>
      s.size === size ? { ...s, stock: parseInt(value) || 0 } : s
    ));
  };

  const toggleColor = (color) =>
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);

  const handleAddCustomColor = () => {
    const trimmed = customColor.trim();
    if (!trimmed) return;
    if (!colorOptions.includes(trimmed)) setColorOptions(prev => [...prev, trimmed]);
    if (!selectedColors.includes(trimmed)) setSelectedColors(prev => [...prev, trimmed]);
    setCustomColor('');
  };

  const handleRemoveExisting = (url) => {
    setRemovedExisting(prev => new Set([...prev, url]));
    if (currentImageIndex >= allPreviews.length - 1 && allPreviews.length > 0) {
      setCurrentImageIndex(Math.max(0, allPreviews.length - 2));
    }
  };

  const handleRestoreExisting = (url) => {
    setRemovedExisting(prev => { const s = new Set(prev); s.delete(url); return s; });
  };

  const processFiles = (files) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    for (const file of files) {
      if (!allowed.includes(file.type)) { setErrorMsg(`${file.name}: Only PNG, JPG, WEBP allowed`); continue; }
      if (file.size > 5 * 1024 * 1024) { setErrorMsg(`${file.name}: Max 5MB`); continue; }
      setNewFiles(prev => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
      setErrorMsg('');
    }
  };

  const handleFileSelect = (e) => processFiles(Array.from(e.target.files || []));
  const handleDrop = (e) => { e.preventDefault(); processFiles(Array.from(e.dataTransfer?.files || [])); };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= allPreviews.length - 1 && allPreviews.length > 0) {
      setCurrentImageIndex(Math.max(0, allPreviews.length - 2));
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Product name is required';
    if (!formData.price || isNaN(parseFloat(formData.price))) e.price = 'Valid price is required';
    if (sizeStock.length === 0) e.stock = 'At least one size with stock is required';
    if (!formData.subcategory) e.subcategory = 'Subcategory is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (allPreviews.length === 0) e.images = 'At least one image is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsSubmitting(true);
    setErrorMsg('');

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('price', parseFloat(formData.price));
    data.append('brand', formData.brand.trim());
    data.append('category', formData.category);
    data.append('subcategory', formData.subcategory);
    data.append('description', formData.description.trim());
    data.append('status', formData.status);
    data.append('sizeStock', JSON.stringify(sizeStock));
    data.append('colors', JSON.stringify(selectedColors));
    data.append('existingImages', JSON.stringify(activeExisting));
    for (const { file } of newFiles) {
      data.append('images', file);
    }

    try {
      await updateProduct(product._id, data);
      setSuccessMsg('Product updated successfully!');
      setTimeout(() => { onSaved(); }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl my-6 overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-10 py-8 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Edit Product</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
              Modifying · {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 hover:text-pink-600 hover:border-pink-100 hover:bg-pink-50 transition-all hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-10 mt-6 bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <span className="font-black text-xs uppercase tracking-widest">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-10 mt-6 bg-red-50 border border-red-100 text-red-500 px-6 py-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-bold text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT COL: sticky image manager */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[88px] h-fit">
              <FormSection title="Product Images" required error={errors.images}>
                {allPreviews.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Preview */}
                    <div className="relative aspect-[3/4] rounded-[28px] overflow-hidden bg-gray-50 group border border-gray-100">
                      <img
                        src={allPreviews[Math.min(currentImageIndex, allPreviews.length - 1)]?.src}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {allPreviews.length > 1 && (
                        <>
                          <button type="button"
                            onClick={() => setCurrentImageIndex(i => (i - 1 + allPreviews.length) % allPreviews.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                          ><ChevronLeft size={18} /></button>
                          <button type="button"
                            onClick={() => setCurrentImageIndex(i => (i + 1) % allPreviews.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                          ><ChevronRight size={18} /></button>
                        </>
                      )}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
                        {Math.min(currentImageIndex, allPreviews.length - 1) + 1} / {allPreviews.length}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allPreviews.map((item, idx) => {
                        const isExisting = item.type === 'existing';
                        const isRemoved = isExisting && removedExisting.has(item.src);
                        return (
                          <div key={idx} className="relative shrink-0 group/thumb">
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 block ${idx === currentImageIndex
                                ? 'border-pink-600 ring-4 ring-pink-50'
                                : 'border-gray-100 opacity-60 hover:opacity-100 hover:border-pink-200'
                                } ${isRemoved ? 'opacity-30 grayscale' : ''}`}
                            >
                              <img src={item.src} alt="" className="w-full h-full object-cover" />
                            </button>
                            {isExisting ? (
                              isRemoved ? (
                                <button type="button" onClick={() => handleRestoreExisting(item.src)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover/thumb:opacity-100 text-[10px] font-black"
                                  title="Restore">↩</button>
                              ) : (
                                <button type="button" onClick={() => { handleRemoveExisting(item.src); if (currentImageIndex >= allPreviews.length - 1) setCurrentImageIndex(Math.max(0, allPreviews.length - 2)); }}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover/thumb:opacity-100"
                                  title="Remove"><X size={10} /></button>
                              )
                            ) : (
                              <button type="button"
                                onClick={() => { removeNewFile(idx - activeExisting.length); if (currentImageIndex >= allPreviews.length - 1) setCurrentImageIndex(Math.max(0, allPreviews.length - 2)); }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover/thumb:opacity-100"
                                title="Remove"><X size={10} /></button>
                            )}
                            {!isExisting && (
                              <span className="absolute bottom-0 left-0 right-0 bg-pink-600 text-white text-[8px] font-black text-center uppercase leading-4">New</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-[28px] bg-gray-50 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-gray-300">
                    <Camera size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Images</span>
                  </div>
                )}

                {/* Upload Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative h-24 rounded-2xl border-2 border-dashed border-pink-100 bg-pink-50/30 hover:bg-pink-50 hover:border-pink-400 transition-all cursor-pointer group mt-2"
                >
                  <input type="file" id="edit-images" accept="image/png,image/jpeg,image/jpg,image/webp" multiple onChange={handleFileSelect} className="hidden" />
                  <label htmlFor="edit-images" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer">
                    <Upload size={20} className="text-pink-500 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Add More Images</span>
                  </label>
                </div>
              </FormSection>
            </div>

            {/* RIGHT COL: form fields */}
            <div className="lg:col-span-2 space-y-8">

              {/* Basic Info */}
              <FormSection title="Basic Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Product Name" required error={errors.name}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vintage Denim Jacket"
                      className={fieldClass(errors.name)}
                    />
                  </Field>

                  {/* ✅ FIX APPLIED: Price — no scroll, no arrow keys */}
                  <Field label="Price (₹)" required error={errors.price}>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...noScrollNumberProps}
                      className={fieldClass(errors.price)}
                    />
                  </Field>

                  {/* ✅ FIX APPLIED: Stock — no scroll, no arrow keys */}
                  <Field label="Stock Quantity" required error={errors.stock}>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      placeholder="Units in inventory"
                      {...noScrollNumberProps}
                      className={fieldClass(errors.stock)}
                    />
                  </Field>

                  <Field label="Brand">
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g. US POLO"
                      className={fieldClass(false)}
                    />
                  </Field>

                  <Field label="Status" className="sm:col-span-2">
                    <select name="status" value={formData.status} onChange={handleChange} className={fieldClass(false)}>
                      <option value="active">Active Listing</option>
                      <option value="inactive">Draft / Hidden</option>
                    </select>
                  </Field>
                </div>
              </FormSection>

              {/* Category & Sizes */}
              <FormSection title="Classification & Sizing">
                <div className="space-y-6">
                  <Field label="Subcategory" required error={errors.subcategory}>
                    <div className="flex gap-3">
                      <select name="subcategory" value={formData.subcategory} onChange={handleChange} className={`flex-1 ${fieldClass(errors.subcategory)}`}>
                        <option value="">Choose a subcategory...</option>
                        {subcategories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>
                  </Field>

                  {/* Sizes */}
                  {formData.subcategory && sizeType !== 'none' && sizesToShow.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Sizes & Stock</span>
                        <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                          {sizeStock.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {sizesToShow.map(size => {
                          const itemData = sizeStock.find(s => s.size === size);
                          const isSelected = !!itemData;
                          return (
                            <div key={size} className={`flex flex-col gap-2 p-2 rounded-xl border-2 transition-all ${isSelected ? 'border-pink-600 bg-pink-50/20' : 'border-gray-50 bg-white opacity-60'}`}>
                              <button type="button" onClick={() => toggleSize(size)}
                                className={`h-10 flex items-center justify-center rounded-lg border-2 font-black text-xs transition-all duration-300 ${isSelected ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-100 bg-white text-gray-400'}`}>
                                {size}
                              </button>
                              {/* ✅ FIX APPLIED: Size stock input — no scroll, no arrow keys */}
                              {isSelected && (
                                <input
                                  type="number"
                                  min="0"
                                  value={itemData.stock}
                                  onChange={(e) => handleSizeStockChange(size, e.target.value)}
                                  {...noScrollNumberProps}
                                  className="w-full bg-white border border-pink-100 rounded-lg py-1.5 px-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-pink-500"
                                  placeholder="Qty"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Colors */}
              <FormSection title="Color Variants">
                <div className="space-y-5">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {colorOptions.map(color => (
                      <button key={color} type="button" onClick={() => toggleColor(color)}
                        className={`h-10 flex items-center justify-center rounded-xl border-2 font-black text-[10px] uppercase transition-all duration-300 ${selectedColors.includes(color)
                          ? 'border-pink-600 bg-pink-600 text-white shadow-md shadow-pink-200'
                          : 'border-gray-100 bg-white text-gray-400 hover:border-pink-200 hover:text-pink-600'
                          }`}>{color}</button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customColor}
                      onChange={e => setCustomColor(e.target.value)}
                      placeholder="Add custom color..."
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 font-bold text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 placeholder:text-gray-300"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomColor())}
                    />
                    <button type="button" onClick={handleAddCustomColor}
                      className="px-6 bg-pink-50 text-pink-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all border border-pink-100">
                      Add
                    </button>
                  </div>
                  {selectedColors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {selectedColors.map(c => (
                        <span key={c} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full flex items-center gap-2 border border-gray-100">
                          <span className="w-2 h-2 rounded-full bg-pink-600" />{c}
                          <button type="button" onClick={() => toggleColor(c)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Description */}
              <FormSection title="Product Description">
                <Field label="Description" required error={errors.description}>
                  <textarea
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe fabric quality, fit, design details, care instructions..."
                    className={`resize-none leading-relaxed ${fieldClass(errors.description)}`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description
                      ? <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{errors.description}</p>
                      : <span />}
                    <p className="text-xs text-gray-400 font-medium text-right">{formData.description.length} chars</p>
                  </div>
                </Field>
              </FormSection>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-10 py-6 flex gap-4">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-50 text-gray-500 font-black py-4 rounded-[20px] hover:bg-gray-100 transition-all uppercase tracking-widest text-xs border border-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-[3] bg-pink-600 text-white font-black py-4 rounded-[20px] flex items-center justify-center gap-3 hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving Changes...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const FormSection = ({ title, required, error, children }) => (
  <div className="bg-gray-50/50 rounded-[28px] border border-gray-100 p-7 space-y-5">
    <div className="flex items-center gap-3 border-l-4 border-pink-600 pl-4">
      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h4>
      {required && <span className="text-red-500 text-sm">*</span>}
    </div>
    {error && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{error}</p>}
    {children}
  </div>
);

const Field = ({ label, required, error, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{error}</p>}
  </div>
);

const fieldClass = (hasError) =>
  `w-full bg-white border ${hasError ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-100'} rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900 text-sm placeholder:text-gray-300 appearance-none`;

// ─── Product Card ─────────────────────────────────────────────────────────────

const AdminProductCard = ({ product, onEdit, onDelete }) => (
  <div className="group bg-white rounded-2xl border border-gray-200
  shadow-md hover:shadow-2xl hover:shadow-pink-100
  hover:border-pink-300 hover:-translate-y-1
  overflow-hidden transition-all duration-300">

    <div className="relative aspect-[4/5] bg-gray-100 flex items-center justify-center border-b">
      <img
        src={product.image || "/no-image.png"}
        alt={product.name}
        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
      />
      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${product.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
        {product.status || 'Active'}
      </div>
    </div>

    <div className="p-5 space-y-4">
      <div>
        <p className="text-xs text-pink-600 font-semibold uppercase">{product.subcategory || product.category}</p>
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-pink-600">{product.name}</h3>
      </div>

      {product.sizeStock && product.sizeStock.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.sizeStock.map((item) => (
            <span key={item.size}
              className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight border ${item.stock > 0 ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
              {item.size}: {item.stock}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center border-t border-gray-50 pt-3">
        <span className="text-base font-black text-gray-900">₹{product.price?.toLocaleString()}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${product.totalStock > 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
          {product.totalStock > 0 ? `${product.totalStock} Units` : 'Sold Out'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button onClick={onEdit}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-pink-600 hover:text-white transition">
          <Edit3 size={14} /> Edit
        </button>
        <button onClick={onDelete}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-red-500 py-2 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-gray-50" />
    <div className="p-8 space-y-4">
      <div className="h-4 bg-gray-50 rounded w-1/4" />
      <div className="h-6 bg-gray-100 rounded w-full" />
      <div className="pt-6 border-t border-gray-50 flex justify-between">
        <div className="h-8 bg-gray-50 rounded w-1/3" />
        <div className="h-8 bg-gray-50 rounded w-1/3" />
      </div>
    </div>
  </div>
);

export default AdminProducts;