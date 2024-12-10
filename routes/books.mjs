import { Router } from 'express';
import * as bookController from '../controllers/bookController.mjs';
import pool from '../config/db.mjs';
import { spawn } from 'child_process';

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
        res.render('bookview', {'book': row[0], user: req.user, inShelf});
    } finally {
        conn.release();
    }   
});

// Add book to UserBooks Table
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
});

// Local API to display book info for modal
router.get('/Explore/api/edit/:id', async (req, res) => {
    const isbn = req.params.id;
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = `SELECT * FROM Books WHERE isbn = ?`;
        let [row] = await conn.query(sql, [isbn]);
        res.send({'book': row[0], user: req.user});
    } finally {
        conn.release();
    }   
});

// Edit book in Books table
router.post("/book/edit", async function(req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        let sql = `UPDATE Books
                   SET title = ?,
                        author = ?,
                        genre = ?,
                        description = ?,
                        rating = ?,
                        image = ?
                   WHERE isbn = ?`;
        let params = [req.body.title, req.body.author, 
                      req.body.genre, req.body.description,
                      req.body.rating, req.body.image,
                      req.body.isbn];
        const[rows] = await conn.query(sql, params);
        res.redirect(`/Explore/bookView?isbn=${req.body.isbn}`);
    } finally {
        conn.release();
    }   
});

// Delete book in Books table
router.get("/book/delete", async function(req, res){
    let conn;
    try {
        conn = await pool.getConnection();
        let isbn = req.query.isbn;  
        let sql = `DELETE
                   FROM Books
                   WHERE isbn = ?`;
        const [rows] = await conn.query(sql, [isbn]);
        res.redirect("/Explore");
    } finally {
        conn.release()
    }
    
});

export default router;