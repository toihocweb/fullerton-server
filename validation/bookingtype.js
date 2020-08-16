const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateBookingTypeInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.identitor = !isEmpty(data.identitor) ? data.identitor : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (Validator.isEmpty(data.identitor)) {
    errors.identitor = "Identitor field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
