import multer from "multer";
import { Request } from "express";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";

export const multerConfig = {
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			// sets the destination folder for the uploaded files
			const server_config: IServerConfig = config;
			cb(null, server_config.attached_files_path);
		},
		filename: (req, file, cb) => {
			// generates a unique name for the uploaded files
			const uniqueFilename = `${Date.now()}-${file.originalname}`;
			cb(null, uniqueFilename);
		},
	}),
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req: Request, file, cb) => {
		if (file.size > 5 * 1024 * 1024) {
			cb(new Error("File exceeds limit of 5mb"));
		} else {
			const allowedMimeTypes = [
				"image/jpeg",
				"image/png",
				"image/jpg",
				"application/pdf",
			];
			if (allowedMimeTypes.includes(file.mimetype)) {
				cb(null, true); // allows the upload
			} else {
				cb(
					new Error(
						"Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed."
					),
					false
				); // rejects the upload
			}
		}
	},
};

const upload = multer(multerConfig);
export const fileUploadMiddleware = upload.single("file");
export const uploadFile = (req: Request) => {
	if (!req.file) {
		throw new Error("File upload failed or No file provided");
	}
	// additional logic to save the file details to the database
	// storage logic
	// For example, save the file to a storage service or local directory
	const fileData = req.file;
	return fileData;
};
