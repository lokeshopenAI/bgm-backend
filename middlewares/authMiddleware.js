const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'Unauthorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized, user not found' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};

exports.verifyAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden, not admin' });

  next();
};
