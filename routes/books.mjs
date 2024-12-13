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

// books.mjs
router.get('/Shelf', async (req, res) => {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
  
    const userId = req.user.user_id;
    const readBooks = await bookController.getReadBooks(userId);
    const unreadBooks = await bookController.getUnreadBooks(userId);
    const userShelf = await bookController.getUserShelf(userId); // Fetch user's shelf

    // Convert userShelf to a Set for faster lookup
    const userShelfIsbns = new Set(userShelf.map(book => book.isbn));

    res.render('shelf', { readBooks, unreadBooks, userShelfIsbns });
  });

router.post('/remove/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const index = shelf.indexOf(isbn);
    if (index > -1) {
        shelf.splice(index, 1); // Remove the book
        res.status(200).send(`Book with ISBN ${isbn} removed from shelf.`);
    } else {
        res.status(404).send(`Book with ISBN ${isbn} not found on shelf.`);
    }
});

router.post('/shelf/remove/:isbn', async (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the URL
    const userId = req.body.user_id; // Get the user ID from the form data

    try {
        await removeBookFromUserBooks(userId, isbn); // Await the removal function
        res.redirect('/shelf'); // Redirect back to the shelf page after removal
    } catch (err) {
        console.error(err);
        res.status(500).send('Error removing book from shelf');
    }
});


async function removeBookFromUserBooks(userId, isbn) {
    const conn = await pool.getConnection(); // Await the connection
    try {
        const query = 'DELETE FROM UserBooks WHERE user_id = ? AND isbn = ?';
        const [results] = await conn.query(query, [userId, isbn]); // Use await for the query
        return results; // Return the results
    } catch (error) {
        throw error; // Throw the error to be caught in the route handler
    } finally {
        conn.release(); // Ensure the connection is released
    }
}

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
