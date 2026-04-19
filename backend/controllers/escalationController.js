import Escalation from '../models/Escalation.js';

// POST /api/escalations — Collector sends escalation to a dept
export const sendEscalation = async (req, res) => {
  try {
    const { department, message, sentBy } = req.body;
    if (!department || !message) {
      return res.status(400).json({ message: 'Department and message are required' });
    }
    const esc = await Escalation.create({ department, message, sentBy: sentBy || 'Collector' });
    res.status(201).json({ message: 'Escalation sent', escalation: esc });
  } catch (err) {
    console.error('Escalation error:', err);
    res.status(500).json({ message: 'Failed to send escalation' });
  }
};

// GET /api/escalations/dept/:department — Dept officer fetches unread escalations
export const getDeptEscalations = async (req, res) => {
  try {
    const { department } = req.params;
    const escalations = await Escalation.find({ department, isRead: false }).sort({ createdAt: -1 });
    res.json(escalations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch escalations' });
  }
};

// PATCH /api/escalations/:id/read — Mark escalation as read
export const markEscalationRead = async (req, res) => {
  try {
    await Escalation.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};
