import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from './redis.mjs';

let sessionStore = new session.MemoryStore(); // Default to in-memory store

if (process.env.USE_REDIS === 'true') {
    console.log('Using Redis for session store');

    // Use the existing Redis client
    sessionStore = new RedisStore({
        client: redisClient,
        prefix: 'sess:',
    });
}

export default sessionStore;
