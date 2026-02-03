const { User, Lead, Service, SeoMeta } = require('../models');

// GET /admin/login - Render login page
const getLogin = (req, res) => {
    console.log(req.session,'session')
    if (req.session && req.session.userId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: 'Admin Login'
    });
};

// POST /admin/login - Handle login
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Please provide email and password');
            return res.redirect('/admin/login');
        }

        const user = await User.findOne({ where: { email, isActive: true } });

        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/admin/login');
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/admin/login');
        }

        if (user.role !== 'admin') {
            req.flash('error', 'Access denied. Admin privileges required.');
            return res.redirect('/admin/login');
        }

        // Set session
        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.userName = user.name;

        console.log('Login - Setting Session:', req.sessionID);
        console.log('Login - User ID set:', user.id);

        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error', 'An error occurred during login');
                return res.redirect('/admin/login');
            }
            console.log('Login - Session saved successfully');
            req.flash('success', 'Login successful');
            res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/admin/login');
    }
};

// GET /admin/dashboard - Render dashboard
const getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalLeads = await Lead.count();
        const newLeads = await Lead.count({ where: { status: 'new' } });
        const inProgressLeads = await Lead.count({ where: { status: 'in_progress' } });

        res.render('admin/dashboard', {
            title: 'Dashboard',
            userName: req.session.userName,
            stats: {
                totalUsers,
                totalLeads,
                newLeads,
                inProgressLeads,
            },
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/admin/login');
    }
};

// GET /admin/logout - Handle logout
const getLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
};

// GET /admin/users - Render user list with pagination
const getUserList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const totalUsers = await User.count();
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            raw: true,
        });

        const totalPages = Math.ceil(totalUsers / limit);

        res.render('admin/users/list', {
            title: 'User List',
            userName: req.session.userName,
            users,
            currentPage: page,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error('User list error:', error);
        req.flash('error', 'Error loading user list');
        res.redirect('/admin/dashboard');
    }
};

// GET /admin/leads - Render lead list with pagination
const getLeadList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const totalLeads = await Lead.count();
        const leads = await Lead.findAll({
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            raw: true,
        });

        const totalPages = Math.ceil(totalLeads / limit);

        res.render('admin/leads/list', {
            title: 'Lead List',
            userName: req.session.userName,
            leads,
            currentPage: page,
            totalPages,
            totalLeads,
        });
    } catch (error) {
        console.error('Lead list error:', error);
        req.flash('error', 'Error loading lead list');
        res.redirect('/admin/dashboard');
    }
};

// GET /admin/leads/create - Render create lead form
const getCreateLead = (req, res) => {
    res.render('admin/leads/create', {
        title: 'Add New Lead',
        userName: req.session.userName,
    });
};

// POST /admin/leads - Create new lead
const postCreateLead = async (req, res) => {
    try {
        const { name, email, phone, leadType, address, city, serviceType, status, message } = req.body;

        if (!name) {
            req.flash('error', 'Name is required');
            return res.redirect('/admin/leads/create');
        }

        await Lead.create({
            name,
            email,
            phone,
            leadType,
            address,
            city,
            serviceType,
            status: status || 'new',
            message,
            source: 'other' // Manual entry
        });

        req.flash('success', 'Lead created successfully');
        res.redirect('/admin/leads');
    } catch (error) {
        console.error('Create lead error:', error);
        req.flash('error', 'Error creating lead');
        res.redirect('/admin/leads/create');
    }
};

// GET /admin/leads/:id/edit - Render edit lead form
const getEditLead = async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);

        if (!lead) {
            req.flash('error', 'Lead not found');
            return res.redirect('/admin/leads');
        }

        res.render('admin/leads/edit', {
            title: 'Edit Lead',
            userName: req.session.userName,
            lead: lead.dataValues || lead,
        });
    } catch (error) {
        console.error('Edit lead error:', error);
        req.flash('error', 'Error loading lead');
        res.redirect('/admin/leads');
    }
};

