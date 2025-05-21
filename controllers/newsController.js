const News = require('../models/News');

// Get all news and advisories
exports.getNews = async (req, res) => {
  try {
    const news = await News.find({ isActive: true })
      .populate('author', 'name email rank department')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Error fetching news' });
  }
};

// Create new news/advisory
exports.createNews = async (req, res) => {
  try {
    const { title, content, type, priority, location, images, tags, expiresAt } = req.body;
    const news = new News({
      title,
      content,
      type,
      priority,
      location,
      images,
      tags,
      expiresAt,
      author: req.user.id,
    });

    await news.save();

    // TODO: Implement real-time notifications for new advisories

    res.status(201).json(news);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Error creating news/advisory' });
  }
};

// Update news/advisory
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, location, images, tags, isActive, expiresAt } = req.body;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Only allow updates from the author or authorities
    if (news.author.toString() !== req.user.id && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Not authorized to update this news' });
    }

    if (title) news.title = title;
    if (content) news.content = content;
    if (type) news.type = type;
    if (priority) news.priority = priority;
    if (location) news.location = location;
    if (images) news.images = images;
    if (tags) news.tags = tags;
    if (isActive !== undefined) news.isActive = isActive;
    if (expiresAt) news.expiresAt = expiresAt;

    await news.save();

    res.json(news);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Error updating news' });
  }
};

// Delete news/advisory
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Only allow deletion from the author or authorities
    if (news.author.toString() !== req.user.id && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Not authorized to delete this news' });
    }

    await news.remove();
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Error deleting news' });
  }
};

// Get news by ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id).populate('author', 'name email rank department');

    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ error: 'Error fetching news' });
  }
}; 