import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getCartServer,
  addToCartServer,
  removeFromCartServer,
  syncCartServer,
  clearCartServer
} from "../services/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  // Load cart on start or user change
  const loadCart = useCallback(async () => {
    setCartLoading(true);
    try {
      if (user) {
        // Logged in: Sync Local with DB then fetch DB
        const savedCart = localStorage.getItem("cart");
        const localItems = savedCart ? JSON.parse(savedCart) : [];

        if (localItems.length > 0) {
          // Merge local cart with DB
          await syncCartServer(localItems);
          localStorage.removeItem("cart");
          toast.success("Guest items synced with your account");
        }
        
        const dbCart = await getCartServer();
        // Backend returns array of { product: { ... }, qty, selectedSize }
        // Flatten for frontend state safely filtering deleted/null products
        const formattedCart = (dbCart || [])
          .filter(item => item && item.product)
          .map(item => ({
            ...item.product,
            qty: item.qty,
            selectedSize: item.selectedSize,
            product: item.product._id // maintain consistency
          }));
        setCartItems(formattedCart);
      } else {
        // Guest: Use local storage
        const savedCart = localStorage.getItem("cart");
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, selectedSize) => {
    try {
      const existingItem = cartItems.find(
        (item) => (item._id === product._id || item.product === product._id) && item.selectedSize === selectedSize
      );

      const selectedSizeData = product.sizeStock?.find(s => s.size === selectedSize);
      const maxStock = selectedSizeData ? selectedSizeData.stock : 0;

      if (existingItem && existingItem.qty >= maxStock) {
        toast.error(`Only ${maxStock} items available in stock`);
        return;
      }

      if (user) {
        // Server call
        await addToCartServer({ productId: product._id, qty: 1, selectedSize });
        
        // Optimistic refresh
        const dbCart = await getCartServer();
        const formattedCart = (dbCart || [])
          .filter(item => item && item.product)
          .map(item => ({
            ...item.product,
            qty: item.qty,
            selectedSize: item.selectedSize,
            product: item.product._id
          }));
        setCartItems(formattedCart);
      } else {
        // Guest local update
        setCartItems((prevItems) => {
          if (existingItem) {
            return prevItems.map((item) =>
              (item._id === product._id || item.product === product._id) && item.selectedSize === selectedSize
                ? { ...item, qty: item.qty + 1 }
                : item
            );
          }
          return [...prevItems, { ...product, selectedSize, qty: 1 }];
        });
      }
      toast.success("Added to bag!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (productId, selectedSize) => {
    try {
      if (user) {
        await removeFromCartServer(productId, selectedSize);
        const dbCart = await getCartServer();
        const formattedCart = (dbCart || [])
          .filter(item => item && item.product)
          .map(item => ({
            ...item.product,
            qty: item.qty,
            selectedSize: item.selectedSize,
            product: item.product._id
          }));
        setCartItems(formattedCart);
      } else {
        setCartItems((prevItems) =>
          prevItems.filter(
            (item) => !(item._id === productId && item.selectedSize === selectedSize)
          )
        );
      }
      toast.success("Removed from bag");
    } catch (error) {
      toast.error("Failed to remove from cart");
    }
  };

  const updateQty = async (productId, selectedSize, action) => {
    try {
      const item = cartItems.find(
        (item) => (item._id === productId || item.product === productId) && item.selectedSize === selectedSize
      );
      if (!item) return;

      let newQty = item.qty;
      const selectedSizeData = item.sizeStock?.find(s => s.size === selectedSize);
      const maxStock = selectedSizeData ? selectedSizeData.stock : 999;

      if (action === "inc") {
        if (newQty < maxStock) {
          newQty += 1;
        } else {
          toast.error(`Only ${maxStock} items available in stock`);
          return;
        }
      }
      if (action === "dec" && item.qty > 1) newQty -= 1;

      if (newQty === item.qty) return;

      if (user) {
        // Update on server (using sync path for simplicity or adding special update api)
        // For efficiency, I'll use the sync logic to push the updated state
        const updatedItems = cartItems.map(i => 
          (i._id === productId || i.product === productId) && i.selectedSize === selectedSize
          ? { ...i, qty: newQty }
          : i
        );
        await syncCartServer(updatedItems);
        setCartItems(updatedItems);
      } else {
        setCartItems((prevItems) =>
          prevItems.map((i) =>
            (i._id === productId || i.product === productId) && i.selectedSize === selectedSize
              ? { ...i, qty: newQty }
              : i
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      if (user) await clearCartServer();
      setCartItems([]);
      if (!user) localStorage.removeItem("cart");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartCount,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
