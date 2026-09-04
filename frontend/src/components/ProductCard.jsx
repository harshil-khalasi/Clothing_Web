import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { getImageUrl, handleImageError } from "../utils/imageUtils";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // SIZE
  const [selectedSize, setSelectedSize] = useState(() => {
    const available = product?.sizeStock?.find(s => s.stock > 0);
    return available ? available.size : "";
  });

  // IMAGE SLIDER
  const [currentIndex, setCurrentIndex] = useState(0);

  const rawImages =
    product?.images && product.images.length > 0
      ? product.images
      : [product.image || "/no-image.png"];

  const images = rawImages.map(img => getImageUrl(img));

  return (
    <div
      className={`group bg-white rounded-2xl sm:rounded-[28px] overflow-hidden 
      border border-slate-200/80 
      shadow-md sm:shadow-lg shadow-slate-200/40 
      hover:shadow-[0_20px_50px_-12px_rgba(99,102,241,0.22)] 
      hover:border-indigo-400/60 
      transition-all duration-300 
      flex flex-col h-full relative 
      hover:-translate-y-1.5
      ${product.totalStock === 0 ? "opacity-75 grayscale-[0.3]" : ""}`}
    >
      {/* STOCK BADGE */}
      {product.totalStock === 0 ? (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-slate-900/90 backdrop-blur-md text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-lg border border-white/20">
          Out of Stock
        </div>
      ) : product.totalStock < 5 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-md shadow-rose-500/30 border border-white/30 flex items-center gap-0.5 sm:gap-1 animate-pulse">
          <Sparkles size={10} /> Only {product.totalStock} left
        </div>
      )}

      {/* IMAGE SLIDER */}
      <div className="relative w-full aspect-[4/5] bg-slate-50 flex items-center justify-center overflow-hidden group-hover:bg-slate-100/50 transition-colors duration-500">
        
        <img
          src={images[currentIndex]}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-full object-cover p-1 sm:p-3 transition-transform duration-700 group-hover:scale-105"
        />

        {/* LEFT BUTTON */}
        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
              )
            }
            className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-slate-800 p-1 sm:p-2 rounded-full shadow-md hover:bg-indigo-600 hover:text-white transition-all duration-300 z-10 text-xs sm:text-base"
          >
            ‹
          </button>
        )}

        {/* RIGHT BUTTON */}
        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md text-slate-800 p-1 sm:p-2 rounded-full shadow-md hover:bg-indigo-600 hover:text-white transition-all duration-300 z-10 text-xs sm:text-base"
          >
            ›
          </button>
        )}

        {/* DOTS */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 sm:h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  currentIndex === index ? "w-3 sm:w-5 bg-indigo-600 shadow-sm" : "w-1 sm:w-1.5 bg-slate-300"
                }`}
              ></div>
            ))}
          </div>
        )}

        {/* ACTION OVERLAY (Desktop hover) */}
        <div className="hidden md:flex absolute inset-x-4 bottom-4 gap-2.5 translate-y-24 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
          <button
            onClick={() => addToCart(product, selectedSize)}
            disabled={product.totalStock === 0 || !selectedSize}
            className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider shadow-md"
          >
            <ShoppingCart size={16} />
            Add to Bag
          </button>

          <Link
            to={`/product/${product._id}`}
            className="w-12 h-12 bg-white/90 backdrop-blur-xl border border-slate-200 flex items-center justify-center rounded-2xl hover:bg-slate-950 hover:text-white transition-all duration-300 shadow-lg active:scale-95 text-slate-800 shrink-0"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-2.5 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 tracking-widest line-clamp-1">
            {product.category}
          </span>

          {product.brand && (
            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic line-clamp-1 ml-1">
              {product.brand}
            </span>
          )}
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-xs sm:text-base font-black text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5 tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* SIZE SELECTOR */}
        {product?.sizeStock?.length > 0 && (
          <div className="flex gap-1 mt-2 sm:mt-3 flex-wrap">
            {product.sizeStock.map((item, index) => (
              <button
                key={index}
                onClick={() => item.stock > 0 && setSelectedSize(item.size)}
                disabled={item.stock === 0}
                className={`w-6 h-6 sm:w-9 sm:h-9 text-[9px] sm:text-[10px] font-extrabold rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center
                ${
                  selectedSize === item.size
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-105"
                    : item.stock > 0
                    ? "bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-500"
                    : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed opacity-50 overflow-hidden relative"
                }`}
              >
                {item.size}
                {item.stock === 0 && (
                  <span className="absolute w-full h-[1px] bg-slate-300 rotate-45" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* MOBILE ADD TO CART BUTTON */}
        <div className="flex md:hidden items-center gap-1.5 mt-2.5">
          <button
            onClick={() => addToCart(product, selectedSize)}
            disabled={product.totalStock === 0 || !selectedSize}
            className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-[10px] uppercase tracking-wider shadow-sm"
          >
            <ShoppingCart size={12} />
            {product.totalStock === 0 ? "Out" : "Add"}
          </button>
          <Link
            to={`/product/${product._id}`}
            className="w-7 h-7 bg-slate-100 border border-slate-200 flex items-center justify-center rounded-lg text-slate-700 shrink-0"
          >
            <Eye size={13} />
          </Link>
        </div>

        {/* PRICE + STATUS */}
        <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              Price
            </span>
            <span className="text-sm sm:text-xl font-black text-slate-900 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700">
              ₹{product.price?.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">
              Status
            </span>
            <span
              className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 rounded-full border ${
                product.totalStock > 0
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-slate-400 bg-slate-50 border-slate-200"
              }`}
            >
              {product.totalStock > 0 ? "In Stock" : "Sold"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;