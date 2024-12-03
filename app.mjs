import express from 'express';
// import session from 'express-session';
// import flash from 'connect-flash';
// import passport from 'passport';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './config/db.mjs';

//load environment variables
dotenv.config();

// Import routes
// import userRoutes from './routes/users.mjs';
// import bookRoutes from './routes/books.mjs';
// import reviewRoutes from './routes/reviews.mjs';
import indexRoutes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3333;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Global variables for EJS
// app.use((req, res, next) => {
//     res.locals.user = req.user || null;
//     res.locals.messages = req.flash();
//     next();
// });

// Basic route
app.use('/', indexRoutes);

app.get('/dbtest', async (req, res) => {
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));