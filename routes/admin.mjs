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
        user: null,
        message: null
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
                user: rows[0],
                message: { type: 'success', text: 'User found' }
            });
        } else
        {
            res.render('searchuser', {
                user: null,
                message: { type: 'error', text: 'User not found' }
            });
        }
    } catch (error)
    {
        console.error('Error searching user:', error);
        res.render('searchuser', {
            user: null,
            message: { type: 'error', text: 'Error searching for user' }
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
        const userTypeValue = userType === 'admin' ? 1 : 2; 

        const sql = `UPDATE Users SET username = ?, email = ?, bio = ?, user_type = ?, firstName = ?, lastName = ? WHERE user_id = ?`;

        await conn.query(sql, [username, email, bio, userTypeValue, firstName, lastName, userId]);

        res.render('searchuser', {
            user: null,
            message: { type: 'success', text: 'User updated successfully' }
        });
    } catch (error)
    {
        console.error('Error updating user:', error);
        res.render('searchuser', {
            user: null,
            message: { type: 'error', text: 'Error updating user' }
        });
    } finally
    {
        if (conn) conn.release();
    }
});

export default router;