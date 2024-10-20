import express from "express";
import { validationResult } from "express-validator";

export interface IValidatorError {
	type?: string;
	message?: string;
	path?: string;
	location?: string;
}

export const validate = (validations: Array<any>) => {
	return async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		// run all the validation middleware functions and wait for them to complete
		await Promise.all(validations.map((validation) => validation.run(req)));

		// get all the validation errors
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			// if there are no errors, call the next middleware function
			return next();
		}

		// if there are errors, return them
		const errorMessages = errors.array().map((error: IValidatorError) => {
			const obj = {};
			obj[error.path] = error.message;
			return obj;
		});
		return next({ statusCode: 400, status: "error", errors: errorMessages });
	};
};
