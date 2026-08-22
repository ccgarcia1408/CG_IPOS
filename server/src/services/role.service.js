const RoleModel = require("../models/role.model");
const ApiError = require("../utils/ApiError");

const RoleService = {
    async getRoles() {
        return await RoleModel.getAll();
    },

    async getActiveRoles() {
        return await RoleModel.getAllActive();
    },

    async getRoleById(roleId) {
        const role = await RoleModel.findById(roleId);

        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        return role;
    },
};

module.exports = RoleService;
