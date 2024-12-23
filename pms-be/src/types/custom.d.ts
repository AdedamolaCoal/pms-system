import { Request } from "express";

declare global {
	namespace Express {
		export interface Request extends Request {
			user?: {
				username?: string;
				email?: string;
				permissions?: string[];
				user_id?: string;
			};
		}
	}
}
