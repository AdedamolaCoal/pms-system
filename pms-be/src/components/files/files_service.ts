import { BaseService } from "modules/services/base_service";
import { Files } from "./files_entity";
import { Repository } from "typeorm";
import { DatabaseUtil } from "modules/db";

export class FilesService extends BaseService<Files> {
	constructor() {
		let filesRepository: Repository<Files> | null = null;
		filesRepository = new DatabaseUtil().getRepository(Files);
		super(filesRepository);
	}
}
