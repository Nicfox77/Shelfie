import { Router } from 'express';
import { searchBooks } from '../controllers/bookController.mjs';

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


export default router;