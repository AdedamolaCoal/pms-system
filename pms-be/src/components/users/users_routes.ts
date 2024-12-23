import { Express } from "express";
import { UserController } from "./users_controllers";
import { body } from "express-validator";
import { validate } from "modules/validator";
import { authorize } from "modules/auth_util";

const validUserInput = [
	body("username").trim().notEmpty().withMessage("Name is required"),
	body("email").trim().isEmail().withMessage("Email is required"),
	body("password")
		.trim()
		.isLength({ min: 6, max: 12 })
		.withMessage("Password should be between 6 and 12 characters")
		.isStrongPassword({
			minLowercase: 1,
			minUppercase: 1,
			minSymbols: 1,
			minNumbers: 1,
		})
		.withMessage(
			"Password should contain one lowercase, one uppercase, one number and one symbol"
		),
	body("role_id")
		.isUUID()
		.withMessage("Role must be a valid UUID role")
		.custom((value: Array<string>) => {
			if (value?.length > 0 && value instanceof Array) {
				const uuidPattern =
					/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
				const isValid = value?.every((uuid) => uuidPattern.test(uuid.trim()));
				if (!isValid) {
					throw new Error("Role UUIDs are invalid!");
				}
			}
			return true;
		}),
];

const updateValidUserInput = [
	body("role_id")
		.isUUID()
		.withMessage("Role must be a valid UUID role")
		.custom((value: Array<string>) => {
			if (value?.length > 0 && value instanceof Array) {
				const uuidPattern =
					/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
				const isValid = value?.every((uuid) => uuidPattern.test(uuid.trim()));
				if (!isValid) {
					throw new Error("Role UUIDs are invalid!");
				}
			}
			return true;
		}),
];

const validChangePassword = [
	body("oldPassword").trim().notEmpty().withMessage("Password is required"),
	body("newPassword")
		.isLength({ min: 6, max: 12 })
		.withMessage("New Password must be between 6 and 12 characters")
		.isStrongPassword({
			minLowercase: 1,
			minNumbers: 1,
			minUppercase: 1,
			minSymbols: 1,
		})
		.withMessage(
			"New Password must include at least 1 uppercase character, 1 lowercase character, 1 symbol and 1 digit"
		),
	body("role_id"),
];

const validResetPassword = [
	body("token").trim().notEmpty().withMessage("Token is required"),
	body("newPassword")
		.isLength({ min: 6, max: 12 })
		.isStrongPassword({
			minLowercase: 1,
			minUppercase: 1,
			minSymbols: 1,
			minNumbers: 1,
		})
		.withMessage(
			"New Password must include at least 1 uppercase character, 1 lowercase character, 1 symbol and 1 digit"
		),
	body("role_id"),
];
// body("role_id")
// 	.isArray()
// 	.withMessage("Role must be an array of UUIDs of roles")
// 	.custom((value: Array<string>) => {
// 		if (value?.length > 0 && value instanceof Array) {
// 			const uuidPattern =
// 				/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
// 			const isValid = value?.every((uuid) => uuidPattern.test(uuid.trim()));
// 			if (!isValid) {
// 				throw new Error("Role UUIDs are invalid!");
// 			}
// 		}
// 		return true;
// 	}),

export class UserRoutes {
	private baseEndPoint = "/api/users";
	constructor(app: Express) {
		const controller = new UserController();

		app
			.route(`${this.baseEndPoint}`)
			.all(authorize)
			.get(controller.getAllHandler)
			.post(validate(validUserInput), controller.addHandler);

		app
			.route(`${this.baseEndPoint}/:id`)
			.all(authorize)
			.get(controller.getOneHandler)
			.put(validate(updateValidUserInput), controller.updateHandler)
			.delete(controller.deleteHandler);

		// login route
		app.route("/api/login").post(controller.login);

		// refresh token route
		app
			.route("/api/refresh-token")
			.post(controller.getAccessTokenFromRefreshToken);

		// change password route
		app
			.route(`${this.baseEndPoint}/change-password/:id`)
			.all(authorize)
			.post(validate(validChangePassword), controller.changePassword);

		// forgot password
		app.route("/api/forgot-password").post(controller.forgotPassword);

		// reset password
		app
			.route("/api/reset-password")
			.post(validate(validResetPassword), controller.resetPassword);
	}
}
