import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import { fileURLToPath } from 'url';
import path from 'path';

// Import routes
import userRoutes from './routes/users.mjs';
import bookRoutes from './routes/books.mjs';
import reviewRoutes from './routes/reviews.mjs';
import indexRoutes from './routes/index.mjs';

// Passport configuration
import initializePassport from './config/passport-config.mjs';

// Directory settings
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = 3333;
const app = express();
initializePassport(passport);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Global variables for EJS
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.messages = req.flash();
    next();
});

// Routes
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reviews', reviewRoutes);
app.use('/index', indexRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));