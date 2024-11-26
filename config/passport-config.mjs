import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';

const initializePassport = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) return done(null, false, { message: 'No user with that email' });

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return done(null, false, { message: 'Password incorrect' });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findByPk(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });
};

export default initializePassport;
