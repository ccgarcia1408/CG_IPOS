const RoleService = require("../services/role.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

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

module.exports = {
    getRoles,
    getActiveRoles,
    getRoleById,
};
