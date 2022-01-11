const { validationResult } = require("express-validator");

const errorsValidate = (data) => {
  const errors = validationResult(data);
  const errorsArray = errors.array();
  const validationErrors = errorsArray.reduce((acc, item) => {
    acc[item.param] = true;
    return acc;
  }, {});
  const isEmpty = errors.isEmpty();
  return { errorsArray, validationErrors, isEmpty };
};

module.exports = errorsValidate;
