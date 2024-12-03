import { Router } from 'express';
import pool from '../config/db.mjs';

const router = Router();

router.get('/dbtest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT DATABASE() AS db_name;');
        res.json({
            success: true,
            message: 'Database connection successful!',
            database: rows[0]?.db_name || 'No database selected',
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to connect to the database',
            error: err.message,
        });
    }
});

export default router;
