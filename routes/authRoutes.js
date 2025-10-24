const express = require('express');
const { signup, verifyOtp, login, adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/admin/login', adminLogin);  // <-- add this

module.exports = router;
