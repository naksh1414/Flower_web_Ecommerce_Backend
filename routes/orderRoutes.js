import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add an item to the order
router.post("/order/:orderId/item", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    // Find the order and ensure it belongs to the logged-in user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or does not belong to you" });
    }

    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the order
    const existingItemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // If the product is already in the order, update the quantity
      order.items[existingItemIndex].quantity += quantity;
    } else {
      // Add the new product to the order
      order.items.push({ productId, quantity, price: product.price });
    }

    // Update the total amount for the order
    order.totalAmount += product.price * quantity;

    // Save the updated order
    await order.save();

    res.json({ message: "Product added to order", order });
  } catch (error) {
    res.status(500).json({ error: "Error adding product to the order" });
  }
});

// Delete an item from the order
router.delete("/:orderId/item/:itemId", isAuthenticated, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const userId = req.session.userId;

    // Find the order and ensure it belongs to the logged-in user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or does not belong to you" });
    }

    // Find the item in the order
    const itemIndex = order.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the order" });
    }

    // Remove the item and update the total amount
    const item = order.items[itemIndex];
    order.totalAmount -= item.quantity * item.price;
    order.items.splice(itemIndex, 1);

    // Save the updated order
    await order.save();

    res.json({ message: "Item deleted from order", order });
  } catch (error) {
    res.status(500).json({ error: "Error deleting item from the order" });
  }
});

// Checkout an order
router.post("/:orderId/checkout", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.userId;

    // Find the order and ensure it belongs to the logged-in user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found or does not belong to you" });
    }

    // Perform checkout (this is where you would integrate payment processing)
    // For now, we'll just mark the order as "completed"
    order.status = "Completed";
    await order.save();

    res.json({ message: "Order checked out successfully", order });
  } catch (error) {
    res.status(500).json({ error: "Error checking out the order" });
  }
});

// Place an order
router.post("/place", isAuthenticated, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Create a new order
    const newOrder = new Order({
      userId: req.session.userId,
      items,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
});

// View order history for a user
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find all orders for the logged-in user
    const orders = await Order.find({ userId }).populate("items.productId");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving order history", error: err.message });
  }
});

export default router;
