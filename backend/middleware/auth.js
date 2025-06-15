const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Update last login time
    if (req.method === 'GET' && !req.originalUrl.includes('/api/users')) {
      await User.findByIdAndUpdate(decoded.id, { lastLogin: Date.now() });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Middleware to authorize specific roles
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    
    // Debug log
    console.log('User role:', req.user.role);
    console.log('Allowed roles:', roles);
    console.log('Is authorized:', roles.includes(req.user.role));
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`,
        allowedRoles: roles
      });
    }
    
    next();
  };
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
  
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ 
      message: 'Admin access required for this route'
    });
  }
  
  next();
}; 