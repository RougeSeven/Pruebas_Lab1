const jwt = require("jsonwebtoken");

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied: token not provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Access denied: invalid or expired token" });
    req.user = user;
    next();
  });
}

// Middleware to restrict by role
function authorizeRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role privileges" });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};

