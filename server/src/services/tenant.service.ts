import TenantModel from "../models/tenant.model";
import ApiError from "../utils/ApiError";

const TenantService = {
    async getTenants() {
        return await TenantModel.getAll();
    },

    async getActiveTenants() {
        return await TenantModel.getAllActive();
    },

    async getTenantById(tenantId: any) {
        const tenant = await TenantModel.findById(tenantId);

        if (!tenant) {
            throw new ApiError(404, "Tenant not found");
        }

        return tenant;
    },

    async createTenant(data: any, userId: any) {
        const { Name, Description, ContactNo, Email } = data;

        if (!Name) {
            throw new ApiError(400, "Tenant name is required.");
        }

        const result = await TenantModel.create(
            Name,
            Description ?? null,
            ContactNo ?? null,
            Email ?? null,
            userId
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async updateTenant(tenantId: any, data: any, userId: any) {
        const { Name, Description, ContactNo, Email, IsActive } = data;

        const existingTenant = await TenantModel.findById(tenantId);

        if (!existingTenant) {
            throw new ApiError(404, "Tenant not found");
        }

        const result = await TenantModel.update(
            tenantId,
            Name ?? existingTenant.Name,
            Description ?? existingTenant.Description,
            ContactNo ?? existingTenant.ContactNo,
            Email ?? existingTenant.Email,
            userId,
            IsActive ?? existingTenant.IsActive
        );

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    },

    async deleteTenant(tenantId: any, userId: any) {
        const result = await TenantModel.delete(tenantId, userId);

        if (!result.Success) {
            throw new ApiError(400, result.Message);
        }

        return result;
    }

};

export default TenantService;
