const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password, industry, website, description } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const company = await Company.create({
    name,
    email,
    passwordHash: password,
    industry: industry || '',
    website: website || '',
    description: description || '',
  });

  const token = signToken(company._id);

  res.status(201).json({ success: true, token, company });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const company = await Company.findOne({ email }).select('+passwordHash');
  if (!company) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await company.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = signToken(company._id);

  res.json({ success: true, token, company });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({ success: true, company: req.company });
};

module.exports = { register, login, getMe };
