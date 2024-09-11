import User from "../models/User.js"; // Make sure you import the User model

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId); // Find user by session ID
    if (!user || !user.isAdmin) {
      // If not found or not an admin, deny access
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    next(); // Proceed if the user is an admin
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default isAdmin;
