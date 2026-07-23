const BarangayService = require("../services/barangay.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getBarangays = asyncHandler(async (req, res) => {
    const barangays = await BarangayService.getBarangays();

    res.status(200).json(
        new ApiResponse(200, "Barangays fetched successfully", barangays)
    );
});

const getActiveBarangays = asyncHandler(async (req, res) => {
    const barangays = await BarangayService.getActiveBarangays();

    res.status(200).json(
        new ApiResponse(200, "Active barangays fetched successfully", barangays)
    );
});

const getBarangayById = asyncHandler(async (req, res) => {
    const { barangayId } = req.params;
    const barangay = await BarangayService.getBarangayById(barangayId);

    res.status(200).json(
        new ApiResponse(200, "Barangay fetched successfully", barangay)
    );
});

const getBarangaysByMunicipalityId = asyncHandler(async (req, res) => {
    const { municipalityId } = req.params;
    const barangays = await BarangayService.getBarangaysByMunicipalityId(municipalityId);

    res.status(200).json(
        new ApiResponse(200, "Barangays fetched successfully", barangays)
    );
});

const createBarangay = asyncHandler(async (req, res) => {
    const result = await BarangayService.createBarangay(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                BarangayId: result.BarangayId
            }
        )
    );
});

const updateBarangay = asyncHandler(async (req, res) => {
    const { barangayId } = req.params;

    const result = await BarangayService.updateBarangay(
        barangayId,
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

const deleteBarangay = asyncHandler(async (req, res) => {
    const { barangayId } = req.params;

    const result = await BarangayService.deleteBarangay(
        barangayId,
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
    getBarangays,
    getActiveBarangays,
    getBarangayById,
    getBarangaysByMunicipalityId,
    createBarangay,
    updateBarangay,
    deleteBarangay
};