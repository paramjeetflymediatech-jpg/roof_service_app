const { Blog } = require('../models');

// --- Admin Controller Methods ---

/**
 * Get list of blogs for admin dashboard
 */
exports.getAdminList = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.render('admin/blogs/list', {
            title: 'Manage Blogs',
            path: '/admin/blogs',
            blogs,
            user: req.session.user || { name: 'Admin', role: 'admin' }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).render('error', { message: 'Error fetching blogs' });
    }
};

/**
 * Get create blog page
 */
exports.getCreate = (req, res) => {
    res.render('admin/blogs/create', {
        title: 'Create New Blog',
        path: '/admin/blogs',
        user: req.session.user || { name: 'Admin', role: 'admin' }
    });
};

/**
 * Handle create blog submission
 */
exports.postCreate = async (req, res) => {
    try {
        const { title, slug, content, excerpt, image, author, tags, status, metaTitle, metaDescription, metaRobots, ogTitle, ogDescription, ogImage, canonicalUrl, schemaMarkup, googleAnalyticsId, googleTagManagerId } = req.body;

        // Basic validation
        if (!title || !slug || !content) {
            // In a real app, you'd flash an error message
            return res.redirect('/admin/blogs/create');
        }

        const blogData = {
            title,
            slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            content,
            excerpt,
            image,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status,
            metaTitle,
            metaDescription,
            metaRobots,
            ogTitle,
            ogDescription,
            ogImage,
            canonicalUrl,
            schemaMarkup,
            googleAnalyticsId,
            googleTagManagerId
        };

        await Blog.create(blogData);
        res.redirect('/admin/blogs');
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).send('Error creating blog');
    }
};

/**
 * Get edit blog page
 */
exports.getEdit = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) {
            return res.redirect('/admin/blogs');
        }
        res.render('admin/blogs/edit', {
            title: 'Edit Blog',
            path: '/admin/blogs',
            blog,
            user: req.session.user || { name: 'Admin', role: 'admin' }
        });
    } catch (error) {
        console.error('Error fetching blog for edit:', error);
        res.redirect('/admin/blogs');
    }
};

/**
 * Handle update blog submission
 */
exports.postUpdate = async (req, res) => {
    try {
        const { title, slug, content, excerpt, image, author, tags, status, metaTitle, metaDescription, metaRobots, ogTitle, ogDescription, ogImage, canonicalUrl, schemaMarkup, googleAnalyticsId, googleTagManagerId } = req.body;

        await Blog.update({
            title,
            slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            content,
            excerpt,
            image,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status,
            metaTitle,
            metaDescription,
            metaRobots,
            ogTitle,
            ogDescription,
            ogImage,
            canonicalUrl,
            schemaMarkup,
            googleAnalyticsId,
            googleTagManagerId
        }, {
            where: { id: req.params.id }
        });

        res.redirect('/admin/blogs');
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('Error updating blog');
    }
};

/**
 * Delete blog
 */
exports.delete = async (req, res) => {
    try {
        await Blog.destroy({
            where: { id: req.params.id }
        });
        res.redirect('/admin/blogs');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).send('Error deleting blog');
    }
};

// --- API Controller Methods (for Frontend) ---

/**
 * Get all published blogs
 */
exports.getApiList = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { status: 'published' },
            attributes: ['title', 'slug', 'excerpt', 'image', 'createdAt', 'tags'],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: blogs.length, data: blogs });
    } catch (error) {
        console.error('API Error fetching blogs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get single blog by slug
 */
exports.getApiDetail = async (req, res) => {
    try {
        const blog = await Blog.findOne({
            where: {
                slug: req.params.slug,
                status: 'published'
            }
        });

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        res.json({ success: true, data: blog });
    } catch (error) {
        console.error('API Error fetching blog detail:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
