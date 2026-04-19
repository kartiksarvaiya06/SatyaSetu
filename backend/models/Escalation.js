import mongoose from 'mongoose';

const escalationSchema = new mongoose.Schema({
  department: { type: String, required: true },
  message: { type: String, required: true },
  sentBy: { type: String, default: 'Collector' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Escalation', escalationSchema);
