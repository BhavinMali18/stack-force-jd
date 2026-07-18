const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const { validationResult } = require('express-validator');

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokenResponse = (company, statusCode, res) => {
  const accessToken = signAccessToken(company._id);
  const refreshToken = signRefreshToken(company._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, { ...options, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
    .cookie('accessToken', accessToken, { ...options, expires: new Date(Date.now() + 15 * 60 * 1000) })
    .json({ success: true, company });
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, industry, website, description } = req.body;

  const existing = await Company.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already in use.' });
  }

  const company = await Company.create({
    name,
    email,
    passwordHash: password,
    industry: industry || '',
    website: website || '',
    description: description || '',
  });

  sendTokenResponse(company, 201, res);
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  const company = await Company.findOne({ email }).select('+passwordHash');
  if (!company) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await company.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  sendTokenResponse(company, 200, res);
};

const logout = (req, res) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const company = await Company.findById(decoded.id);

    if (!company) {
      return res.status(401).json({ success: false, message: 'Company no longer exists.' });
    }

    sendTokenResponse(company, 200, res);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, company: req.company });
};

module.exports = { register, login, logout, refresh, getMe };
