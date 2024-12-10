import { Router } from 'express';
import { ensureAdmin } from '../middleware/ensureAuthenticated.mjs';

const router = Router();


router.get('/admin', ensureAdmin, async (req, res) =>
{
    res.render('admin');
});

router.get('/admin/addbook', ensureAdmin, async (req, res) =>
{
    res.send('admin add book');
});

router.get('/admin/searchuser', ensureAdmin, async (req, res) =>
{
    res.send('admin add user');
});

export default router;