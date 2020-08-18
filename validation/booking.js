const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateBookingInput(data) {
  let errors = {};

  data.location = !isEmpty(data.location) ? data.location : "";
  data.user = !isEmpty(data.user) ? data.user : "";
  data.booking_type = !isEmpty(data.booking_type) ? data.booking_type : "";

  if (Validator.isEmpty(data.user)) {
    errors.user = "User field is required";
  }

  if (Validator.isEmpty(data.location)) {
    errors.location = "Location field is required";
  }
  if (Validator.isEmpty(data.booking_type)) {
    errors.booking_type = "Type field is required";
  }
  if (isEmpty(data.times)) {
    errors.times = "Times field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
