import { createClient } from 'redis';

const client = createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`
});

client.on('error', (err) => console.error('Redis Client Error', err));

await client.connect();

export default client;