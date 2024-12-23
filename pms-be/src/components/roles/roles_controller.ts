import { BaseController } from "modules/base_controller";
import { Permissions } from "modules/common";
import { Request, Response } from "express";
import { RolesService } from "./roles_service";
import { Roles } from "./roles_entity";
import { hasPermission } from "modules/auth_util";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}

export class RolesController extends BaseController {
	// create role
	public async addHandler(req: RequestWithUser, res: Response): Promise<void> {
		if (!hasPermission(req.user.permissions, "add_role")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const role = req.body;
		const service = new RolesService();
		const result = await service.create(role);
		console.log(result);
		res.status(result.statusCode).json(result);
		return;
	}

	// get all roles
	public async getAllHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_all_roles")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const service = new RolesService();
		const result = await service.findAll(req.query);
		res
			.status(result.statusCode)
			.json({ result, message: "All Roles", total: result.data.length });
	}

	// get one role
	public async getOneHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_one_role")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const service = new RolesService();
		const result = await service.findOne(req.params.id);
		res.status(result.statusCode).json(result);
	}

	// update role
	public async updateHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "edit_role")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const role = req.body;
		const service = new RolesService();
		const result = await service.update(req.params.id, role);
		res.status(result.statusCode).json({result, message: "Role updated successfully"});
		return;
	}

	// delete role
	public async deleteHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "delete_role")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const service = new RolesService();
		const result = await service.delete(req.params.id);
		res.status(result.statusCode).json(result);
	}

	public async getRightList(req: RequestWithUser, res: Response) {
		res
			.status(200)
			.json({ statusCode: 200, status: "success", data: Permissions });
	}
}

export class RolesUtil {
	/**
	 * Retrieves all possible permissions from the defined rights
	 *
	 * @returns {Array<string>}: an array of permissions
	 */
	public static getAllPermissionsFromPermissions(): string[] {
		let permissions: Array<string> = [];
		for (const module in Permissions) {
			// Check if rights for ALL are defined for the current
			module;
			if (Permissions[module]["ALL"]) {
				let sectionValues = Permissions[module]["ALL"];
				sectionValues = sectionValues.split(",");
				permissions = [...permissions, ...sectionValues];
			}
		}
		// Return the collected permissions
		return permissions;
	}

	/**
	 * Ensures that Role ID's exist in the db
	 *
	 * @param {Array<string>} role_ids: an array of role IDs
	 *
	 * @returns {Promise<boolean>}: a promise that resolves to a boolean
	 */
	public static async checkValidRoleIds(role_ids: Array<string>) {
		const service = new RolesService();
		const roles = await service.findByIds(role_ids);

		if (roles.status === "error") {
			throw new Error(roles.message);
		}

		console.log("role id: ", roles.data);
		return roles.data.length === role_ids.length;
	}

	/**
	 * Retrieves all possible permissions from roles
	 *
	 * @param {Array<string>} role_ids: an array of role IDs
	 *
	 * @returns {Array<string>}: an array of permissions
	 */
	public static async getAllPermissionsFromRoles(role_ids: Array<string>) {
		const service = new RolesService();

		//  an array to store collected rights
		let permissions: Array<string> = [];

		// query the db to validate the provided role_ids
		const queryData = await service.findByIds(role_ids);
		const roles: Array<Roles> = queryData.data ? queryData.data : [];

		// iterate through the roles to extract roles and add them to the permissions array
		roles.forEach((role: Roles) => {
			const permissionFromRole: Array<string> = role?.permissions?.split(",");
			permissions = [...new Set(permissions.concat(permissionFromRole))];
		});
		// return the collected permissions
		return permissions;
	}
}
