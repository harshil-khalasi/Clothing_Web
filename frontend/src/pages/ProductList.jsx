import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, LayoutGrid, List, X, ChevronDown, ShoppingBag } from 'lucide-react';
import { getAllProducts, getAllSubcategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useSocket } from '../context/SocketContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, subcategoriesData] = await Promise.all([
          getAllProducts(),
          getAllSubcategories()
        ]);
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Dynamically get unique categories from products (e.g. 'Men') 
        // and combine with dynamic subcategories from API
        const productCats = new Set(productsData.map(p => p.category).filter(Boolean));
        const subCatNames = subcategoriesData.map(s => s.name);
        
        const uniqueCats = ['All', ...new Set([...productCats, ...subCatNames])];
        setCategories(uniqueCats);

        // Handle URL params
        const subcategoryParam = searchParams.get('subcategory');
        const categoryParam = searchParams.get('category');
        if (subcategoryParam) {
          setSelectedCategory(subcategoryParam);
        } else if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // 🔌 Real-time Socket Listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('product:created', (newProduct) => {
      setProducts((prev) => [newProduct, ...prev]);
    });

    socket.on('product:updated', (updatedProduct) => {
      setProducts((prev) => 
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    socket.on('product:deleted', (deletedId) => {
      setProducts((prev) => prev.filter((p) => p._id !== deletedId));
    });

    return () => {
      socket.off('product:created');
      socket.off('product:updated');
      socket.off('product:deleted');
      socket.off('subcategory:created');
      socket.off('subcategory:updated');
      socket.off('subcategory:deleted');
    };
  }, [socket]);

  // Handle re-fetching data when subcategories change
  useEffect(() => {
    if (!socket) return;

    const handleSubcategoryChange = () => {
      // Re-fetch category list from API
      getAllSubcategories().then(subcategoriesData => {
        const productCats = new Set(products.map(p => p.category).filter(Boolean));
        const subCatNames = subcategoriesData.map(s => s.name);
        const uniqueCats = ['All', ...new Set([...productCats, ...subCatNames])];
        setCategories(uniqueCats);
      }).catch(console.error);
    };

    socket.on('subcategory:created', handleSubcategoryChange);
    socket.on('subcategory:updated', handleSubcategoryChange);
    socket.on('subcategory:deleted', handleSubcategoryChange);

    return () => {
      socket.off('subcategory:created', handleSubcategoryChange);
      socket.off('subcategory:updated', handleSubcategoryChange);
      socket.off('subcategory:deleted', handleSubcategoryChange);
    };
  }, [socket, products]);

  useEffect(() => {
    let result = [...products];

    // Filter by category or subcategory
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.subcategory === selectedCategory || p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, sortBy, products]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-pink-600" size={32} />
            Our Collection
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Showing {filteredProducts.length} Premium Products</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all shadow-sm group-hover:shadow-md text-sm font-medium"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === cat 
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' 
                : 'bg-white text-gray-500 hover:text-pink-600 hover:bg-pink-50 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-xl px-6 py-2.5 pr-12 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-pink-500/10 cursor-pointer hover:border-pink-500 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-pink-600" />
          </div>

          <button 
            onClick={clearFilters}
            className="p-2.5 text-gray-400 hover:text-pink-600 transition-colors bg-white border border-gray-100 rounded-xl hover:bg-pink-50 active:scale-95"
            title="Clear Filters"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-[450px] border border-gray-100"></div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            We couldn't find any products matching your current filters. Try adjusting your search or category.
          </p>
          <button 
            onClick={clearFilters}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition-all active:scale-95 shadow-lg shadow-pink-200"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
