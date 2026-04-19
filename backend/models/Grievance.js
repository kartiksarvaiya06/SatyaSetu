import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    required: true,
    unique: true
  },
  complainantName: {
    type: String,
    required: true
  },
  complainantMobile: {
    type: String,
    required: true
  },
  ivrMobile: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved_pending_verification', 'field_verified', 'verified_resolved', 'auto_reopened', 'rejected'],
    default: 'pending'
  },
  department: {
    type: String,
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  resolutionAttempts: [{
    updatedAt: Date,
    note: String,
    status: String
  }]
}, { timestamps: true });

const Grievance = mongoose.model('Grievance', grievanceSchema);
export default Grievance;
