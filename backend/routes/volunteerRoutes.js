import express from 'express';
import { 
    createProfile, 
    getNearbyTasks, 
    applyForTask, 
    submitProof 
} from '../controllers/volunteerController.js';

const router = express.Router();

// Route: POST /api/volunteer/profile
router.post('/profile', createProfile);

// Route: GET /api/volunteer/tasks
router.get('/tasks', getNearbyTasks);

// Route: POST /api/volunteer/apply
router.post('/apply', applyForTask);

// Route: POST /api/volunteer/submit-proof
// (Later, add a multer middleware here like: upload.fields([{name: 'before'}, {name: 'after'}]), submitProof)
router.post('/submit-proof', submitProof);

export default router;