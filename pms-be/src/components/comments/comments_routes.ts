import { Express } from "express";
import { CommentControllers } from "./comments_controllers";

export class CommentRoutes {
	private baseEndPoint = "/api/comments";

	constructor(app: Express) {
		const controller = new CommentControllers();

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
