import multer from "multer";
import path from "path";
import fs from "fs";

const PROFILE_DIR = path.join(
    process.cwd(),
    "uploads",
    "profile-photos"
);

const COVER_DIR = path.join(
    process.cwd(),
    "uploads",
    "cover-photos"
);

const THUMBNAIL_DIR = path.join(
    process.cwd(),
    "uploads",
    "post-thumbnails"
);

[
    PROFILE_DIR,
    COVER_DIR,
    THUMBNAIL_DIR,
].forEach((directory) =>
    fs.mkdirSync(directory, { recursive: true })
);

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
]);

const MAX_UPLOAD_SIZE =
    Number(process.env.MAX_UPLOAD_SIZE) ||
    5 * 1024 * 1024;

function storageFor(destination) {

    return multer.diskStorage({

        destination(req, file, cb) {

            cb(null, destination);

        },

        filename(req, file, cb) {

            const extension = path
                .extname(file.originalname)
                .toLowerCase();

            const uniqueName =
                `${req.user._id}-${Date.now()}${extension}`;

            cb(null, uniqueName);

        },

    });

}

function imageFileFilter(req, file, cb) {

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (
        !ALLOWED_EXTENSIONS.has(extension) ||
        !ALLOWED_MIME_TYPES.has(file.mimetype)
    ) {

        return cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );

    }

    cb(null, true);

}

const limits = {

    fileSize: MAX_UPLOAD_SIZE,

};

function createUploader(destination) {

    return multer({

        storage: storageFor(destination),

        fileFilter: imageFileFilter,

        limits,

    });

}

export const uploadProfilePhoto =
    createUploader(PROFILE_DIR);

export const uploadCoverPhoto =
    createUploader(COVER_DIR);

export const uploadThumbnail =
    createUploader(THUMBNAIL_DIR);

export function handleUploadError(
    error,
    req,
    res,
    next
) {

    if (error instanceof multer.MulterError) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

    if (error) {

        return res.status(400).json({

            success: false,

            message: error.message,

        });

    }

    next();

}