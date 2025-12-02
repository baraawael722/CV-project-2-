import express from 'express';
import multer from 'multer';
import { matchCV, matchJobs, getMatchInputs } from '../controllers/mlController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public endpoint: forward CV to Python ML service
router.post('/match', upload.single('cvFile'), matchCV);

// Protected endpoint: match jobs with user's CV
// Match jobs using ML (can be GET or POST)
router.get('/match-jobs', protect, matchJobs);
router.post('/match-jobs', protect, matchJobs);

// Public endpoint: view matcher inputs without authentication
router.get('/match-inputs', getMatchInputs);

export default router;
