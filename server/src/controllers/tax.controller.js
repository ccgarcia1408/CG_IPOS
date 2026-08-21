const TaxService = require("../services/tax.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const getTaxes = asyncHandler(async (req, res) => {
    const taxes = await TaxService.getTaxes();

    res.status(200).json(
        new ApiResponse(200, "Taxes fetched successfully", taxes)
    );
});

const getActiveTaxes = asyncHandler(async (req, res) => {
    const taxes = await TaxService.getActiveTaxes();

    res.status(200).json(
        new ApiResponse(200, "Active taxes fetched successfully", taxes)
    );
});

const getTaxById = asyncHandler(async (req, res) => {
    const { taxId } = req.params;
    const tax = await TaxService.getTaxById(taxId);

    res.status(200).json(
        new ApiResponse(200, "Tax fetched successfully", tax)
    );
});

const createTax = asyncHandler(async (req, res) => {
    const result = await TaxService.createTax(
        req.body,
        req.user.UserId
    );

    res.status(201).json(
        new ApiResponse(
            201,
            result.Message,
            {
                TaxId: result.TaxId
            }
        )
    );
});

const updateTax = asyncHandler(async (req, res) => {
    const { taxId } = req.params;

    const result = await TaxService.updateTax(
        taxId,
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

const deleteTax = asyncHandler(async (req, res) => {
    const { taxId } = req.params;

    const result = await TaxService.deleteTax(
        taxId,
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
    getTaxes,
    getActiveTaxes,
    getTaxById,
    createTax,
    updateTax,
    deleteTax
};
