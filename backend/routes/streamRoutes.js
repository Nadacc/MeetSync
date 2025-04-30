// routes/streamRoutes.js
import express from 'express';
import { getStreamToken ,createCall,joinCall,endCall} from '../controllers/streamController.js';

const router = express.Router();

router.post('/token', getStreamToken);
router.post('/create-call', createCall);
router.post('/join-call/:callId', joinCall);
router.post('/end-call/:callId', endCall);

export default router;
