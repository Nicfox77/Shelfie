export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
};

export const ensureAdmin = (req, res, next) =>
{
    if (req.isAuthenticated())
    {
        // Check if user is admin (user_type === 1)
        if (req.user && req.user.user_type === 1)
        {
            return next();
        }
        // If authenticated but not admin, redirect to explore
        req.flash('error_msg', 'You do not have permission to view this page');
        return res.redirect('/explore');
    }
    // If not authenticated at all
    req.flash('error_msg', 'Please log in to view this resource');
    return res.redirect('/login');
};