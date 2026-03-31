import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    product?.sizes?.length ? product.sizes[0] : ""
  );

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden 
      border border-gray-200 
      shadow-md hover:shadow-2xl hover:shadow-pink-100
      hover:border-pink-300
      transition-all duration-300 
      flex flex-col h-full relative 
      hover:-translate-y-1
      ${product.stock === 0 ? "opacity-70" : ""}`}
    >
      {/* STOCK */}
      {product.stock === 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
          Out of Stock
        </div>
      )}

      {/* IMAGE */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || "/no-image.png"}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* ACTION */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-16 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => addToCart({ ...product, selectedSize })}
            disabled={product.stock === 0 || !selectedSize}
            className="flex-1 bg-white text-gray-900 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 hover:text-white transition disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Add
          </button>

          <Link
            to={`/product/${product._id}`}
            className="w-10 h-10 bg-white flex items-center justify-center rounded-lg hover:bg-pink-600 hover:text-white transition"
          >
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-pink-600 uppercase bg-pink-50 px-2 py-0.5 rounded">
          {product.category}
        </span>

        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-800 hover:text-pink-600 transition line-clamp-1 mt-1">
            {product.name}
          </h3>
        </Link>

        {/* SIZE */}
        {product?.sizes?.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {product.sizes.map((size, index) => (
              <button
                key={index}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs border rounded-md transition 
                ${
                  selectedSize === size
                    ? "bg-pink-600 text-white border-pink-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-pink-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>

          <span
            className={`text-xs font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0
              ? `${product.stock} left`
              : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;