// Reads tenant/branch scope from the verified session JWT (never from client-supplied query/
// body params) and exposes it as req.scope for downstream Services/Repositories to enforce.
// Administrator (RoleId 1) is unrestricted -- req.scope.isAdmin is true and TenantId/BranchId
// are null, meaning "no filter". Not wired into any route yet -- the next phase's dashboard/
// business endpoints apply this.
const ADMIN_ROLE_ID = 1;

const branchAccessMiddleware = (req, res, next) => {
    const isAdmin = Number(req.user?.RoleId) === ADMIN_ROLE_ID;

    req.scope = {
        isAdmin,
        TenantId: isAdmin ? null : req.user?.TenantId ?? null,
        BranchId: isAdmin ? null : req.user?.BranchId ?? null
    };

    next();
};

module.exports = branchAccessMiddleware;
