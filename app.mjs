import express from 'express';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport-config.mjs';
import flash from 'connect-flash';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// Get file paths to set for views and public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3333;
const app = express();

// Initialize Passport
initializePassport(passport);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session store
let sessionStore;
if (process.env.USE_REDIS === 'true') {
    console.log('Using Redis for session store');
    const { createClient } = await import('redis');
    const { RedisStore } = await import('connect-redis');

    const redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    await redisClient.connect().catch(console.error);

    sessionStore = new RedisStore({
        client: redisClient,
        prefix: 'sess:',
    });
} else {
    sessionStore = new session.MemoryStore();
}

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
import bookRoutes from './routes/books.mjs';
import loginRoutes from './routes/login.mjs';
import indexRoutes from './routes/index.mjs';
import dbTestRoutes from './routes/dbtest.mjs';

// Add the database test route
app.use('/', dbTestRoutes);
// Basic route
app.use('/', indexRoutes);
// Login route
app.use('/', loginRoutes);
// Explore page route
app.use('/', bookRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));