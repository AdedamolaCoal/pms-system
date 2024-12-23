import { Repository } from "typeorm";
import { BaseService } from "modules/services/base_service";
import { DatabaseUtil } from "modules/db";
import { Projects } from "./projects_entity";

export class ProjectsService extends BaseService<Projects> {
	constructor() {
		let projectRepository: Repository<Projects> | null = null;
		projectRepository = new DatabaseUtil().getRepository(Projects);
		super(projectRepository);
	}
}
