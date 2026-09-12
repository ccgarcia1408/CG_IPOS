import TerminalService from "../services/terminal.service";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

const getTerminals = asyncHandler(async (req, res) => {
    const terminals = await TerminalService.getTerminals();

    res.status(200).json(
        new ApiResponse(200, "Terminals fetched successfully", terminals)
    );
});
const getActiveTerminals = asyncHandler(async (req,res) => res.json(new ApiResponse(200,"Active terminals fetched successfully",await TerminalService.getActiveTerminals())));
const getTerminalById = asyncHandler(async (req,res) => res.json(new ApiResponse(200,"Terminal fetched successfully",await TerminalService.getTerminalById(req.params.terminalId))));
const createTerminal = asyncHandler(async (req,res) => { const result=await TerminalService.createTerminal(req.body,req.user.UserId); res.status(201).json(new ApiResponse(201,result.Message,{TerminalId:result.TerminalId})); });
const updateTerminal = asyncHandler(async (req,res) => { const result=await TerminalService.updateTerminal(req.params.terminalId,req.body,req.user.UserId); res.json(new ApiResponse(200,result.Message,null)); });
const deleteTerminal = asyncHandler(async (req,res) => { const result=await TerminalService.deleteTerminal(req.params.terminalId,req.user.UserId); res.json(new ApiResponse(200,result.Message,null)); });

export {
    getTerminals,
    getActiveTerminals, getTerminalById, createTerminal, updateTerminal, deleteTerminal,
};
