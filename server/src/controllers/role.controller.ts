import RoleService from "../services/role.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getRoles = asyncHandler(async (req, res) => {
    const roles = await RoleService.getRoles();
    res.status(200).json(new ApiResponse(200, "Roles fetched successfully", roles));
});

const getActiveRoles = asyncHandler(async (req, res) => {
    const roles = await RoleService.getActiveRoles();
    res.status(200).json(new ApiResponse(200, "Active roles fetched successfully", roles));
});

const getRoleById = asyncHandler(async (req, res) => {
    const { roleId } = req.params;
    const role = await RoleService.getRoleById(roleId);
    res.status(200).json(new ApiResponse(200, "Role fetched successfully", role));
});

export {
    getRoles,
    getActiveRoles,
    getRoleById,
};
