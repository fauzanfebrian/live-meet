const User = require("../models/user");
const errorsValidate = require("../utils/errorsValidate");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    oldInput: {},
    validationErrors: {},
  });
};
exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    oldInput: {},
    validationErrors: {},
  });
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy(() => res.redirect("/"));
};
exports.postSignUp = async (req, res, next) => {
  try {
    const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
    if (!isEmpty)
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        errorMessage: errorsArray[0].msg,
        oldInput: req.body,
        validationErrors,
      });

    await User.create(req.body);
    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    next(err);
  }
};
exports.postLogin = async (req, res, next) => {
  const { isEmpty, validationErrors, errorsArray } = errorsValidate(req);
  if (!isEmpty)
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      errorMessage: errorsArray[0]?.msg,
      oldInput: req.body,
      validationErrors,
    });

  res.redirect("/");
};
