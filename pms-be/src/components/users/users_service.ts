import { Repository } from "typeorm";
import { BaseService } from "modules/services/base_service";
import { DatabaseUtil } from "modules/db";
import { Users } from "./users_entity";

export class UsersService extends BaseService<Users> {
	constructor() {
		// creates an instance of DatabaseUtil
		// const databaseUtil = new DatabaseUtil();
		let userRepository: Repository<Users> | null = null;
		// get the users entity repository
		// const userRepository: Repository<Users> = databaseUtil.getRepository(Users);
		userRepository = new DatabaseUtil().getRepository(Users);
		// calls the constructor of the BaseService class with the repository as a parameter using super()
		super(userRepository);
	}
}
