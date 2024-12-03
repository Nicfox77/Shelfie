import { Router } from 'express';

const router = Router();

// Explore Page Route
router.get('/Explore', (req, res) => {
    res.render('explore', { user: req.user });
});


export default router;