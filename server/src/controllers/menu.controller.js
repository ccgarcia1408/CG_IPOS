const MenuService = require("../services/menu.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getMenus = asyncHandler(async (req, res) => {
    const { RoleId } = req.query;

    const menus = await MenuService.getMenus(RoleId);

    res.status(200).json(
        new ApiResponse(200, "Menus fetched successfully", menus)
    );
});

module.exports = {
    getMenus,
};