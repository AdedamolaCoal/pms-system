import { DataSource } from "typeorm";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";
import { Users } from "@components/users/users_entity";
import { Comments } from "@components/comments/comments_entity";
import { Projects } from "@components/projects/projects_entity";
import { Tasks } from "@components/tasks/tasks_entity";
import { Roles } from "@components/roles/roles_entity";

export class DatabaseUtil {
	public server_config: IServerConfig = config;

	constructor() {
		this.connectDatabase();
	}

	private connectDatabase() {
		try {
			const db_config = this.server_config.db_config;
			const AppDataSource = new DataSource({
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
			AppDataSource.initialize()
				.then(() => {
					console.log(
						"Data Source has been initialized and connected to the db!"
					);
				})
				.catch((err) => console.log(err));
		} catch (err) {
			console.log("Error connecting to the db.", err);
		}
	}
}
