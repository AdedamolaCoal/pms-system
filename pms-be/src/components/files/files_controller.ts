import { Request, Response } from "express";
import { BaseController } from "modules/base_controller";
import { uploadFile } from "modules/multer";
import { Files } from "./files_entity";
import { FilesService } from "./files_service";
import { IServerConfig } from "modules/config";
import * as config from "../../../server_config.json";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}
export class FilesController extends BaseController {
	/**
	 * Handles the addition of a new file.
	 * @param {object} req - The request object.
	 * @param {object} res - The response object.
	 */
	public async addHandler(req: RequestWithUser, res: Response): Promise<void> {
		try {
			const fileDataFromMulter = uploadFile(req);

			// Create an instance of the ProjectService
			const service = new FilesService();
			const fileData = new Files();
			fileData.file_name = fileDataFromMulter.filename;
			fileData.mime_type = fileDataFromMulter.mimetype;
			fileData.created_by = req?.user?.user_id ? req?.user?.user_id : null;
			// fileData.task_id = req.body.task_id;
			// const createdFile = await service.create(fileData);
			const createdTask = await service.create(fileData);
			res
				.status(createdTask.statusCode)
				.json({ message: "File uploaded successfully", createdTask });

			// res.status(200).json({ message: "File uploaded successfully", fileData });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	public async getAllHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {}

	public async getOneHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		try {
			const service = new FilesService();
			const server_config: IServerConfig = config;

			const result = await service.findOne(req.params.id);
			const file_path = `${server_config.attached_files_path}/${result.data.file_name}`;
			res.sendFile(file_path, (err) => {
				if (err) {
					// Handle errors, such as file not found or permission issues
					console.error("Error sending file:", err);
					res.status(500).json({ error: err.message });
				} else {
					res.status(200).end();
				}
			});
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	public async updateHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {}
	public async deleteHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {}
}
