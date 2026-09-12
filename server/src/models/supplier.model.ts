import type { RowDataPacket } from "mysql2";
import type { SqlParam } from "../types/db";
import pool from "../config/db";

const SupplierModel = {
    async getAll() {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_suppliers_getAll()");
        return rows[0] || [];
    },

    async getAllActive() {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_suppliers_getAllActive()");
        return rows[0] || [];
    },

    async findById(supplierId: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_suppliers_getById(?)", [supplierId]);
        return rows[0][0] || null;
    },

    async create(data: any, createdBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_suppliers_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [data.SupplierName, data.ContactPerson, data.ContactNo, data.TelNo, data.Email, data.ProvinceId, data.MunicipalityId, data.BarangayId, data.OtherAddress, createdBy]
        );
        return rows[0][0];
    },

    async update(supplierId: SqlParam, data: any, updatedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>(
            "CALL sp_suppliers_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [supplierId, data.SupplierName, data.ContactPerson, data.ContactNo, data.TelNo, data.Email, data.ProvinceId, data.MunicipalityId, data.BarangayId, data.OtherAddress, updatedBy, data.IsActive]
        );
        return rows[0][0];
    },

    async delete(supplierId: SqlParam, deletedBy: SqlParam) {
        const [rows] = await pool.query<RowDataPacket[][]>("CALL sp_suppliers_delete(?, ?)", [supplierId, deletedBy]);
        return rows[0][0];
    },
};

export default SupplierModel;
