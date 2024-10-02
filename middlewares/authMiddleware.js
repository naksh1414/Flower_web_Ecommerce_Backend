import jwt from "jsonwebtoken";

const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Bearer header

  if (!token) {
    return res.sendStatus(401); // Unauthorized if token is missing
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }
    req.user = user; // Attach user information to request
    next(); // Proceed to the next middleware/route handler
  });
};
export default authenticateJWT
