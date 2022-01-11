module.exports =
  (isAuth = true) =>
  (req, res, next) => {
    if (!req.session.isLoggedIn && isAuth) return res.redirect("/login");
    else if (req.session.isLoggedIn && !isAuth) return res.redirect("/");
    next();
  };
