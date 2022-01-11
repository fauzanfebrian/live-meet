const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    res.locals.path = req.originalUrl.split("?")[0];
    res.locals.errorMessage = req.flash("error")[0];
    res.locals.successMessage = req.flash("success")[0];
    req.user = await User.findById(req.session?.user?._id);
    next();
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
