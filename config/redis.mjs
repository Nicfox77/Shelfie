import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Connected to Redis!'));

// Connect the Redis client
await redisClient.connect();

export default redisClient;
