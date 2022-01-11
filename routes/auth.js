const express = require("express");

const authController = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");
const authValidation = require("../validator/auth");

const router = express.Router();

router.get("/login", isAuth(false), authController.getLogin);
router.get("/signup", isAuth(false), authController.getSignUp);

router.post(
  "/login",
  isAuth(false),
  authValidation.validateLogin,
  authController.postLogin
);
router.post(
  "/signup",
  isAuth(false),
  authValidation.validateSignup,
  authController.postSignUp
);
router.post("/logout", isAuth(true), authController.postLogout);

module.exports = router;
