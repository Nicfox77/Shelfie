import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';
import passport from 'passport';

export const showLoginForm = (req, res) => res.render('login');
export const handleLogin = passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
});
export const showRegisterForm = (req, res) => res.render('register');
export const handleRegister = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password_hash: hashedPassword });
    res.redirect('/users/login');
};
export const dashboard = (req, res) => res.render('dashboard', { user: req.user });
export const logout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/users/login');
    });
};
