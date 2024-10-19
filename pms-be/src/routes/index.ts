import { Express, Router } from "express";
import { RolesRoutes } from "@components/roles/roles_routes";
import { UserRoutes } from "@components/users/users_routes";
import { CommentRoutes } from "@components/comments/comments_routes";
import { TaskRoutes } from "@components/tasks/tasks_routes";
import { ProjectRoutes } from "@components/projects/projects_routes";

export class Routes {
	public router: Router;

	constructor(app: Express) {
		const routeClasses = [
			RolesRoutes,
			UserRoutes,
			CommentRoutes,
			ProjectRoutes,
			TaskRoutes,
		];

		for (const routeClass of routeClasses) {
			try {
				new routeClass(app);
				console.log(`Router : ${routeClass.name} - Connected`);
			} catch (error) {
				console.log(`Router : ${routeClass.name} - Failed`);
			}
		}
	}
}
