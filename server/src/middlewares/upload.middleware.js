const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const PROFILE_PICTURES_DIR = path.join(__dirname, "../../uploads/profile-pictures");
fs.mkdirSync(PROFILE_PICTURES_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PROFILE_PICTURES_DIR),
    filename: (req, file, cb) => {
        // Never trust the client-supplied filename -- generate a random one, keep only the
        // extension implied by the (already-validated) mime type.
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${crypto.randomUUID()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(new ApiError(400, "Only JPEG, PNG, WEBP, or GIF images are allowed."));
    }
    cb(null, true);
};

const uploadProfilePicture = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES }
}).single("ProfilePicture");

module.exports = {
    uploadProfilePicture,
    PROFILE_PICTURES_DIR
};
