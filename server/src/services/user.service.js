const UserModel = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const UserService = {
  async createUser(data) {
    const existingEmail = await UserModel.findByEmail(data.Email);
    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }

    const insertId = await UserModel.create(data);
    return await UserModel.findById(insertId);
  },

  async getUsers() {
    return await UserModel.findAll();
  },

  async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  },

  async updateUser(userId, data) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    if (data.Email && data.Email !== existingUser.Email) {
      const existingEmail = await UserModel.findByEmail(data.Email);
      if (existingEmail) {
        throw new ApiError(409, "Email already exists");
      }
    }

    await UserModel.update(userId, data);
    return await UserModel.findById(userId);
  },

  async deleteUser(userId) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    await UserModel.delete(userId);
    return true;
  }
};

module.exports = UserService;