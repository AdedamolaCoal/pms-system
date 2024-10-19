import { Express } from "express";
import { RolesController } from "./roles_controller";

export class RolesRoutes {
	private baseEndPoint = "/api/roles";

	constructor(app: Express) {
		const controller = new RolesController();

		app
			.route(this.baseEndPoint)
			.get(controller.getAllHandler)
			.post(controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.get(controller.getDetailHandler)
			.put(controller.updateHandler)
			.delete(controller.deleteHandler);
	}
}
