import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'department', 'field', 'collector'],
    required: true
  },
  department: {
    type: String
  },
  district: {
    type: String
  },
  password: {
    type: String
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
