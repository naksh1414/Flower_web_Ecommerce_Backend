import express from "express";
import Product from "../models/Product.js";
import multer from "multer";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import authenticateJWT from "../middlewares/authMiddleware.js"; // JWT authentication middleware
import isAdmin from "../middlewares/adminMiddleware.js"; // Admin check middleware

const router = express.Router();

// Multer config to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a new product
router.post(
  "/add",
  [authenticateJWT, isAdmin],
  upload.single("image"),
  async (req, res) => {
    console.log("User from token:", req.user); // Log user info from token

    try {
      const result = await uploadToCloudinary(req.file);
      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        image: result.secure_url,
        description: req.body.description,
        public_id: result.public_id,
      });

      await newProduct.save();
      res
        .status(201)
        .json({ message: "Product added successfully", product: newProduct });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error adding product", error: err.message });
    }
  }
);

// Route to view all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving products", error: err.message });
  }
});

// Route to view a specific product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving product", error: err.message });
  }
});

// Route to delete a product by ID
router.delete("/:id", [authenticateJWT, isAdmin], async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id; // Get the user ID from the JWT

    // Ensure the product belongs to the logged-in user
    const product = await Product.findOne({ _id: productId, userId });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    await deleteFromCloudinary(product.public_id); // Delete from Cloudinary
    await Product.findByIdAndDelete(productId); // Delete the product from the database
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

// Route to get user-specific products
router.get("/user-products", [authenticateJWT], async (req, res) => {
  // Only authenticate, no admin check needed
  try {
    const userId = req.user.id; // Get the user ID from the JWT
    const userProducts = await Product.find({ userId });
    res.status(200).json(userProducts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user products" });
  }
});

export default router;
