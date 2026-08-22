const fs = require("fs");
const path = require("path");
const UserModel = require("../models/user.model");
const EmployeeModel = require("../models/employee.model");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const { PROFILE_PICTURES_DIR } = require("../middlewares/upload.middleware");

// sp_users_create/update/delete raise business errors via SIGNAL SQLSTATE '45000', which
// mysql2 surfaces as a generic Error (no statusCode). Translate the known messages to the
// correct HTTP status instead of letting them fall through to a bare 500.
const KNOWN_SIGNAL_STATUSES = {
  "Email already exists.": 409,
  "Username already exists.": 409,
  "User not found.": 404,
  "Selected role is invalid or inactive.": 400,
  "User not found or already deleted.": 404
};

function translateSignalError(error) {
  const statusCode = KNOWN_SIGNAL_STATUSES[error.sqlMessage || error.message];
  if (statusCode) {
    return new ApiError(statusCode, error.sqlMessage || error.message);
  }
  return error;
}

const UserService = {
  async createUser(data, createdBy) {
    const existingEmail = await UserModel.findByEmail(data.Email);

    if (existingEmail) {
      throw new ApiError(409, "Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.Password, 10);

    try {
      const insertId = await UserModel.create(
        { ...data, Password: hashedPassword },
        createdBy
      );
      return await UserModel.findById(insertId);
    } catch (error) {
      throw translateSignalError(error);
    }
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

  async updateUser(userId, data, updatedBy) {
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

    const hashedPassword = data.Password ? await bcrypt.hash(data.Password, 10) : null;

    const payload = {
      FirstName: data.FirstName ?? existingUser.FirstName,
      MiddleName: data.MiddleName ?? existingUser.MiddleName,
      LastName: data.LastName ?? existingUser.LastName,
      Email: data.Email ?? existingUser.Email,
      Age: data.Age ?? existingUser.Age,
      Address: data.Address ?? existingUser.Address,
      ContactNo: data.ContactNo ?? existingUser.ContactNo,
      Username: data.Username ?? existingUser.Username,
      Password: hashedPassword,
      RoleId: data.RoleId ?? existingUser.RoleId,
      IsActive: data.IsActive ?? (existingUser.IsActive ? 1 : 0),
      IsAccountVerified: data.IsAccountVerified ?? (existingUser.IsAccountVerified ? 1 : 0)
    };

    try {
      await UserModel.update(userId, payload, updatedBy);
    } catch (error) {
      throw translateSignalError(error);
    }

    return await UserModel.findById(userId);
  },

  async deleteUser(userId, deletedBy) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    try {
      await UserModel.delete(userId, deletedBy);
    } catch (error) {
      throw translateSignalError(error);
    }

    return true;
  },

  async getUserBranches(userId) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    return await UserModel.getBranches(userId);
  },

  async updateProfilePicture(userId, file, updatedBy) {
    if (!file) throw new ApiError(400, "A profile picture file is required.");

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      fs.unlink(file.path, () => {});
      throw new ApiError(404, "User not found");
    }

    const newRelativePath = `/uploads/profile-pictures/${file.filename}`;

    try {
      const result = await EmployeeModel.updateProfilePictureByUserId(userId, newRelativePath, updatedBy);
      if (!result.Success) throw new ApiError(400, result.Message);
    } catch (error) {
      fs.unlink(file.path, () => {});
      throw error;
    }

    // Best-effort cleanup of the old file -- never block the response on this.
    if (existingUser.ProfilePicture) {
      fs.unlink(path.join(PROFILE_PICTURES_DIR, path.basename(existingUser.ProfilePicture)), () => {});
    }

    return await UserModel.findById(userId);
  },

  async updateUserBranches(userId, branchIds, updatedBy) {
    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    const result = await UserModel.replaceBranches(userId, branchIds, updatedBy);

    if (!result.Success) {
      throw new ApiError(400, result.Message);
    }

    return result;
  }
};

module.exports = UserService;