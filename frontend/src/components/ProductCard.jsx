import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // SIZE
  const [selectedSize, setSelectedSize] = useState(() => {
    const available = product?.sizeStock?.find(s => s.stock > 0);
    return available ? available.size : "";
  });

  // IMAGE SLIDER
  const [currentIndex, setCurrentIndex] = useState(0);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : [product.image || "/no-image.png"];

  return (
    <div
      className={`group bg-white rounded-3xl overflow-hidden 
      border border-gray-100 
      shadow-sm hover:shadow-2xl hover:shadow-pink-100/50
      hover:border-pink-200
      transition-all duration-500 
      flex flex-col h-full relative 
      hover:-translate-y-2
      ${product.totalStock === 0 ? "opacity-75 grayscale-[0.5]" : ""}`}
    >
      {/* STOCK BADGE */}
      {product.totalStock === 0 ? (
        <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10">
          Out of Stock
        </div>
      ) : product.totalStock < 5 && (
        <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-white/10 animate-pulse">
          Only {product.totalStock} left
        </div>
      )}

      {/* IMAGE SLIDER */}
      <div className="relative w-full aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden group-hover:bg-white transition-colors duration-500">
        
        <img
          src={images[currentIndex]}
          alt={product.name}
          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />

        {/* LEFT BUTTON */}
        {images.length > 1 && (
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition"
          >
            ›
          </button>
        )}

        {/* DOTS */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full cursor-pointer ${
                  currentIndex === index ? "bg-pink-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        )}

        {/* ACTION OVERLAY */}
        <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-all duration-500 ease-out">
          <button
            onClick={() => addToCart(product, selectedSize)}
            disabled={product.totalStock === 0 || !selectedSize}
            className="flex-1 bg-white text-gray-900 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
          >
            <ShoppingCart size={16} />
            Add to Bag
          </button>

          <Link
            to={`/product/${product._id}`}
            className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl hover:bg-pink-600 hover:text-white transition-all shadow-xl active:scale-95 text-gray-900"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-pink-600 uppercase bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100 tracking-widest">
            {product.category}
          </span>

          {product.brand && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
              {product.brand}
            </span>
          )}
        </div>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-base font-black text-gray-900 hover:text-pink-600 transition-colors line-clamp-1 mt-1 tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* SIZE SELECTOR */}
        {product?.sizeStock?.length > 0 && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {product.sizeStock.map((item, index) => (
              <button
                key={index}
                onClick={() => item.stock > 0 && setSelectedSize(item.size)}
                disabled={item.stock === 0}
                className={`w-9 h-9 text-[10px] font-black border-2 rounded-xl transition-all duration-300 flex items-center justify-center
                ${
                  selectedSize === item.size
                    ? "bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-100 scale-110"
                    : item.stock > 0
                    ? "bg-white text-gray-700 border-gray-100 hover:border-pink-500 hover:text-pink-600"
                    : "bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed opacity-50 overflow-hidden relative"
                }`}
              >
                {item.size}
                {item.stock === 0 && (
                  <span className="absolute w-full h-[1px] bg-gray-300 rotate-45" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* PRICE + STATUS */}
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Price
            </span>
            <span className="text-xl font-black text-gray-900 tracking-tighter">
              ₹{product.price?.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
              Status
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                product.totalStock > 0
                  ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                  : "text-rose-600 bg-rose-50 border-rose-100"
              }`}
            >
              {product.totalStock > 0 ? "In Stock" : "Sold Out"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;