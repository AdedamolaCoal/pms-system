import { DatabaseUtil } from "modules/db";
import { ApiResponse, BaseService } from "modules/services/base_service";
import { Repository } from "typeorm";
import { Tasks } from "./tasks_entity";

export class TasksService extends BaseService<Tasks> {
	private taskRepository: Repository<Tasks> | null = null;
	constructor() {
		let taskRepository: Repository<Tasks> | null = null;
		taskRepository = new DatabaseUtil().getRepository(Tasks);
		super(taskRepository);
		this.taskRepository = taskRepository;
	}

	// overrides the method from the base service class
	override async findAll(
		queryParams: object
	): Promise<ApiResponse<Array<Tasks>>> {
		const queryBuilder = await this.taskRepository
			.createQueryBuilder("task")
			.leftJoin("task.project_id", "project")
			.leftJoin("task.user_id", "user")
			.addSelect([
				"task.*",
				"task.project_id as project",
				"project.project_id",
				"project.name",
				"user.user_id",
				"user.username",
				"user.email",
			]);
		// build the WHERE clause conditionally based on the search parameters
		if (queryParams["username"]) {
			queryBuilder.andWhere("user.username ILIKE :username", {
				username: `%${queryParams["username"]}%`,
			});
		}
		if (queryParams["projectname"]) {
			queryBuilder.andWhere("project.name ILIKE :projectname", {
				projectName: `%${queryParams["projectname"]}%`,
			});
		}
		if (queryParams["project_id"]) {
			queryBuilder.andWhere("task.project_id = :projectId", {
				projectId: queryParams["project_id"],
			});
		}

		const data = await queryBuilder.getMany();
		data.forEach((task) => {
			task["projectDetails"] = task.project_id;
			task["userDetails"] = task.user_id;
			delete task.project_id;
			delete task.user_id;
		});
		return {
			statusCode: 200,
			status: "success",
			data: data,
		};
	}

	// overrides the find one method from the base service class
	override async findOne(id: string): Promise<ApiResponse<Tasks>> {
		try {
			// build the WHERE condition based on the primary key
			const where = {};
			const primaryKey: string =
				this.taskRepository.metadata.primaryColumns[0].databaseName;
			where[primaryKey] = id;

			// use the repository to find the entity based on the provided ID
			const data = await this.taskRepository
				.createQueryBuilder("task")
				.leftJoin("task.project_id", "project")
				.leftJoin("task.user_id", "user")
				.addSelect([
					"task.*",
					"task.project_id as project",
					"project.project_id",
					"project.name",
					"user.user_id",
					"user.username",
					"user.email",
				])
				.where(where)
				.getOne();
			if (!data) {
				return {
					statusCode: 404,
					status: "error",
					message: "Task not found",
				};
			}
			data["projectDetails"] = data.project_id;
			data["userDetails"] = data.user_id;
			delete data.project_id;
			delete data.user_id;
			return {
				statusCode: 200,
				status: "success",
				data: data,
			};
		} catch (error) {
			console.error(`Error while finding task => ${error.message}`);
		}
		return {
			statusCode: 500,
			status: "error",
			message: "Internal Server Error",
		};
	}
}
