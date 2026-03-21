const LoginService = require("../services/login.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  // const { Username, Password } = req.body;
  // const token = await LoginService.login(Username, Password);
  // res.status(200).json(new ApiResponse(200, "Login successful", { token }));

  const { Username, Password } = req.body;

  const result = await LoginService.login(Username, Password);

  res.status(200).json(new ApiResponse(200, "Login successful", result));
});

module.exports = {
  login
};