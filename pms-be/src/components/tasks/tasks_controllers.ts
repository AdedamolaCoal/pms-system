import { Request, Response } from "express";
import { hasPermission } from "modules/auth_util";
import { BaseController } from "modules/base_controller";
import { TasksService } from "./tasks_service";
import { ProjectsUtil } from "@components/projects/projects_controllers";
import { UsersUtil } from "@components/users/users_controllers";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}
export class TaskController extends BaseController {
	/**
	 *
	 * @param req => Request object
	 * @param res => Response object
	 * @returns => a promise<void>
	 */
	public async addHandler(req: RequestWithUser, res: Response): Promise<void> {
		if (!hasPermission(req.user.permissions, "add_task")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		try {
			const service = new TasksService();
			const tasks = req.body;
			const isValidProjectIds = await ProjectsUtil.checkValidProjectIds([
				tasks.project_id,
			]);
			if (!isValidProjectIds) {
				res.status(400).json({
					statusCode: 400,
					status: "error",
					message: "Invalid Project ID",
				});
				return;
			}

			const isValidUsrId = await UsersUtil.checkValidUserIds([tasks.user_id]);
			if (!isValidUsrId) {
				res.status(400).json({
					statusCode: 400,
					status: "error",
					message: "Invalid User ID",
				});
			}

			const createdTask = await service.create(tasks);
			res.status(createdTask.statusCode).json(createdTask);
		} catch (error) {
			console.error(`Error while adding task => ${error.message}`);
			res.status(500).json({
				statusCode: 500,
				status: "error",
				message: "Internal Server Error",
			});
		}
	}

	/**
	 *
	 * @param req => Request object
	 * @param res => Response object
	 * @returns => a promise<void>
	 */
	public async getAllHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_all_tasks")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new TasksService();
		const tasks = await service.findAll(req.query);
		if (tasks.data.length === 0) {
			res.status(tasks.statusCode).json({
				statusCode: 200,
				status: "success",
				data: tasks.data,
				message: "No task found",
				total: tasks.data.length,
			});
		}
		res.status(tasks.statusCode).json({
			statusCode: 200,
			status: "success",
			data: tasks.data,
			message: "All tasks",
			total: tasks.data.length,
		});
	}

	public async getOneHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "get_one_task")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new TasksService();
		const task = await service.findOne(req.params.id);
		res.status(task.statusCode).json(task);
	}

	public async updateHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "edit_task")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
		}

		const service = new TasksService();
		const task = req.body;
		const result = await service.update(req.params.id, task);
		res
			.status(result.statusCode)
			.json({ result, message: "Task updated successfully" });
	}

	public async deleteHandler(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		if (!hasPermission(req.user.permissions, "delete_task")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
		}

		const service = new TasksService();
		const result = await service.delete(req.params.id);
		res
			.status(result.statusCode)
			.json({ result, message: "Task deleted successfully" });
	}
}
