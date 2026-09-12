import RoleModel from "../models/role.model";
import ApiError from "../utils/ApiError";

const RoleService = {
    async getRoles() {
        return await RoleModel.getAll();
    },

    async getActiveRoles() {
        return await RoleModel.getAllActive();
    },

    async getRoleById(roleId: any) {
        const role = await RoleModel.findById(roleId);

        if (!role) {
            throw new ApiError(404, "Role not found");
        }

        return role;
    },
};

export default RoleService;
