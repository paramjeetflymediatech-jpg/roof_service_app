const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error', 'Please login to access this page');
    res.redirect('/admin/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userRole === 'admin') {
        return next();
    }
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/admin/login');
};

module.exports = { isAuthenticated, isAdmin };