// POST /admin/leads/:id - Update lead
const postUpdateLead = async (req, res) => {
    try {
        const { name, email, phone, leadType, address, city, serviceType, status, message } = req.body;
        const leadId = req.params.id;

        const lead = await Lead.findByPk(leadId);
        if (!lead) {
            req.flash('error', 'Lead not found');
            return res.redirect('/admin/leads');
        }

        await Lead.update({
            name,
            email,
            phone,
            leadType,
            address,
            city,
            serviceType,
            status,
            message,
        }, { where: { id: leadId } });

        req.flash('success', 'Lead updated successfully');
        res.redirect('/admin/leads');
    } catch (error) {
        console.error('Update lead error:', error);
        req.flash('error', 'Error updating lead');
        res.redirect(`/admin/leads/${req.params.id}/edit`);
    }
};

// POST /admin/leads/:id/delete - Delete lead
const deleteLead = async (req, res) => {
    try {
        const leadId = req.params.id;
        const lead = await Lead.findByPk(leadId);

        if (!lead) {
            req.flash('error', 'Lead not found');
            return res.redirect('/admin/leads');
        }

        await Lead.destroy({ where: { id: leadId } });

        req.flash('success', 'Lead deleted successfully');
        res.redirect('/admin/leads');
    } catch (error) {
        console.error('Delete lead error:', error);
        req.flash('error', 'Error deleting lead');
        res.redirect('/admin/leads');
    }
};

// POST /admin/leads/delete-all - Delete all leads
const deleteAllLeads = async (req, res) => {
    try {
        await Lead.destroy({ where: {} });
        req.flash('success', 'All leads deleted successfully');
        res.redirect('/admin/leads');
    } catch (error) {
        console.error('Delete all leads error:', error);
        req.flash('error', 'Error deleting all leads');
        res.redirect('/admin/leads');
    }
};

// GET /admin/users/create - Render create user form
const getCreateUser = (req, res) => {
    res.render('admin/users/create', {
        title: 'Create User',
        userName: req.session.userName,
    });
};

// POST /admin/users - Create new user
const postCreateUser = async (req, res) => {
    try {
        const { name, email, password, role, isActive, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            req.flash('error', 'Name, email, and password are required');
            return res.redirect('/admin/users/create');
        }

        if (name.length < 3) {
            req.flash('error', 'Name must be at least 3 characters long');
            return res.redirect('/admin/users/create');
        }

        if (phone && phone.length > 16) {
            req.flash('error', 'Phone cannot exceed 16 characters');
            return res.redirect('/admin/users/create');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect('/admin/users/create');
        }

        // Check if phone already exists
        if (phone) {
            if (!/^\d+$/.test(phone)) {
                req.flash('error', 'Phone number must contain only numbers');
                return res.redirect('/admin/users/create');
            }
            const existingPhone = await User.findOne({ where: { phone } });
            if (existingPhone) {
                req.flash('error', 'Phone number already exists');
                return res.redirect('/admin/users/create');
            }
        }

        // Create new user
        await User.create({
            name,
            email,
            password, // Will be hashed by pre-save hook
            role: role || 'user',
            isActive: isActive === 'on' ? true : false,
            phone,
        });

        req.flash('success', 'User created successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Create user error:', error);
        req.flash('error', 'Error creating user');
        res.redirect('/admin/users/create');
    }
};

// GET /admin/users/:id/edit - Render edit user form
const getEditUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        res.render('admin/users/edit', {
            title: 'Edit User',
            userName: req.session.userName,
            user: user.dataValues || user,
        });
    } catch (error) {
        console.error('Edit user error:', error);
        req.flash('error', 'Error loading user');
        res.redirect('/admin/users');
    }
};

