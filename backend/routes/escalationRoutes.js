import express from 'express';
import { sendEscalation, getDeptEscalations, markEscalationRead } from '../controllers/escalationController.js';

const router = express.Router();

router.post('/', sendEscalation);
router.get('/dept/:department', getDeptEscalations);
router.patch('/:id/read', markEscalationRead);

export default router;
