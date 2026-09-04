import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  ShoppingBag, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  Store,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { getAllProducts, createPosOrder } from '../services/api';
import { useSocket } from '../context/SocketContext';
import InvoiceModal from '../components/InvoiceModal';
import toast from 'react-hot-toast';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const AdminPos = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // POS Cart State
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice Modal State
  const [generatedOrder, setGeneratedOrder] = useState(null);

  const socket = useSocket();

  // Load products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(true);
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products for POS system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for real-time stock updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleProductUpdate = (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    };

    socket.on('product:updated', handleProductUpdate);

    return () => {
      socket.off('product:updated', handleProductUpdate);
    };
  }, [socket]);

  // Categories list
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.isActive !== false;
  });

  // Add Item to POS Cart
  const handleAddToCart = (product, selectedSize) => {
    if (!selectedSize) {
      toast.error('Please select a size first');
      return;
    }

    const sizeStockObj = product.sizeStock?.find(s => s.size === selectedSize);
    const availableStock = sizeStockObj ? sizeStockObj.stock : 0;

    if (availableStock <= 0) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }

    const existingIndex = cartItems.findIndex(
      item => item.product === product._id && item.selectedSize === selectedSize
    );

    if (existingIndex > -1) {
      const currentQty = cartItems[existingIndex].qty;
      if (currentQty + 1 > availableStock) {
        toast.error(`Cannot add more than available stock (${availableStock})`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].qty += 1;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          product: product._id,
          name: product.name,
          image: product.image || (product.images && product.images[0]) || '',
          price: product.price,
          selectedSize,
          qty: 1,
          maxStock: availableStock,
        }
      ]);
    }
  };

  // Update Cart Qty
  const handleUpdateQty = (index, delta) => {
    const updated = [...cartItems];
    const item = updated[index];
    const newQty = item.qty + delta;

    if (newQty <= 0) {
      updated.splice(index, 1);
    } else if (newQty > item.maxStock) {
      toast.error(`Only ${item.maxStock} units available in stock`);
      return;
    } else {
      item.qty = newQty;
    }
    setCartItems(updated);
  };

  // Remove Cart Item
  const handleRemoveItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  // Calculate Subtotal & Total
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Submit POS Order & Decrement Stock
  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      toast.error('POS Cart is empty. Select items to generate bill.');
      return;
    }

    try {
      setIsSubmitting(true);
      const posPayload = {
        customerName: customerName || 'Counter Customer',
        phoneNumber: phoneNumber || 'In-Store',
        paymentMethod,
        totalPrice: subtotal,
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
          selectedSize: item.selectedSize,
        })),
      };

      const createdOrder = await createPosOrder(posPayload);
      toast.success('In-Store Sale Completed! Stock updated automatically.');
      
      // Reset POS Cart
      setCartItems([]);
      setCustomerName('');
      setPhoneNumber('');
      
      // Open Printable Invoice Modal
      setGeneratedOrder(createdOrder);

      // Refresh product list
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to complete POS transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto font-sans min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-2xl shadow-lg shadow-black/10">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">POS / Counter Billing</h1>
              <p className="text-sm text-gray-500 font-medium">In-Store Counter Sales & Instant Bill Generation</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all border border-gray-200"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Stock
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Search & Category Filter */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 outline-none focus:border-black transition-all text-sm font-medium"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-200">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
              <ShoppingBag size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-500 font-medium text-sm">No active products match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const totalStock = product.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0;

                return (
                  <div
                    key={product._id}
                    className="bg-white p-4 rounded-3xl border border-gray-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div className="flex gap-4 items-center">
                      <img
                        src={getImageUrl(product.image || (product.images && product.images[0]) || '/placeholder.png')}
                        onError={handleImageError}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-2xl border border-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{product.brand || product.category}</p>
                        <h3 className="font-extrabold text-sm text-gray-900 truncate">{product.name}</h3>
                        <p className="font-black text-base text-gray-900 mt-1">₹{product.price}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          totalStock > 0 ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-500'
                        }`}>
                          Stock: {totalStock} Total
                        </span>
                      </div>
                    </div>

                    {/* Sizes Selection Buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Size & Add:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizeStock?.map((s) => {
                          const isOut = s.stock <= 0;
                          return (
                            <button
                              key={s.size}
                              disabled={isOut}
                              onClick={() => handleAddToCart(product, s.size)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                isOut
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                  : 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-sm'
                              }`}
                              title={isOut ? 'Out of stock' : `Add size ${s.size} (${s.stock} in stock)`}
                            >
                              {s.size} ({s.stock})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: POS Bill Cart & Checkout (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Printer size={20} />
                  Counter Cart ({cartItems.reduce((sum, i) => sum + i.qty, 0)})
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-xs text-gray-400 hover:text-black font-bold uppercase tracking-wider transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Items List */}
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-3">
                  <ShoppingBag size={40} className="mx-auto text-gray-300" />
                  <p className="text-sm font-medium">Click a size above to add items to the POS bill.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 mb-6">
                  {cartItems.map((item, index) => (
                    <div key={`${item.product}-${item.selectedSize}`} className="flex items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      <img src={getImageUrl(item.image || '/placeholder.png')} onError={handleImageError} alt={item.name} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-[11px] text-gray-500 font-semibold">Size: <span className="text-black font-extrabold">{item.selectedSize}</span> • ₹{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-gray-200">
                        <button
                          onClick={() => handleUpdateQty(index, -1)}
                          className="text-gray-500 hover:text-black transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black text-gray-900 w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(index, 1)}
                          className="text-gray-500 hover:text-black transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors mt-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Details Input */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">Customer Info (Optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-black text-xs font-semibold"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-black text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'UPI', 'Card'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          paymentMethod === method
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Total & Action Button */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-black text-gray-900">
                <span>Grand Total:</span>
                <span className="text-2xl">₹{subtotal.toFixed(2)}</span>
              </div>

              <button
                disabled={cartItems.length === 0 || isSubmitting}
                onClick={handleGenerateBill}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
                  cartItems.length === 0 || isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Printer size={18} />
                    Complete Sale & Print Bill
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Printable Invoice Modal */}
      {generatedOrder && (
        <InvoiceModal
          order={generatedOrder}
          onClose={() => setGeneratedOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminPos;
