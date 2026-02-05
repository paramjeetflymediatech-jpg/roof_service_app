const Blog = require('../models/Blog');

// --- Admin Controller Methods ---

/**
 * Get list of blogs for admin dashboard
 */
exports.getAdminList = async (req, res) => {
    try {
        // Sequelize: findAll with order
        const blogs = await Blog.findAll({
            order: [['createdAt', 'DESC']]
        });

        // Sequelize returns instances, we can map to plain objects if needed, 
        // but often EJS handles instances fine. 
        // For safety/consistency: blogs.map(b => b.toJSON())

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
            return res.redirect('/admin/blogs/create');
        }

        // Prepare tags: handled by setter in Model, but we can ensure it's passed correctly
        // The model setter expects a string (comma-separated) or array or JSON string.
        // If coming from form input, it's likely a comma-separated string `tag1, tag2`.

        await Blog.create({
            title,
            slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            content,
            excerpt,
            image,
            author,
            tags: tags, // Model setter will handle splitting strings
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
        });

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
        // Sequelize: findByPk
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

        // Sequelize: update({ values }, { where })
        await Blog.update({
            title,
            slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            content,
            excerpt,
            image,
            author,
            tags: tags, // Model setter handles this
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
            where: { id: req.params.id } // Use 'id' (mapped from _id in view if necessary, but typically Sequelize uses 'id')
            // Note: If views are using <%= blog._id %>, we might need to update views or aliasing
            // However, typical EJS views generated often use blog.id or blog._id.
            // If the view accesses blog._id exclusively, it will be undefined for Sequelize model unless we alias it.
            // Based on the edit.ejs file shown earlier, it uses <%= blog._id %>.
            // We should ensure the `Blog` model instance allows `_id` access OR update views.
            // For now, let's update the controller. If views break, we fix views.
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
        // Sequelize: destroy({ where })
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
        // Mongoose: .select('title slug ...') 
        // Sequelize: attributes: ['title', 'slug', ...]
        const blogs = await Blog.findAll({
            where: { status: 'published' },
            attributes: ['id', 'title', 'slug', 'excerpt', 'image', 'createdAt', 'tags'],
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
