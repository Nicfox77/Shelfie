import { Router } from 'express';
import pool from '../config/db.mjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from "bcryptjs";

const router = Router();

// Profile Page Route
router.get('/', async (req, res) => {
    const editMode = req.query.editMode === 'true';
    try {
        let sql = `SELECT * FROM Users WHERE user_id = ?`;
        let [row] = await pool.query(sql, [req.user.user_id]);
        res.render('profile', { user: row[0], editMode });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/', async (req, res) => {
    const { firstname, lastname, username, email, password, confirmationCode } = req.body;
    console.log(req.body);
    const userId = req.user.user_id;

    try {
        console.log('checking password');
        // grab data from the database
        let sql = `SELECT email, password_hash FROM Users WHERE user_id = ?`;
        let [rows] = await pool.query(sql, [userId]);
        const currentEmail = rows[0].email;
        const currentPasswordHash = rows[0].password_hash;

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, currentPasswordHash);

        if (!isMatch) {
            return res.status(400).send({ message: 'Incorrect password' });
        }
        console.log('Password is correct');

        // Check if the email has changed
        if (email !== currentEmail) {
            // Email has changed, verify confirmation code
            console.log('email has changed');
            if (req.session.confirmationCode === confirmationCode) {
                console.log('confirmation code is correct');
                sql = `UPDATE Users SET firstName = ?, lastName = ?, username = ?, email = ? WHERE user_id = ?`;
                await pool.query(sql, [firstname, lastname, username, email, userId]);
                return res.redirect('/profile');
            } else {
                return res.status(400).send({ message: 'Invalid confirmation code' });
            }
        } else {
            console.log('email has not changed');
        }

        // Email has not changed, just set other fields
        sql = `UPDATE Users SET firstName = ?, lastName = ?, username = ? WHERE user_id = ?`;
        await pool.query(sql, [firstname, lastname, username, userId]);
        return res.redirect('/profile');

    } catch (err) {
        console.error(err);
        return res.redirect('/');
    }
});

// Send confirmation code to new email
router.post('/send-confirmation-code', async (req, res) => {
    const { newEmail } = req.body;
    const confirmationCode = crypto.randomInt(1000, 9999).toString();

    // Store the confirmation code in the session
    req.session.confirmationCode = confirmationCode;
    req.session.newEmail = newEmail;

    // Send the confirmation code to the new email address
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: 'Email Change Confirmation Code',
        text: `Your confirmation code is: ${confirmationCode}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send({ message: 'Confirmation code sent' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to send confirmation code' });
    }
});

export default router;