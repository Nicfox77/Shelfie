import bcrypt from 'bcryptjs';
import passport from 'passport';
import pool from '../config/db.mjs';

export const showLoginForm = (req, res) => {
    res.render('login', { errors: req.flash('error') || [] });
};

export const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
};

export const showRegisterForm = (req, res) => {
    res.render('register', { errors: [] });
};

export const register = async (req, res) => {
    const { username, email, password, password2 } = req.body;
    const errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ message: 'Please enter all fields' });
    }

    if (password !== password2) {
        errors.push({ message: 'Passwords do not match' });
    }

    if (password.length < 8) {
        errors.push({ message: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        res.render('register', { errors, username, email, password, password2 });
    } else {
        try {
            const [usersByEmail] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
            if (usersByEmail.length > 0) {
                errors.push({ message: 'Email already registered' });
                res.render('register', { errors, username, email, password, password2 });
            } else {
                const [usersByUsername] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
                if (usersByUsername.length > 0) {
                    errors.push({ message: 'Username already taken' });
                    res.render('register', { errors, username, email, password, password2 });
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    await pool.query('INSERT INTO Users SET ?', { username, email, password_hash: hashedPassword });
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/login');
                }
            }
        } catch (err) {
            console.error(err);
            res.redirect('/register');
        }
    }
};

export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
};
