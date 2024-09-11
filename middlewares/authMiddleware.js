const isAuthenticated = (req, res, next) => {
  console.log("Session ID:", req.sessionID); // Log session ID
  console.log("Session Data:", req.session);
  if (!req.session.userId) {
    // If not authenticated, send unauthorized message
    return res.status(401).json({ message: "User is unauthorized" });
  }
  next();
};

export default isAuthenticated;
