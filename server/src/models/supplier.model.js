const pool = require("../config/db");

const SupplierModel = {
    async getAll() {
        const [rows] = await pool.query("CALL sp_suppliers_getAll()");
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query("CALL sp_suppliers_getAllActive()");
        return rows[0] || [];
    },

    async findById(supplierId) {
        const [rows] = await pool.query("CALL sp_suppliers_getById(?)", [supplierId]);
        return rows[0][0] || null;
    },

    async create(data, createdBy) {
        const [rows] = await pool.query(
            "CALL sp_suppliers_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [data.SupplierName, data.ContactPerson, data.ContactNo, data.TelNo, data.Email, data.ProvinceId, data.MunicipalityId, data.BarangayId, data.OtherAddress, createdBy]
        );
        return rows[0][0];
    },

    async update(supplierId, data, updatedBy) {
        const [rows] = await pool.query(
            "CALL sp_suppliers_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [supplierId, data.SupplierName, data.ContactPerson, data.ContactNo, data.TelNo, data.Email, data.ProvinceId, data.MunicipalityId, data.BarangayId, data.OtherAddress, updatedBy, data.IsActive]
        );
        return rows[0][0];
    },

    async delete(supplierId, deletedBy) {
        const [rows] = await pool.query("CALL sp_suppliers_delete(?, ?)", [supplierId, deletedBy]);
        return rows[0][0];
    },
};

module.exports = SupplierModel;
