import { Router } from 'express';
import { searchBooks } from '../controllers/bookController.mjs';
import pool from '../config/db.mjs';

const router = Router();

// Explore Page Route
router.get('/Explore', async (req, res) => {
    const search = req.query.search || ""; // Get 'search' query parameter
    let books = [];

    if (search) {
        // Fetch books if a search term is provided
        books = await searchBooks(search);
    }

    res.render('explore', { books, user: req.user });
});

router.get('/Explore/bookView', async (req, res) => {
    const isbn = req.query.isbn;
    let rows = [];
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = `SELECT * 
                        FROM Books
                        WHERE isbn = ?`;
        let [row] = await conn.query(sql, [isbn]);
    
        res.render('bookview', {'book': row[0]});
    } finally {
        conn.release();
    }
    
});

export default router;