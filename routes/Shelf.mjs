import express from 'express';
import * as bookController from '../controllers/bookController.mjs';

const router = express.Router();

router.get('/Shelf', async (req, res) => {
  const readBooks = await bookController.getReadBooks(req.user.user_id);
  const unreadBooks = await bookController.getUnreadBooks(req.user.user_id);
  res.render('shelf', { readBooks, unreadBooks });
});

export default router;