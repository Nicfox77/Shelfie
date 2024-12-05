import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import pool from '../config/db.mjs';

const initializePassport = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async (username, password, done) => {
        try {
            const [users] = await pool.query('SELECT * FROM Users WHERE username = ? OR email = ?', [username, username]);
            if (users.length === 0) {
                return done(null, false, { message: 'That username or email is not registered' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (err) {
            console.error(err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.user_id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [users] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [id]);
            done(null, users[0]);
        } catch (err) {
            console.error(err);
            done(err);
        }
    });
}

export default initializePassport;