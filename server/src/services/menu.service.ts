import MenuModel from "../models/menu.model";

const MenuService = {
    async getMenus(roleId: any) {
        if (roleId !== undefined && roleId !== null && roleId !== "") {
            return await MenuModel.getByRoleId(roleId);
        }

        return await MenuModel.getAll();
    }
}

export default MenuService;

// async getMenus(roleId) {
//     const hasRoleId =
//         roleId !== undefined &&
//         roleId !== null &&
//         String(roleId).trim() !== "";

//     if (hasRoleId) {
//         return await MenuModel.getByRoleId(roleId);
//     }

//     return await MenuModel.getAll();
// }