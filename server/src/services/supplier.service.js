const SupplierModel = require("../models/supplier.model");
const ApiError = require("../utils/ApiError");

const nullableText = (value) => value?.trim() || null;
const nullableId = (value) => value ? Number(value) : null;

const SupplierService = {
    async getSuppliers() { return SupplierModel.getAll(); },
    async getActiveSuppliers() { return SupplierModel.getAllActive(); },

    async getSupplierById(supplierId) {
        const supplier = await SupplierModel.findById(supplierId);
        if (!supplier) throw new ApiError(404, "Supplier not found");
        return supplier;
    },

    normalize(data, existing = {}) {
        const useExisting = (key, normalizeValue) => data[key] === undefined ? existing[key] ?? null : normalizeValue(data[key]);
        return {
            SupplierName: nullableText(data.SupplierName) || existing.SupplierName,
            ContactPerson: useExisting("ContactPerson", nullableText),
            ContactNo: useExisting("ContactNo", nullableText),
            TelNo: useExisting("TelNo", nullableText),
            Email: useExisting("Email", nullableText),
            ProvinceId: useExisting("ProvinceId", nullableId),
            MunicipalityId: useExisting("MunicipalityId", nullableId),
            BarangayId: useExisting("BarangayId", nullableId),
            OtherAddress: useExisting("OtherAddress", nullableText),
            IsActive: data.IsActive ?? existing.IsActive ?? 1,
        };
    },

    async createSupplier(data, userId) {
        const supplier = this.normalize(data);
        if (!supplier.SupplierName) throw new ApiError(400, "Supplier name is required.");
        const result = await SupplierModel.create(supplier, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async updateSupplier(supplierId, data, userId) {
        const existing = await this.getSupplierById(supplierId);
        const supplier = this.normalize(data, existing);
        const result = await SupplierModel.update(supplierId, supplier, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },

    async deleteSupplier(supplierId, userId) {
        await this.getSupplierById(supplierId);
        const result = await SupplierModel.delete(supplierId, userId);
        if (!result.Success) throw new ApiError(400, result.Message);
        return result;
    },
};

module.exports = SupplierService;
