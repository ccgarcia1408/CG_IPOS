import MenuService from "../services/menu.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getMenus = asyncHandler(async (req, res) => {
    const { RoleId } = req.query;

    const menus = await MenuService.getMenus(RoleId);

    res.status(200).json(
        new ApiResponse(200, "Menus fetched successfully", menus)
    );
});

export {
    getMenus,
};