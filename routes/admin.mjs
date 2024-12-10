import { Router } from 'express';
import { ensureAdmin } from '../middleware/ensureAuthenticated.mjs';

const router = Router();

// Apply ensureAdmin middleware to all admin routes
router.get('/admin', ensureAdmin, async (req, res) =>
{
    res.render('admin');
});

router.get('/admin/addbook', ensureAdmin, async (req, res) =>
{
    res.render('admin');
});

export default router;