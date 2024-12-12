import { Router } from 'express';

const router = Router();

// Home Page Route
router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

export default router;
