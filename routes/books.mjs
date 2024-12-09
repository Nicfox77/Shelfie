import { Router } from 'express';
import * as bookController from '../controllers/bookController.mjs';
import pool from '../config/db.mjs';

const router = Router();

// Explore Page Route
router.get('/Explore', async (req, res) => {
    const search = req.query.search || ""; // Get 'search' query parameter
    let books = [];

    if (search) {
        // Fetch books if a search term is provided
        books = await bookController.searchBooks(search);
    }

    res.render('explore', { books, user: req.user });
});

// Display bookview page
router.get('/Explore/bookView', async (req, res) => {
    const isbn = req.query.isbn;
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = `SELECT * FROM Books WHERE isbn = ?`;
        let [row] = await conn.query(sql, [isbn]);
        let inShelf = false;
        if(req.user) {
            inShelf = await bookController.checkShelf(isbn, req.user.user_id)
        }
        console.log(row[0]);
        res.render('bookview', {'book': row[0], user: req.user, inShelf});
    } finally {
        conn.release();
    }   
});

router.post('/shelf/new', async (req, res) => {
    let conn;
    let user_id = req.body.user_id;
    let isbn = req.body.isbn;
    let status = "To Read";
    try {
        conn = await pool.getConnection();
        let sql = `INSERT INTO UserBooks (user_id, isbn, status)
                   VALUES (?, ?, ?)`;
        let params = [user_id, isbn, status];
        let [row] = await conn.query(sql, params);
        res.redirect(`/Explore/bookView?isbn=${isbn}`);
    } finally {
        conn.release();
    }  
})

export default router;