import MunicipalityService from "../services/municipality.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getMunicipalities = asyncHandler(async (req, res) => {
    const municipalities = await MunicipalityService.getMunicipalities();

    res.status(200).json(
        new ApiResponse(200, "Municipalities fetched successfully", municipalities)
    );
});

const getActiveMunicipalities = asyncHandler(async (req, res) => {
    const municipalities = await MunicipalityService.getActiveMunicipalities();

    res.status(200).json(
        new ApiResponse(200, "Active municipalities fetched successfully", municipalities)
    );
});

const getMunicipalityById = asyncHandler(async (req, res) => {
    const { municipalityId } = req.params;
    const municipality = await MunicipalityService.getMunicipalityById(municipalityId);

    res.status(200).json(
        new ApiResponse(200, "Municipality fetched successfully", municipality)
    );
});

const getMunicipalitiesByProvinceId = asyncHandler(async (req, res) => {
    const { provinceId } = req.params;
    const municipalities = await MunicipalityService.getMunicipalitiesByProvinceId(provinceId);

    res.status(200).json(
        new ApiResponse(200, "Municipalities fetched successfully", municipalities)
    );
});

const createMunicipality = asyncHandler(async (req, res) => {
    const result = await MunicipalityService.createMunicipality(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                MunicipalityId: result.MunicipalityId
            }
        )
    );
});

const updateMunicipality = asyncHandler(async (req, res) => {
    const { municipalityId } = req.params;

    const result = await MunicipalityService.updateMunicipality(
        municipalityId,
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

const deleteMunicipality = asyncHandler(async (req, res) => {
    const { municipalityId } = req.params;

    const result = await MunicipalityService.deleteMunicipality(
        municipalityId,
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
    getMunicipalities,
    getActiveMunicipalities,
    getMunicipalityById,
    getMunicipalitiesByProvinceId,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality
};