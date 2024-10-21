import express from "express";
import { validationResult } from "express-validator";

export interface IValidatorError {
	type?: string;
	message?: string;
	path?: string;
	location?: string;
}

/**
 *
 * @param validations : takes the arguments from express-validator for the particular route
 * @returns : It sanitizes based on the validations set for each routes.
 */
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
		// const errorMessages = errors.array().map((error: IValidatorError) => {
		// 	const obj = {};
		// 	obj[error.path] = error.message;
		// 	return obj;
		// });
		// If there are errors, format them and return a response
		const errorMessages = errors.array().map((error) => {
			return { [error.type]: error.msg };
		});
		res
			.status(400)
			.json({ statusCode: 400, status: "error", errors: errorMessages });
		return next();
	};
};
