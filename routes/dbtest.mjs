import { Router } from 'express';
import pool from '../config/db.mjs';
import redisClient from '../config/redis.mjs';

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

// Test route to check Redis connection
router.get('/test-redis', async (req, res) => {
    try {
        // Write a test key to Redis
        await redisClient.set('test-key', 'test-value');

        // Retrieve the test key from Redis
        const value = await redisClient.get('test-key');

        // Return the value
        res.status(200).send(`Redis is working! Retrieved value: ${value}`);
    } catch (error) {
        console.error('Error testing Redis:', error);
        res.status(500).send('Error connecting to Redis.');
    }
});

export default router;
