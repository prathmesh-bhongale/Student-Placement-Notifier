const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const { AppError, asyncHandler, clean } = require('../utils/helpers');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { prn, email } = req.body;
  const errors = [];
  if (await Student.findOne({ where: { prn } })) errors.push({ field: 'prn', message: 'PRN already exists' });
  if (await Student.findOne({ where: { email } })) errors.push({ field: 'email', message: 'Email already exists' });
  if (errors.length) throw new AppError('Validation failed', 409, errors);

  const student = await Student.create({
    ...req.body,
    name: clean(req.body.name),
    address: clean(req.body.address),
    skills: req.body.skills.map(clean),
    certifications: (req.body.certifications || []).map(clean),
  });

  res.status(201).json({
    status: 'success',
    data: { token: signToken(student.id, 'student'), user: student },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const student = await Student.findOne({ where: { email } });
  if (!student || !(await student.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({ status: 'success', data: { token: signToken(student.id, 'student'), user: student } });
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({ status: 'success', data: { token: signToken(admin.id, 'admin'), user: admin } });
});

exports.checkPrn = asyncHandler(async (req, res) => {
  const prn = String(req.query.prn || '').trim().toUpperCase();
  if (!prn) throw new AppError('PRN is required', 400);
  const exists = await Student.findOne({ where: { prn } });
  res.json({ status: 'success', data: { available: !exists } });
});

exports.checkEmail = asyncHandler(async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (!email) throw new AppError('Email is required', 400);
  const exists = await Student.findOne({ where: { email } });
  res.json({ status: 'success', data: { available: !exists } });
});
