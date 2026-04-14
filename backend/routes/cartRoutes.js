import express from "express";
import {
  getCart,
  syncCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.post("/sync", protect, syncCart);
router.delete("/:productId", protect, removeFromCart);

export default router;
