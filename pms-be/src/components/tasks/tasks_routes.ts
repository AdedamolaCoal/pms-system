import { Express } from "express";
import { TaskControllers } from "./tasks_controllers";

export class TaskRoutes {
	private baseEndPoint = "/api/tasks";

	constructor(app: Express) {
		const controller = new TaskControllers();

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
