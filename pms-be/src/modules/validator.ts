import express from "express";
import { validationResult } from "express-validator";
import Joi from "joi";

export interface IValidationError {
	type?: string;
	msg?: string;
	path?: string;
	location?: string;
}

/**
 *
 * @param validations - the data to validate
 * @returns : It sanitizes based on the validations set for each routes.
 */
// with express validator
export const validate = (validations: Array<any>) => {
	return async (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		// Run all the validation middleware functions and wait for them to complete
		await Promise.all(validations.map((validation) => validation.run(req)));

		// Get the validation errors
		const errors = validationResult(req);
		if (errors.isEmpty()) {
			// If there are no validation errors, move to the next middleware
			return next();
		}

		// If there are validation errors, format them and send a response with a 400 status
		const errorMessages = errors.array().map((error: IValidationError) => {
			const obj = {};
			obj[error.path] = error.msg;
			return obj;
		});
		res
			.status(400)
			.json({ statusCode: 400, status: "error", errors: errorMessages });
		return;
	};
};

// with joi
// export const validate = (schemas) => {
// 	return async (req, res, next) => {
// 		try {
// 			// Run all schema validations and wait for them to complete
// 			const validationResults = await Promise.all(
// 				schemas.map(({ schema, property }) => {
// 					const data = req[property];
// 					return schema.validateAsync(data, { abortEarly: false });
// 				})
// 			);

// 			// Update request with validated data (optional, if needed)
// 			schemas.forEach(({ property }, index) => {
// 				req[property] = validationResults[index];
// 			});

// 			// If all validations pass, proceed to the next middleware
// 			next();
// 		} catch (error) {
// 			// If there are validation errors, format them and send a response with a 400 status
// 			const errorMessages = error.details.map((err) => ({
// 				[err.path.join(".")]: err.message,
// 			}));
// 			console.log(errorMessages);

// 			res
// 				.status(400)
// 				.json({ statusCode: 400, status: "error", errors: errorMessages });
// 		}
// 	};
// };
