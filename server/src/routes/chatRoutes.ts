import { Router } from 'express';
import chatController from '../controllers/chatControllers';

const router = Router();

// Route chính cho chat
router.post('/', chatController.chatHandler);

// Route kiểm tra kết nối
router.get('/test', chatController.testConnection);

// Route health check
router.get('/health', chatController.healthCheck);

export default router;