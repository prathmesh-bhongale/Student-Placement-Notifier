const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ status: 'error', message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;
    if (decoded.role === 'student') user = await Student.findByPk(decoded.id);
    else if (decoded.role === 'admin') user = await Admin.findById(decoded.id);
    if (!user) return res.status(401).json({ status: 'error', message: 'User no longer exists' });

    req.user = user;
    req.role = decoded.role;
    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (role) => (req, res, next) => {
  if (req.role !== role) {
    return res.status(403).json({ status: 'error', message: 'You do not have permission for this action' });
  }
  next();
};

module.exports = { protect, restrictTo };
