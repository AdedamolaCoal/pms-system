import { BaseController } from "modules/base_controller";
import { Rights } from "modules/common";
import { Request, Response } from "express";
import { RolesService } from "./roles_service";

export class RolesController extends BaseController {
	// create role
	public async addHandler(req: Request, res: Response): Promise<void> {
		const role = req.body;
		const service = new RolesService();
		const result = await service.create(role);
		res.status(result.statusCode).json();
	}

	// get all roles
	public async getAllHandler(req: Request, res: Response): Promise<void> {
		const service = new RolesService();
		const result = await service.findAll(req.query);
		res.status(result.statusCode).json(result);
	}

	// get one role
	public async getDetailHandler(req: Request, res: Response): Promise<void> {
		const service = new RolesService();
		const result = await service.findOne(req.params.id);
		res.status(result.statusCode).json(result);
	}

	// update role
	public async updateHandler(req: Request, res: Response): Promise<void> {
		const role = req.body;
		const service = new RolesService();
		const result = await service.update(req.params.id, role);
		res.status(result.statusCode).json(result);
	}

	// delete role
	public async deleteHandler(req: Request, res: Response) {}
}

export class RolesUtil {
	/**
	 * Retrieves all possible permissions from the defined rights
	 *
	 * @returns {Array<string>}: an array of permissions
	 */

	public static getAllPermissionsFromRights(): Array<string> {
		// initializes an empty array to collect values
		let permissions = [];

		// loops through all the rights
		for (const module in Rights) {
			// checks if rights for ALL are defined for the current module
			if (Rights[module]["ALL"]) {
				let sectionValues = Rights[module]["ALL"];
				sectionValues = sectionValues.split(",");
				permissions = [...permissions, ...sectionValues];
			}
		}
		// returns the collected permissions
		return permissions;
	}
}
