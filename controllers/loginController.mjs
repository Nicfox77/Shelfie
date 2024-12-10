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
        successRedirect: '/explore',
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
        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy session:', err);
            }
            res.redirect('/');
        });
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

export const showNewPasswordForm = async (req, res) => {
    const { token } = req.query;
    const errors = [];

    if (!token) {
        errors.push({ message: 'Invalid reset link' });
        return res.render('reset-password', { errors });
    }

    if (process.env.USE_REDIS === 'true') {
        const { default: redisClient } = await import('../config/redis.mjs');
        const tokenKey = `password-reset:${token}`;
        console.log(tokenKey);
        const userId = await redisClient.get(tokenKey);
        console.log(userId);
        if (!userId) {
            errors.push({ message: 'Invalid reset link' });
            return res.render('reset-password', { errors });
        } else {
            return res.render('reset-password', { errors, token });
        }
    } else {
        return res.render('reset-password', { errors, token });
    }
};

export const setNewPassword = async (req, res) => {
    const { token, password, password2 } = req.body;
    const errors = [];

    if (!token) {
        errors.push('Invalid reset link');
    }

    if (!password || !password2) {
        errors.push('Please enter all fields');
    }

    if (password !== password2) {
        errors.push('Passwords do not match');
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
        res.render('reset-password', { errors, token });
    } else {
        if (process.env.USE_REDIS === 'true') {
            const { default: redisClient } = await import('../config/redis.mjs');
            const tokenKey = `password-reset:${token}`;
            const userId = await redisClient.get(tokenKey);
            console.log("setNewPassword -> userId", userId)
            if (!userId) {
                errors.push('Invalid reset link');
                res.render('reset-password', { errors, token });
            } else {
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    await pool.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [hashedPassword, userId]);
                    await redisClient.del(tokenKey);
                    req.flash('success_msg', 'Password reset successfully');
                    res.redirect('/login');
                } catch (err) {
                    console.error(err);
                    res.redirect('/reset-password?token=' + token);
                }
            }
        } else {
            res.render('reset-password', { errors, token });
        }
    }
};
