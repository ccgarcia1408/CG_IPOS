const LoginModel = require("../models/login.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const LoginService = {
    async login(username, password) {
        const user = await LoginModel.findByUsername(username);

        if (!user) {
            throw new ApiError(401, "Invalid username or password");
        }

        const isMatch = await bcrypt.compare(password, user.Password);

        if (!isMatch) {
            throw new ApiError(401, "Invalid username or password");
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.UserId }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return token;
    }
};

module.exports = LoginService;