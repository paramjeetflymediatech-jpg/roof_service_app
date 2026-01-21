const User = require('../models/User');
const Lead = require('../models/Lead');

// GET /admin/login - Render login page
const getLogin = (req, res) => {
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

        const user = await User.findOne({ email, isActive: true });

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
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.name;

        console.log('Login - Setting Session:', req.sessionID);
        console.log('Login - User ID set:', user._id);

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
        const totalUsers = await User.countDocuments();
        const totalLeads = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({ status: 'new' });
        const inProgressLeads = await Lead.countDocuments({ status: 'in_progress' });

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
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
        const skip = (page - 1) * limit;

        const totalLeads = await Lead.countDocuments();
        const leads = await Lead.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
        const existingUser = await User.findOne({ email });
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
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                req.flash('error', 'Phone number already exists');
                return res.redirect('/admin/users/create');
            }
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password, // Will be hashed by pre-save hook
            role: role || 'user',
            isActive: isActive === 'on' ? true : false,
            phone,
        });

        await newUser.save();

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
        const user = await User.findById(req.params.id);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        res.render('admin/users/edit', {
            title: 'Edit User',
            userName: req.session.userName,
            user,
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
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
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
            const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
            if (existingPhone) {
                req.flash('error', 'Phone number already exists');
                return res.redirect(`/admin/users/${userId}/edit`);
            }
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        user.name = name;
        user.email = email;
        user.role = role || 'user';
        user.isActive = isActive === 'on' ? true : false;
        user.phone = phone;

        // Only update password if provided
        if (password && password.trim() !== '') {
            user.password = password; // Will be hashed by pre-save hook
        }

        await user.save();

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
        if (userId === req.session.userId.toString()) {
            req.flash('error', 'Cannot delete your own account');
            return res.redirect('/admin/users');
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        req.flash('success', 'User deleted successfully');
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Delete user error:', error);
        req.flash('error', 'Error deleting user');
        res.redirect('/admin/users');
    }
};

module.exports = {
    getLogin,
    postLogin,
    getDashboard,
    getLogout,
    getUserList,
    getLeadList,
    getCreateUser,
    postCreateUser,
    getEditUser,
    postUpdateUser,
    deleteUser,
};