// POST /admin/users/:id - Update user
const postUpdateUser = async (req, res) => {
    try {
        const { name, email, password, role, isActive, phone } = req.body;
        const userId = req.params.id;

        // Validation
        if (!name || !email) {
            req.flash('error', 'Name and email are required');
            return res.redirect(`/admin/users/${userId}/edit`);
        }

        if (name.length < 3) {
            req.flash('error', 'Name must be at least 3 characters long');
            return res.redirect(`/admin/users/${userId}/edit`);
        }

        if (phone && phone.length > 16) {
            req.flash('error', 'Phone cannot exceed 16 characters');
            return res.redirect(`/admin/users/${userId}/edit`);
        }

        // Check if email already exists (excluding current user)
        const existingUser = await User.findOne({ where: { email, id: { [require('sequelize').Op.ne]: userId } } });
        if (existingUser) {
            req.flash('error', 'Email already exists');
            return res.redirect(`/admin/users/${userId}/edit`);
        }

        // Check if phone already exists (excluding current user)
        if (phone) {
            if (!/^\d+$/.test(phone)) {
                req.flash('error', 'Phone number must contain only numbers');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
            const existingPhone = await User.findOne({ where: { phone, id: { [require('sequelize').Op.ne]: userId } } });
            if (existingPhone) {
                req.flash('error', 'Phone number already exists');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
        }

        // Find and update user
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }
 
        const updateData = {
            name,
            email,
            role: role || 'user',
            isActive: isActive === 'on' ? true : false,
            phone,
        };

        // Only update password if provided
        if (password && password.trim() !== '') {
            updateData.password = password; // Will be hashed by pre-save hook
        }

        await User.update(updateData, { where: { id: userId } });

        req.flash('success', 'User updated successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Update user error:', error);
        req.flash('error', 'Error updating user');
        res.redirect(`/admin/users/${req.params.id}/edit`);
    }
};

// POST /admin/users/:id/delete - Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting self
        if (userId === req.session.userId) {
            req.flash('error', 'Cannot delete your own account');
            return res.redirect('/admin/users');
        }

        const user = await User.findByPk(userId);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        await User.destroy({ where: { id: userId } });

        req.flash('success', 'User deleted successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Delete user error:', error);
        req.flash('error', 'Error deleting user');
        res.redirect('/admin/users');
    }
};

// POST /admin/users/delete-all - Delete all users except current
const deleteAllUsers = async (req, res) => {
    try {
        const currentUserId = req.session.userId;

        // Delete all users except the current admin
        await User.destroy({ where: { id: { [require('sequelize').Op.ne]: currentUserId } } });

        req.flash('success', 'All users deleted successfully (except yourself)');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Delete all users error:', error);
        req.flash('error', 'Error deleting users');
        res.redirect('/admin/users');
    }
};

// GET /admin/seo - Render SEO list
const getSeoList = async (req, res) => {
    try {
        const seoPages = await SeoMeta.findAll({
            order: [['pageName', 'ASC']],
            raw: true,
        });

        res.render('admin/seo/list', {
            title: 'SEO Management',
            userName: req.session.userName,
            seoPages,
        });
    } catch (error) {
        console.error('SEO list error:', error);
        req.flash('error', 'Error loading SEO list');
        res.redirect('/admin/dashboard');
    }
};

// GET /admin/seo/create - Render create SEO form
const getCreateSeo = (req, res) => {
    res.render('admin/seo/create', {
        title: 'Add New SEO Page',
        userName: req.session.userName,
    });
};

// POST /admin/seo - Create new SEO page
const postCreateSeo = async (req, res) => {
    try {
        const {
            pageName,
            pageTitle,
            metaDescription,
            metaRobots,
            ogTitle,
            ogDescription,
            ogImage,
            canonicalUrl,
            schemaMarkup,
            googleAnalyticsId,
            googleTagManagerId,
        } = req.body;

        // Validation
        if (!pageName || !pageTitle || !metaDescription) {
            req.flash('error', 'Page name, title, and description are required');
            return res.redirect('/admin/seo/create');
        }

        // Check if page already exists
        const existingPage = await SeoMeta.findOne({ where: { pageName: pageName.toLowerCase() } });
        if (existingPage) {
            req.flash('error', 'SEO for this page already exists');
            return res.redirect('/admin/seo/create');
        }

        // Create new SEO entry
        await SeoMeta.create({
            pageName: pageName.toLowerCase(),
            pageTitle,
            metaDescription,
            metaRobots: metaRobots || 'index, follow',
            ogTitle: ogTitle || pageTitle,
            ogDescription: ogDescription || metaDescription,
            ogImage: ogImage || '',
            canonicalUrl: canonicalUrl || '',
            schemaMarkup: schemaMarkup || '',
            googleAnalyticsId: googleAnalyticsId || '',
            googleTagManagerId: googleTagManagerId || '',
        });

        req.flash('success', 'SEO page created successfully');
        res.redirect('/admin/seo');
    } catch (error) {
        console.error('Create SEO error:', error);
        req.flash('error', 'Error creating SEO page');
        res.redirect('/admin/seo/create');
    }
};

