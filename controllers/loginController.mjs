import bcrypt from 'bcryptjs';
import passport from 'passport';
import pool from '../config/db.mjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

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

export const showPasswordResetForm = (req, res) => {
    res.render('password-reset', { errors: req.flash('error') || [] });
}

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const errors = [];

    if (!email) {
        errors.push({ message: 'Please enter your email' });
    }

    if (errors.length > 0) {
        res.render('password-reset', { errors });
    } else {
        try {
            const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
            if (users.length === 0) {
                errors.push({ message: 'Email not registered' });
                res.render('password-reset', { errors });
            } else {
                const user = users[0];
                const token = crypto.randomBytes(32).toString('hex');
                const tokenKey = `password-reset:${token}`;

                if (process.env.USE_REDIS === 'true') {
                    const { default: redisClient } = await import('../config/redis.mjs');
                    await redisClient.set(tokenKey, user.user_id, { EX: 3600 }); // Token expires in 1 hour
                }

                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Password Reset',
                    text: `You requested a password reset. Click the link to reset your password: ${resetLink}`
                };

                await transporter.sendMail(mailOptions);

                req.flash('success_msg', 'Password reset email sent');
                res.redirect('/login');
            }
        } catch (err) {
            console.error(err);
            res.redirect('/password-reset');
        }
    }
};
