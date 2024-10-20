import { Repository } from "typeorm";
import { BaseService } from "modules/services/base_service";
import { DatabaseUtil } from "modules/db";
import { Roles } from "./roles_entity";

export class RolesService extends BaseService<Roles> {
	constructor() {
		// creates an instance of DatabaseUtil
		const databaseUtil = new DatabaseUtil();
		// get the roles entity repository
		const roleRepository: Repository<Roles> = databaseUtil.getRepository(Roles);
		// calls the constructor of the BaseService class with the repository as a parameter using super()
		super(roleRepository);
	}
}
