import express from 'express';
import { signup, sendOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
