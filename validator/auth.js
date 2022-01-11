const User = require("../models/user");
const bcrypt = require("bcrypt");

const { body } = require("express-validator");
exports.validateLogin = [
  body("email", "Please enter a valid email").isEmail().normalizeEmail(),
  body(
    "password",
    "Please enter a password with only numbers and text, at least 6 characters"
  )
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) throw new Error("User not found");
        const isTruePassword = await bcrypt.compare(value, user.password);
        if (!isTruePassword) throw new Error("Wrong password");
        req.session.user = user;
        req.session.isLoggedIn = true;
        return true;
      } catch (error) {
        throw new Error(error.message || "There's something went wrong");
      }
    }),
];
exports.validateSignup = [
  body("email", "Please enter a valid email")
    .isEmail()
    .custom(async (val) => {
      try {
        const emailExist = await User.findOne({ email: val });
        if (emailExist)
          throw new Error("Email already exist, please pick a different one");
        return true;
      } catch (error) {
        throw new Error(error.message || "There's something went wrong");
      }
    })
    .normalizeEmail(),
  body("name", "Enter your name").trim().isLength({ min: 1 }).isString(),
  body(
    "password",
    "Please enter a password with only numbers and text, at least 6 characters"
  )
    .trim()
    .isLength({ min: 6 })
    .isAlphanumeric(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Password have to match!");
      return true;
    }),
];
