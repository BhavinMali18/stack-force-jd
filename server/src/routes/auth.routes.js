const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, refresh, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

const registerValidation = [
  body('name', 'Name is required').notEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
  body('password', 'Password must contain at least one number and one uppercase letter')
    .matches(/^(?=.*\d)(?=.*[A-Z]).*$/),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
