const ApiError = require("../utils/ApiError");

// First route guard in the app that actually enforces a role check server-side (existing
// "admin-only" pages are only hidden from the sidebar via menu_roles, never blocked at the API).
// Used for destructive, whole-database operations where sidebar-only gating isn't enough.
const ADMIN_ROLE_ID = 1;

const requireAdminMiddleware = (req, res, next) => {
    if (Number(req.user?.RoleId) !== ADMIN_ROLE_ID) {
        return next(new ApiError(403, "Administrator access is required."));
    }
    next();
};

module.exports = requireAdminMiddleware;
