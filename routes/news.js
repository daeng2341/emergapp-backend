const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const newsController = require('../controllers/newsController');

// Get all news and advisories
router.get('/', newsController.getNews);

// Create new news/advisory (authorities only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Not authorized to create news/advisories' });
  }
  newsController.createNews(req, res);
});

// Update news/advisory
router.put('/:id', auth, newsController.updateNews);

// Delete news/advisory
router.delete('/:id', auth, newsController.deleteNews);

// Get news by ID
router.get('/:id', newsController.getNewsById);

module.exports = router; 