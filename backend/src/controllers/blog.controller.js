const { Blog } = require('../models');

// --- Admin Controller Methods ---

/**
 * Get list of blogs for admin dashboard
 */
exports.getAdminList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: blogs } = await Blog.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.render('admin/blogs/list', {
            title: 'Manage Blogs',
            path: '/admin/blogs',
            blogs,
            currentPage: page,
            totalPages,
            totalItems: count,
            limit,
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
            return res.status(400).send('Missing required fields: title, slug, or content');
        }

        const generateUniqueSlug = async (baseSlug) => {
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await Blog.findOne({ where: { slug: uniqueSlug } })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            return uniqueSlug;
        };

        const baseSlug = slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const uniqueSlug = await generateUniqueSlug(baseSlug);

        const blogData = {
            title,
            slug: uniqueSlug,
            content,
            excerpt,
            image,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
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
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('Error: A blog with this slug already exists.');
        }
        res.status(500).send('Error creating blog: ' + error.message);
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

        const generateUniqueSlug = async (baseSlug, currentId) => {
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (true) {
                const existingBlog = await Blog.findOne({ where: { slug: uniqueSlug } });
                if (!existingBlog || existingBlog.id === parseInt(currentId)) {
                    break;
                }
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            return uniqueSlug;
        };

        const baseSlug = slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const uniqueSlug = await generateUniqueSlug(baseSlug, req.params.id);

        await Blog.update({
            title,
            slug: uniqueSlug,
            content,
            excerpt,
            image,
            author,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
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
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send('Error: A blog with this slug already exists.');
        }
        res.status(500).send('Error updating blog: ' + error.message);
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: blogs } = await Blog.findAndCountAll({
            where: { status: 'published' },
            attributes: ['title', 'slug', 'excerpt', 'image', 'createdAt', 'tags'],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            count: blogs.length,
            data: blogs,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(count / limit),
                totalItems: count
            }
        });
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
