import express from 'express';
import { 
  createGrievance, 
  getCitizenGrievances, 
  getDeptGrievances,
  getFieldTasks,
  updateGrievanceStatus,
  submitFieldVerification,
  getCollectorStats
} from '../controllers/grievanceController.js';

const router = express.Router();

router.post('/', createGrievance);
router.get('/citizen/:mobile', getCitizenGrievances);
router.get('/dept/:department', getDeptGrievances);
router.get('/field/:department', getFieldTasks);
router.get('/collector/stats', getCollectorStats);
router.patch('/:id/status', updateGrievanceStatus);
router.post('/:id/verify', submitFieldVerification);

export default router;
