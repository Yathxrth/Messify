import express from 'express';
import { getMenus, getTodayMenu, createMenu, updateMenu, deleteMenu } from '../controllers/menuController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getMenus);
router.get('/today', getTodayMenu);
router.post('/', protect, authorize('worker', 'admin'), createMenu);
router.put('/:id', protect, authorize('worker', 'admin'), updateMenu);
router.delete('/:id', protect, authorize('admin'), deleteMenu);

export default router;
