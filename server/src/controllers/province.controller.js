const ProvinceService = require("../services/province.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getProvinces = asyncHandler(async (req, res) => {
    const provinces = await ProvinceService.getProvinces();

    res.status(200).json(
        new ApiResponse(200, "Provinces fetched successfully", provinces)
    );
});

const getActiveProvinces = asyncHandler(async (req, res) => {
    const provinces = await ProvinceService.getActiveProvinces();

    res.status(200).json(
        new ApiResponse(200, "Active provinces fetched successfully", provinces)
    );
});

const getProvinceById = asyncHandler(async (req, res) => {
    const { provinceId } = req.params;
    const province = await ProvinceService.getProvinceById(provinceId);

    res.status(200).json(
        new ApiResponse(200, "Province fetched successfully", province)
    );
});

const createProvince = asyncHandler(async (req, res) => {
    const result = await ProvinceService.createProvince(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                ProvinceId: result.ProvinceId
            }
        )
    );
});

const updateProvince = asyncHandler(async (req, res) => {
    const { provinceId } = req.params;

    const result = await ProvinceService.updateProvince(
        provinceId,
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

const deleteProvince = asyncHandler(async (req, res) => {
    const { provinceId } = req.params;

    const result = await ProvinceService.deleteProvince(
        provinceId,
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

module.exports = {
    getProvinces,
    getActiveProvinces,
    getProvinceById,
    createProvince,
    updateProvince,
    deleteProvince
};