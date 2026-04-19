import User from '../models/User.js';
import twilio from 'twilio';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Helper to generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
  try {
    const { name, mobile, role, department, district, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ mobile });
    if (user) {
      return res.status(400).json({ message: 'User with this mobile number already exists.' });
    }

    const userData = {
      name,
      mobile,
      role,
      department,
      district
    };

    // Only hash password if it's provided (officers)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(password, salt);
    }

    if (role === 'citizen') {
      const otp = generateOtp();
      userData.otp = otp;
      userData.otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins
    }

    user = new User(userData);
    await user.save();

    if (role === 'citizen') {
      // Send OTP for citizens
      if (twilioClient) {
        try {
          await twilioClient.messages.create({
            body: `Welcome to Swagat System! Your verification code is ${user.otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobile}`
          });
        } catch (err) {
          console.error('Twilio Error:', err);
        }
      }
      console.log(`[SIGNUP] OTP for ${mobile}: ${user.otp}`);
      return res.status(201).json({ 
        message: 'User created. OTP sent.', 
        requireOtp: true,
        user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } 
      });
    }

    // Direct success for officers
    res.status(201).json({ 
      message: 'Officer account created successfully.', 
      requireOtp: false,
      user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role, department: user.department } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    // Role-based logic
    if (user.role === 'citizen') {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60000);
      await user.save();

      if (twilioClient) {
        try {
          await twilioClient.messages.create({
            body: `Your Swagat System verification code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${mobile}`
          });
        } catch (err) {
          console.error('Twilio Error:', err);
        }
      }
      console.log(`[LOGIN] OTP for ${mobile}: ${otp}`);
      return res.status(200).json({ 
        message: 'OTP sent.', 
        requireOtp: true,
        user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } 
      });
    } else {
      // Officer login - require password
      if (!password) {
        return res.status(400).json({ message: 'Password is required for officer login.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      return res.status(200).json({
        message: 'Login successful.',
        requireOtp: false,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          department: user.department,
          district: user.district
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        department: user.department,
        district: user.district
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
  }
};