// GET /admin/seo/:id/edit - Render edit SEO form
const getEditSeo = async (req, res) => {
    try {
        const seoPage = await SeoMeta.findByPk(req.params.id);

        if (!seoPage) {
            req.flash('error', 'SEO page not found');
            return res.redirect('/admin/seo');
        }

        res.render('admin/seo/edit', {
            title: 'Edit SEO Meta Tags',
            userName: req.session.userName,
            seoPage: seoPage.dataValues || seoPage,
        });
    } catch (error) {
        console.error('Edit SEO error:', error);
        req.flash('error', 'Error loading SEO page');
        res.redirect('/admin/seo');
    }
};

// POST /admin/seo/:id - Update SEO meta tags
const postUpdateSeo = async (req, res) => {
    try {
        const {
            pageTitle,
            metaDescription,
            metaRobots,
            ogTitle,
            ogDescription,
            ogImage,
            canonicalUrl,
            schemaMarkup,
            googleAnalyticsId,
            googleTagManagerId,
        } = req.body;
        const seoId = req.params.id;

        // Validation
        if (!pageTitle || !metaDescription) {
            req.flash('error', 'Page title and meta description are required');
            return res.redirect(`/admin/seo/${seoId}/edit`);
        }

        // Find and update SEO page
        const seoPage = await SeoMeta.findByPk(seoId);
        if (!seoPage) {
            req.flash('error', 'SEO page not found');
            return res.redirect('/admin/seo');
        }

        await SeoMeta.update({
            pageTitle,
            metaDescription,
            metaRobots: metaRobots || 'index, follow',
            ogTitle: ogTitle || pageTitle,
            ogDescription: ogDescription || metaDescription,
            ogImage: ogImage || '',
            canonicalUrl: canonicalUrl || '',
            schemaMarkup: schemaMarkup || '',
            googleAnalyticsId: googleAnalyticsId || '',
            googleTagManagerId: googleTagManagerId || '',
        }, { where: { id: seoId } });

        req.flash('success', 'SEO meta tags updated successfully');
        res.redirect('/admin/seo');
    } catch (error) {
        console.error('Update SEO error:', error);
        req.flash('error', 'Error updating SEO meta tags');
        res.redirect(`/admin/seo/${req.params.id}/edit`);
    }
};

// POST /admin/seo/:id/delete - Delete SEO page
const deleteSeo = async (req, res) => {
    try {
        const seoId = req.params.id;
        const seoPage = await SeoMeta.findByPk(seoId);

        if (!seoPage) {
            req.flash('error', 'SEO page not found');
            return res.redirect('/admin/seo');
        }

        await SeoMeta.destroy({ where: { id: seoId } });

        req.flash('success', 'SEO page deleted successfully');
        res.redirect('/admin/seo');
    } catch (error) {
        console.error('Delete SEO error:', error);
        req.flash('error', 'Error deleting SEO page');
        res.redirect('/admin/seo');
    }
};

module.exports = {
    getLogin,
    postLogin,
    getDashboard,
    getLogout,
    getUserList,
    getLeadList,
    getCreateLead,
    postCreateLead,
    getEditLead,
    postUpdateLead,
    deleteLead,
    deleteAllLeads,
    getCreateUser,
    postCreateUser,
    getEditUser,
    postUpdateUser,
    deleteUser,
    deleteAllUsers,
    getSeoList,
    getCreateSeo,
    postCreateSeo,
    getEditSeo,
    postUpdateSeo,
    deleteSeo,
};
