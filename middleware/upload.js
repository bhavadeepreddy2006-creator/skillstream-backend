import multer from "multer";
import path from "path";
import fs from "fs";

const PROFILE_DIR = path.join("uploads", "profile-photos");
const COVER_DIR = path.join("uploads", "cover-photos");
const THUMBNAIL_DIR = path.join("uploads", "post-thumbnails");
fs.mkdirSync(PROFILE_DIR, { recursive: true });
fs.mkdirSync(COVER_DIR, { recursive: true });
fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });

function storageFor(destination) {
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, destination),
        filename: (req, file, cb) => {
            const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        },
    });
}

const imageFileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isAllowedExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const isAllowedMime = allowed.test(file.mimetype);

    if (isAllowedExt && isAllowedMime) {
        cb(null, true);
    } else {
        cb(new Error("Only .jpg, .jpeg, .png and .webp image files are allowed"));
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

export const uploadProfilePhoto = multer({ storage: storageFor(PROFILE_DIR), fileFilter: imageFileFilter, limits });
export const uploadCoverPhoto = multer({ storage: storageFor(COVER_DIR), fileFilter: imageFileFilter, limits });
export const uploadThumbnail = multer({ storage: storageFor(THUMBNAIL_DIR), fileFilter: imageFileFilter, limits });
