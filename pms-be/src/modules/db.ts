import { DataSource, Repository } from "typeorm";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";
import { Users } from "@components/users/users_entity";
import { Comments } from "@components/comments/comments_entity";
import { Projects } from "@components/projects/projects_entity";
import { Tasks } from "@components/tasks/tasks_entity";
import { Roles } from "@components/roles/roles_entity";

export class DatabaseUtil {
	private server_config: IServerConfig = config;
	private static connection: DataSource | null = null;
	private repositories: Record<string, Repository<any>> = {};
	private static instance: DatabaseUtil;

	constructor() {
		this.connectDatabase();
	}

	/**
	 * Returns a singleton instance of the DatabaseUtil class.
	 * If an instance doesn't exist, it creates a new one and connects to the database.
	 * If an instance already exists, it returns the existing instance.
	 * @returns A Promise that resolves to the singleton instance of DatabaseUtil.
	 */
	public static async getInstance(): Promise<DatabaseUtil> {
		// check if an instance exists
		if (!DatabaseUtil.instance) {
			// create a new instance if it doesn't exist
			DatabaseUtil.instance = new DatabaseUtil();
			// connect to the database using the created instance
			await DatabaseUtil.instance.connectDatabase();
		}
		return DatabaseUtil.instance;
	}

	/**
	 * Establishes a database connection or returns the existing connection if available.
	 * @returns The database connection instance.
	 */
	public async connectDatabase() {
		try {
			if (DatabaseUtil.connection) {
				return DatabaseUtil.connection;
			} else {
				const db_config = this.server_config.db_config;
				const AppSource = new DataSource({
					type: "postgres",
					host: db_config.host,
					port: db_config.port,
					username: db_config.username,
					password: db_config.password,
					database: db_config.dbname,
					entities: [Roles, Users, Comments, Projects, Tasks],
					synchronize: true,
					logging: false,
				});
				await AppSource.initialize();
				DatabaseUtil.connection = AppSource;
				console.log("Database connection established.");
				return DatabaseUtil.connection;
			}
		} catch (err) {
			console.log("Error connecting to the db.", err);
		}
	}

	/**
	 * Get the repository for a given entity.
	 * @param entity - The entity for which the repository is needed.
	 * @returns The repository instance for the entity.
	 */
	public getRepository(entity) {
		try {
			// Check if a valid database connection is available
			if (DatabaseUtil.connection) {
				const entityName = entity.name;

				// Check if the repository instance already exists, if not, create it
				if (!this.repositories[entityName]) {
					this.repositories[entityName] =
						DatabaseUtil.connection.getRepository(entity);
				}
				return this.repositories[entityName];
			}
			return null;
		} catch (error) {
			console.error(`Error while getRepository => ${error.message}`);
		}
	}
}
