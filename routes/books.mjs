import { Router } from 'express';
import { searchBooks } from '../controllers/bookController.mjs';

const router = Router();

// Explore Page Route
router.get('/Explore', async (req, res) =>
{
    try
    {
        const search = req.query.search || ""; // Get 'search' query parameter
        let books = [];

        if (search)
        {
            // Fetch books if a search term is provided
            books = await searchBooks(search);
        }

        res.render('explore', { books, search });
    } catch (error)
    {
        console.error('Error in explore route:', error);
        res.render('explore', {
            books: [],
            search: '',
            error: 'An error occurred while searching for books'
        });
    }
});

export default router;