import { Router } from 'express';
import * as bookController from '../controllers/bookController.mjs';
import pool from '../config/db.mjs';

const router = Router();

// Explore Page Route
router.get('/admin', async (req, res) =>
{
 
    res.render('admin');
});

export default router;