import { Express } from "express";
import { RolesController, RolesUtil } from "./roles_controller";
import { validate } from "modules/validator";
import { body, ValidationChain } from "express-validator";
import Joi from "joi";
import { authorize } from "modules/auth_util";

// with express-validator
const validRoleInput = [
	body("name").trim().notEmpty().withMessage("It should be required"),
	body("description")
		.isLength({ max: 200 })
		.withMessage("It has maximum limit of 200 characters"),
	body("permissions").custom((value: string) => {
		const accessRights = value?.split(",");
		if (accessRights?.length > 0) {
			const validRights = RolesUtil.getAllPermissionsFromPermissions();
			const areAllRightsValid = accessRights.every((right) =>
				validRights.includes(right)
			);
			if (areAllRightsValid) {
				throw new Error("Invalid permission");
			}
		}
		return true;
	}),
];

// with joi
// const validRoleSchema = Joi.object({
// 	name: Joi.string().trim().required().messages({
// 		"string.empty": "It should be required",
// 	}),
// 	description: Joi.string().max(200).messages({
// 		"string.max": "It has a maximum limit of 200 characters",
// 	}),
// 	permissions: Joi.string()
// 		.custom((value, helpers) => {
// 			const accessRights = value?.split(",");
// 			const validRights = RolesUtil.getAllPermissionsFromRights();
// 			const areAllRightsValid = accessRights.every((right) =>
// 				validRights.includes(right)
// 			);
// 			if (!areAllRightsValid) {
// 				return helpers.error("any.invalid"); // Just the error code
// 			}
// 			return value;
// 		})
// 		.messages({
// 			"any.invalid": "Invalid permission",
// 		}),
// });

export class RolesRoutes {
	private baseEndPoint = "/api/roles";

	constructor(app: Express) {
		const controller = new RolesController();

		app
			.route(this.baseEndPoint)
			.all(authorize)
			.get(controller.getAllHandler)
			.post(validate(validRoleInput), controller.addHandler);
		// validate([{ schema: validRoleSchema, property: "body" }]), // for POST request
		// validate(validRoleInput), for post request using express-validator

		app
			.route(`${this.baseEndPoint}/:id`)
			.all(authorize)
			.get(controller.getOneHandler)
			.put(validate(validRoleInput), controller.updateHandler)
			.delete(controller.deleteHandler);
		// validate([{ schema: validRoleSchema, property: "body" }]), // for PUT request
		// validate(validRoleInput), for put request
	}
}
