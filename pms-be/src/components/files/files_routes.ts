import { Express } from "express";
import { authorize } from "modules/auth_util";
import { fileUploadMiddleware } from "modules/multer";
import { FilesController } from "./files_controller";

export class FilesRoutes {
	private baseEndPoint = "/api/files";

	constructor(app: Express) {
		const controller = new FilesController();

		app
			.route(`${this.baseEndPoint}`)
			.all(authorize)
			.post(fileUploadMiddleware, controller.addHandler);

		app
			.route(this.baseEndPoint + "/:id")
			.all(authorize)
			.get(controller.getOneHandler);
	}
}
