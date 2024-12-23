import * as jwt from "jsonwebtoken";
import { SERVER_CONST } from "./common";
import { UsersUtil } from "@components/users/users_controllers";
import { RolesUtil } from "@components/roles/roles_controller";
import { NextFunction, Request, Response } from "express";
import { Users } from "@components/users/users_entity";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}

export const authorize = async (
	req: RequestWithUser,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers?.authorization
		? (req.headers?.authorization?.split("Bearer ")[1] as string)
		: null;
	if (!token) {
		res.status(401).json({
			statusCode: 401,
			status: "error",
			message: "Missing Authorization Token",
		});
		return;
	}

	try {
		const decodedToken = jwt.verify(token, SERVER_CONST.JWT_SECRET);
		req.user = {};
		req.user.user_id = decodedToken["user_id"] ?? "";
		req.user.username = decodedToken["username"] ?? "";
		req.user.email = decodedToken["email"] ?? "";

		if (req.user.username) {
			const user: Users = await UsersUtil.getUserFromUsername(
				req.user.username
			);
			const permissions = await RolesUtil.getAllPermissionsFromRoles([
				user.role_id,
			]);
			req.user.permissions = permissions;
		}
		next();
	} catch (error) {
		console.error(error);
		res.status(401).json({
			statusCode: 401,
			status: "error",
			message: "Expired or Invalid Authorization Token, kindly login again",
		});
	}
};

export const hasPermission = (
	permission: Array<string>,
	desired_permissions: string
): boolean => {
	const trimmedPermission = permission.map((permission) => permission.trim());
	if (trimmedPermission.includes(desired_permissions)) {
		return true;
	} else {
		return false;
	}
};
