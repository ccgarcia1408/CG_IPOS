import TenantService from "../services/tenant.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getTenants = asyncHandler(async (req, res) => {
    const tenants = await TenantService.getTenants();

    res.status(200).json(
        new ApiResponse(200, "Tenants fetched successfully", tenants)
    );
});

const getActiveTenants = asyncHandler(async (req, res) => {
    const tenants = await TenantService.getActiveTenants();

    res.status(200).json(
        new ApiResponse(200, "Active tenants fetched successfully", tenants)
    );
});

const getTenantById = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    const tenant = await TenantService.getTenantById(tenantId);

    res.status(200).json(
        new ApiResponse(200, "Tenant fetched successfully", tenant)
    );
});

const createTenant = asyncHandler(async (req, res) => {
    const result = await TenantService.createTenant(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                TenantId: result.TenantId
            }
        )
    );
});

const updateTenant = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    const result = await TenantService.updateTenant(
        tenantId,
        req.body,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

const deleteTenant = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;

    const result = await TenantService.deleteTenant(
        tenantId,
        req.user.UserId
    );

    res.status(200).json(
        new ApiResponse(
            200,
            result.Message,
            null
        )
    );
});

export {
    getTenants,
    getActiveTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant
};
