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
        let sql = `INSERT INTO Books (isbn, title, author, description, publisher, published_date, page_count, rating, genre, image) 
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

router.get('/admin/searchuser', ensureAdmin, async (req, res) =>
{
    res.render('admin');
});

export default router;