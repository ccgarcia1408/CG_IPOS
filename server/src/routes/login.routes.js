const express = require("express");
const router = express.Router();

const loginController = require("../controllers/login.controller");
const validate = require("../middlewares/validate.middleware");
const {
  loginSchema
} = require("../validations/login.validation");

router.post("/", validate(loginSchema), loginController.login);

module.exports = router;