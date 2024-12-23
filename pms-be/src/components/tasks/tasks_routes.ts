import { Express } from "express";
import { TaskController } from "./tasks_controllers";
import { body } from "express-validator";
import { checkValidDate } from "modules/common";
import { authorize } from "modules/auth_util";
import { validate } from "modules/validator";
import { Priority, Status } from "./tasks_entity";

const validateTaskInput = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("description")
		.trim()
		.isLength({ max: 500 })
		.withMessage("Description shouldn't be less than 500 characters"),
	body("project_id")
		.trim()
		.notEmpty()
		.withMessage("Project ID should not be empty"),
	body("user_id").trim().notEmpty().withMessage("User ID should not be empty"),
	// body("priority")
	// 	.isIn(Object.values(Priority))
	// 	.withMessage("Priority should be Low, Medium or High"),
	// body("status")
	// 	.isIn(Object.values(Status))
	// 	.withMessage("Status should be Not-Started, In-Progress or Completed"),
	body("estimated_start_time")
		.trim()
		.notEmpty()
		.withMessage("Estimated start time should not be empty")
		.custom((value) => {
			if (!checkValidDate(value)) {
				throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
			}
			const startTime = new Date(value);
			const currentTime = new Date();

			if (startTime <= currentTime) {
				throw new Error(
					"Estimated start time must be greater than current time"
				);
			}
			return true;
		}),
	body("estimated_end_time")
		.trim()
		.notEmpty()
		.withMessage("Estimated end time should not be empty")
		.custom((value, { req }) => {
			if (!checkValidDate(value)) {
				throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
			}

			const startTime = new Date(req.body.estimated_start_time);
			const endTime = new Date(value);

			if (endTime <= startTime) {
				throw new Error(
					"Estimated end time must be greater than estimated start time"
				);
			}
			return true;
		}),
	// body("actual_start_time").custom((value, { req }) => {
	// 	if (!checkValidDate(value)) {
	// 		throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
	// 	}

	// 	const actualStartTime = new Date(value);
	// 	const estimatedStartTime = new Date(req.body.estimated_start_time);
	// 	const estimatedEndTime = new Date(req.body.estimated_end_time);
	// 	const currentTime = new Date();

	// 	if (actualStartTime <= currentTime) {
	// 		throw new Error("Actual start time must be greater than current time");
	// 	}
	// 	if (
	// 		actualStartTime < estimatedStartTime ||
	// 		actualStartTime > estimatedEndTime
	// 	) {
	// 		throw new Error(
	// 			"Actual start time must be between estimated start and end time"
	// 		);
	// 	}
	// 	return true;
	// }),
	// body("actual_end_time").custom((value, { req }) => {
	// 	if (!checkValidDate(value)) {
	// 		throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
	// 	}

	// 	const actual_end_time = new Date(value);
	// 	const estimatedStartTime = new Date(req.body.estimated_start_time);
	// 	const estimatedEndTime = new Date(req.body.estimated_end_time);
	// 	const actualStartTime = new Date(req.body.actual_start_time);
	// 	const currentTime = new Date();

	// 	if (actual_end_time <= currentTime) {
	// 		throw new Error("Actual start time must be greater than current time");
	// 	}
	// 	if (actual_end_time <= actualStartTime) {
	// 		throw new Error("Actual end time must be greater than actual start time");
	// 	}
	// 	if (
	// 		actual_end_time < estimatedStartTime ||
	// 		actual_end_time > estimatedEndTime
	// 	) {
	// 		throw new Error(
	// 			"Actual start time must be between estimated start and end time"
	// 		);
	// 	}
	// 	return true;
	// }),
];

const updateTaskInput = [
	body("estimated_start_time").custom((value, { req }) => {
		if (!value || !checkValidDate(value)) {
			throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
		}
		const startTime = new Date(value);
		const currentTime = new Date();

		if (startTime <= currentTime) {
			throw new Error("Estimated start time must be greater than current time");
		}
		if (startTime >= new Date(req.body.estimated_end_time)) {
			throw new Error(
				"Estimated start time must be less than estimated end time"
			);
		}
		return true;
	}),
	body("estimated_end_time").custom((value, { req }) => {
		if (!value || !checkValidDate(value)) {
			throw new Error("Invalid Date format YYYY-MM-DD HH:mm:ss");
		}

		const endTime = new Date(value);
		const startTime = new Date(req.body.estimated_start_time);

		if (endTime <= startTime) {
			throw new Error(
				"Estimated end time must be greater than estimated start time"
			);
		}
		return true;
	}),
];
export class TaskRoutes {
	private baseEndPoint = "/api/tasks";

	constructor(app: Express) {
		const controller = new TaskController();

		app
			.route(`${this.baseEndPoint}`)
			.all(authorize)
			.get(controller.getAllHandler)
			.post(validate(validateTaskInput), controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.all(authorize)
			.get(controller.getOneHandler)
			.put(validate(updateTaskInput), controller.updateHandler)
			.delete(controller.deleteHandler);
	}
}
