import { Router } from 'express';
import { ensureAdmin } from '../middleware/ensureAuthenticated.mjs';
import pool from '../config/db.mjs';

const router = Router();


router.get('/admin', ensureAdmin, async (req, res) =>
{
    res.render('admin');
});

router.get('/admin/addbook', ensureAdmin, async (req, res) =>
{
    res.render('addbook');
});

router.post('/admin/addbook', ensureAdmin, async (req, res) =>
{
    let isbn = req.body.isbn;
    let title = req.body.title;
    let author = req.body.author;
    let description = req.body.description;
    let publisher = req.body.publisher;
    let publishDate = req.body.publishDate;
    let pageCount = req.body.pageCount;
    let rating = req.body.rating;
    let genre = req.body.genre;
    let imgUrl = req.body.imgUrl;

    let params = [isbn, title, author, description, publisher, publishDate, pageCount, rating, genre, imgUrl];
    let conn;

    try
    {
        conn = await pool.getConnection();
        let sql = `INSERT INTO Books (isbn, title, author, genre, description, publisher, page_count, published_date, rating, image) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await conn.query(sql,params);

        res.redirect('/admin');
    } catch (error)
    {
        console.error('Error adding book:', error);
        res.status(500).send('Error adding book to database');
    } finally
    {
        if (conn) conn.release();
    }
});

router.get('/admin/searchuser', ensureAdmin, (req, res) =>
{
    res.render('searchuser', {
        searchedUser: null,  // Renamed from user to searchedUser
        message: null,
        user: req.user  // Pass the logged-in user separately
    });
});

router.post('/admin/searchuser', ensureAdmin, async (req, res) =>
{
    let conn;
    try
    {
        conn = await pool.getConnection();
        const username = req.body.userName;

        const sql = `
            SELECT user_id, username, email, created_at, bio, 
                   profile_img, user_type, firstName, lastName 
            FROM Users 
            WHERE username = ?
        `;
        const [rows] = await conn.query(sql, [username]);

        if (rows.length > 0)
        {
            res.render('searchuser', {
                searchedUser: rows[0],  // Use searchedUser for the found user
                message: { type: 'success', text: 'User found' },
                user: req.user  // Keep the logged-in user's info
            });
        } else
        {
            res.render('searchuser', {
                searchedUser: null,
                message: { type: 'error', text: 'User not found' },
                user: req.user
            });
        }
    } catch (error)
    {
        console.error('Error searching user:', error);
        res.render('searchuser', {
            searchedUser: null,
            message: { type: 'error', text: 'Error searching for user' },
            user: req.user
        });
    } finally
    {
        if (conn) conn.release();
    }
});

router.post('/admin/edituser', ensureAdmin, async (req, res) =>
{
    let conn;
    try
    {
        conn = await pool.getConnection();
        const { userId, username, email, bio, userType, firstName, lastName } = req.body;

        // Convert userType string to integer
        // If userType is 'admin', set to 1, if 'user' set to 2
        const userTypeValue = userType === '1' ? 1 : 2;  // Changed from 'admin' to '1'

        const sql = `UPDATE Users SET username = ?, email = ?, bio = ?, user_type = ?, firstName = ?, lastName = ? WHERE user_id = ?`;
        await conn.query(sql, [username, email, bio, userTypeValue, firstName, lastName, userId]);

        res.render('searchuser', {
            searchedUser: null,
            message: { type: 'success', text: 'User updated successfully' },
            user: req.user
        });
    } catch (error)
    {
        console.error('Error updating user:', error);
        res.render('searchuser', {
            searchedUser: null,
            message: { type: 'error', text: 'Error updating user' },
            user: req.user
        });
    } finally
    {
        if (conn) conn.release();
    }
});

export default router;