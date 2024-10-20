import { Express } from "express";
import { RolesController, RolesUtil } from "./roles_controller";
import { validate } from "modules/validator";
import { body } from "express-validator";

const validRoleInput = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("description")
		.isLength({ max: 200 })
		.withMessage("Description has a max limit of 200 characters"),
	body("rights").custom((value: string) => {
		const accessRights = value?.split(",");
		if (accessRights.length > 0) {
			const validRights = RolesUtil.getAllPermissionsFromRights();
			const areAllRightsValid = accessRights.every((right) =>
				validRights.includes(right)
			);
			if (!areAllRightsValid) {
				throw new Error("Invalid Permission");
			}
		}
		return true;
	}),
];

export class RolesRoutes {
	private baseEndPoint = "/api/roles";

	constructor(app: Express) {
		const controller = new RolesController();

		app
			.route(this.baseEndPoint)
			.get(controller.getAllHandler)
			.post(validate(validRoleInput), controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.get(controller.getDetailHandler)
			.put(validate(validRoleInput), controller.updateHandler)
			.delete(controller.deleteHandler);
	}
}
