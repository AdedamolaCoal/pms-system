import { Request, Response } from "express";
import { hasPermission } from "modules/auth_util";
import { ProjectsService } from "./projects_service";
import { UsersUtil } from "@components/users/users_controllers";
import { BaseController } from "modules/base_controller";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}

/**
 * Handles the addition of a new project
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export class ProjectController extends BaseController {
	public async addHandler(req: RequestWithUser, res: Response): Promise<void> {
		if (!hasPermission(req.user.permissions, "add_project")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		try {
			const service = new ProjectsService();
			const project = req.body;

			// check if the user_ids are valid
			const isValidUsers = await UsersUtil.checkValidUserIds(project.user_ids);
			if (!isValidUsers) {
				res.status(400).json({
					statusCode: 400,
					status: "error",
					message: "Invalid User IDs",
				});
				return;
			}

			const createdProject = await service.create(project);
			res
				.status(createdProject.statusCode)
				.json({ createdProject, message: "Project created successfully" });
		} catch (error) {
			console.error(`Error while adding user => ${error.message}`);
			res.status(500).json({
				statusCode: 500,
				status: "error",
				message: "Internal Server Error",
			});
		}
	}

	public async getAllHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_all_projects")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new ProjectsService();
		const result = await service.findAll(req.query);

		for (const project of result.data) {
			project["users"] = await UsersUtil.getUsernamesById(project.user_ids);
			delete project.user_ids;
		}
		res
			.status(result.statusCode)
			.json({ result, message: "All projects", total: result.data.length });
	}

	public async getOneHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_one_project")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new ProjectsService();
		const result = await service.findOne(req.params.id);

		if (!result.data) {
			res.status(404).json({
				statusCode: 404,
				status: "error",
				message: "Project not found",
			});
			return;
		}

		result.data["users"] = await UsersUtil.getUsernamesById(
			result.data.user_ids
		);
		delete result.data.user_ids;
		res.status(result.statusCode).json(result);
	}

	public async updateHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "edit_project")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const project = req.body;
		const service = new ProjectsService();
		const result = await service.update(req.params.id, project);
		res.status(result.statusCode).json({ result, message: "Project updated" });
	}
	public async deleteHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "delete_project")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new ProjectsService();

		// Uncomment this block if you want to check if the project exists before deleting
		// const project = await service.findOne(req.params.id);
		// if (!project.data) {
		// 	res.status(404).json({
		// 		statusCode: 404,
		// 		status: "error",
		// 		message: "Project not found",
		// 	});
		// 	return;
		// }
		const result = await service.delete(req.params.id);
		res.status(result.statusCode).json({ result, message: "Project deleted" });
	}
}

export class ProjectsUtil {
	public static async checkValidProjectIds(project_ids: Array<string>) {
		const service = new ProjectsService();
		const projects = await service.findByIds(project_ids);
		return projects.data.length === project_ids.length;
	}
}
