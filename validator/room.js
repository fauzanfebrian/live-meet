const { body } = require("express-validator");

exports.createRoom = [
  body("roomName", "Fill room name field, at least 5 characters")
    .trim()
    .replace(/[/[^a-z0-9-_!@#$%&*()+=?/><:;,.\\'"\[\] ]/gi, "")
    .isString()
    .isLength({ min: 5 }),
  body(
    "password",
    "Enter password at least 5 characters, and just with alphabet & number"
  )
    .trim()
    .isAlphanumeric()
    .isLength({ min: 5 }),
  body("size", "Enter the size field with valid number").isNumeric(),
];
exports.editRoom = [
  body("roomName", "Fill room name field, at least 5 characters")
    .trim()
    .replace(/[/[^a-z0-9-_!@#$%&*()+=?/><:;,.\\'"\[\] ]/gi, "")
    .isString()
    .isLength({ min: 5 }),
  body("size", "Enter the size field with valid number").isNumeric(),
];
