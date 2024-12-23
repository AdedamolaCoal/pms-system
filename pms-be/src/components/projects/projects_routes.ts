import { Express } from "express";
import { ProjectController } from "./projects_controllers";
import { body } from "express-validator";
import { validate } from "modules/validator";
import moment from "moment";
import { authorize } from "modules/auth_util";
import { checkValidDate } from "modules/common";
import { ProjectsService } from "./projects_service";

const validProjectInput = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("description")
		.trim()
		.isLength({ max: 500 })
		.withMessage("Description should be less than 500 characters"),
	body("user_ids").isArray().withMessage("User IDs should be an array"),
	body("start_time").custom((value) => {
		if (!checkValidDate(value)) {
			throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
		}
		const startTime = new Date(value);
		const currentTime = new Date();

		if (startTime <= currentTime) {
			throw new Error("Start time must be greater than current time");
		}
		return true;
	}),
	body("end_time").custom((value, { req }) => {
		if (!checkValidDate(value)) {
			throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
		}

		const startTime = new Date(req.body.start_time);
		const endTime = new Date(value);

		if (endTime <= startTime) {
			throw new Error("End time must be greater than start time");
		}
		return true;
	}),
];

export class ProjectRoutes {
	private baseEndPoint = "/api/projects";

	constructor(app: Express) {
		const controller = new ProjectController();

		app
			.route(`${this.baseEndPoint}`)
			.all(authorize)
			.get(controller.getAllHandler)
			.post(validate(validProjectInput), controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.all(authorize)
			.get(controller.getOneHandler)
			.put(validate(validProjectInput), controller.updateHandler)
			.delete(controller.deleteHandler);
	}
}
