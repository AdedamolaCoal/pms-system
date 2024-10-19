import { Express } from "express";
import { ProjectController } from "./projects_controllers";

export class ProjectRoutes {
	private baseEndPoint = "/api/projects";

	constructor(app: Express) {
		const controller = new ProjectController();

		app
			.route(`${this.baseEndPoint}`)
			.get(controller.getAllHandler)
			.post(controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.get(controller.getDetailHandler)
			.put(controller.updateHandler)
			.delete(controller.deleteHandler);
	}
}
