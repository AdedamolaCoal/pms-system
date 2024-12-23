import express, { Request, Response } from "express";
import { BaseController } from "modules/base_controller";
import { SERVER_CONST, bcryptCompare, encryptString } from "modules/common";
import { RolesUtil } from "@components/roles/roles_controller";
import * as jwt from "jsonwebtoken";
import { hasPermission } from "modules/auth_util";
import { sendMail } from "modules/email_util";
import { Users } from "@components/users/users_entity";
import * as config from "../../../server_config.json";
import { UsersService } from "./users_service";

interface RequestWithUser extends Request {
	user: {
		user_id?: string;
		username?: string;
		email?: string;
		permissions?: string[];
	};
}

export class UserController extends BaseController {
	/**
	 * Handles the creation of a new user
	 *
	 * @param {Request} req - The request object
	 * @param {Response} res - The response object
	 */
	public async addHandler(req: RequestWithUser, res: Response): Promise<void> {
		if (!hasPermission(req.user.permissions, "add_user")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		try {
			const service = new UsersService();
			const user = req.body;
			const isValidRole = await RolesUtil.checkValidRoleIds([user.role_id]);
			if (!isValidRole) {
				res.status(500).json({
					statusCode: 500,
					status: "error",
					message: "Invalid role ids",
				});
				return;
			}

			user.email = user.email?.toLowerCase();
			user.username = user.username?.toLowerCase();

			// encrypts password
			user.password = await encryptString(user.password);

			// if role id's are valid, then create user
			const createdUser = await service.create(user);
			res
				.status(createdUser.statusCode)
				.json({ createdUser, message: "User created successfully" });
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.json({ statusCode: 500, status: "error", message: error.message });
		}
	}

	public async getAllHandler(req: RequestWithUser, res: Response) {
		console.log(req.user);
		if (!req.user || !hasPermission(req.user.permissions, "get_all_users")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const service = new UsersService();
		const result = await service.findAll(req.query);
		if (result.statusCode === 200) {
			// removes the password field from being returned in he response
			result.data.forEach((i) => delete i.password);
		}
		res
			.status(result.statusCode)
			.json({ result, message: "All Users", total: result.data.length });
		return;
	}

	public async getOneHandler(req: RequestWithUser, res: Response) {
		if (!hasPermission(req.user.permissions, "get_one_user")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}
		const service = new UsersService();
		const result = await service.findOne(req.params.id);
		if (result.statusCode === 200) {
			delete result.data.password;
		}
		res
			.status(result.statusCode)
			.json({ result, message: "User updated successfully" });
		return;
	}

	public async updateHandler(req: RequestWithUser, res: Response) {
		if (!hasPermission(req.user.permissions, "edit_user")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new UsersService();
		const user = req.body;

		// email and username will not be updated, so it'll be removed
		delete user?.email;
		delete user?.username;

		// password will also not be updated here, it'll be in the change password method
		delete user?.password;

		const result = await service.update(req.params.id, user);
		if (result.statusCode === 200) {
			delete result.data.password;
		}
		res.status(result.statusCode).json(result);
		return;
	}

	public async deleteHandler(req: RequestWithUser, res: Response) {
		if (!hasPermission(req.user.permissions, "delete_user")) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "Unauthorized request denied",
			});
			return;
		}

		const service = new UsersService();
		const result = await service.delete(req.params.id);
		res.status(result.statusCode).json(result);
		return;
	}

	/**
	 * Handles user login by checking credentials, generating tokens, and responding with tokens.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 */
	public async login(req: Request, res: Response): Promise<void> {
		const { email, password } = req.body;

		const service = new UsersService();
		const result = await service.findAll({ email: email });
		if (!result || !Array.isArray(result.data) || result.data.length < 1) {
			res.status(result.statusCode ? result.statusCode : 404).json({
				statusCode: result.statusCode ? result.statusCode : 404,
				status: "error",
				message: result.message ? result.message : "User not found",
			});
			return;
		}
		const user = result.data[0];

		const comparePasswords = await bcryptCompare(password, user.password);
		if (!comparePasswords) {
			res.status(400).json({
				statusCode: 400,
				status: "error",
				message: "Incorrect Password",
			});
			return;
		}

		// generates access and refresh token
		const accessToken: string = jwt.sign(
			{
				email: user.email,
				username: user.username,
			},
			SERVER_CONST.JWT_SECRET,
			{ expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
		);

		const refreshToken: string = jwt.sign(
			{
				email: user.email,
				username: user.username,
			},
			SERVER_CONST.JWT_SECRET,
			{ expiresIn: SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS }
		);
		// removes the password field from being returned in he response
		delete user.password;

		// respond with the tokens
		res.status(200).json({
			statusCode: 200,
			status: "success",
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken,
				data: user,
			},
		});
	}

	/**
	 * Generates a new access token using a valid refresh token.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 */
	public async getAccessTokenFromRefreshToken(
		req: Request,
		res: Response
	): Promise<void> {
		// retrieves the refresh token from the body
		const refreshToken: string = req.body.refreshToken;

		// verifies the refresh token
		jwt.verify(refreshToken, SERVER_CONST.JWT_SECRET, (err, user) => {
			if (err) {
				res.status(403).json({
					statusCode: 403,
					status: "error",
					message: err.message ? err.message : "Invalid refresh token",
				});
				return;
			}

			// getting the user is missing here

			// generates a new access token using user info from the refresh token
			const accessToken: string = jwt.sign(user, SERVER_CONST.JWT_SECRET, {
				expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS,
			});

			// respond with the new access token
			res.status(200).json({
				statusCode: 200,
				status: "success",
				data: { accessToken: accessToken },
			});
		});
	}

	/**
	 * handles user change password
	 *
	 * @params {Request} req - The request object
	 * @params {Response} res - The response object
	 */
	public async changePassword(
		req: RequestWithUser,
		res: Response
	): Promise<void> {
		const { oldPassword, newPassword } = req.body;

		const service = new UsersService();
		const findUser = await service.findOne(req.params.id);

		if (findUser.statusCode !== 200) {
			res
				.status(404)
				.json({ statusCode: 404, status: "error", message: "User not found" });
			return;
		}

		const user = findUser.data;
		// checks if requested user id and session user id matches
		if (user?.username !== req.user?.username) {
			res.status(403).json({
				statusCode: 403,
				status: "error",
				message: "User can only change their own password",
			});
			return;
		}

		// checks if old password is correct
		const comparePasswords = await bcryptCompare(oldPassword, user.password);
		if (!comparePasswords) {
			res.status(400).json({
				statusCode: 400,
				status: "error",
				message: "Invalid old password",
			});
			return;
		}

		// hash the new password
		user.password = await encryptString(newPassword);
		const result = await service.update(req.params.id, user);
		if (result.statusCode === 200) {
			res.status(200).json({
				statusCode: 200,
				status: "success",
				message: "Password changed successfully",
			});
			return;
		} else {
			res.status(result.statusCode).json(result);
			return;
		}
	}

	/**
	 * handles users forgot password
	 *
	 * @params {Request} req - The request object
	 * @params {Response} res - The response object
	 */
	public async forgotPassword(req: Request, res: Response): Promise<void> {
		const { email } = req.body;
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email)) {
			console.log(emailPattern.test(email));
			res
				.status(400)
				.json({ statusCode: 400, status: "error", message: "Invalid email" });
			return;
		}
		const user: Users = await UsersUtil.getUserByEmail(email);
		if (!user) {
			res
				.status(404)
				.json({ statusCode: 404, status: "error", message: "User not found" });
			return;
		}

		// generates a reset token for the user
		const resetToken = jwt.sign(
			{ email: user.email },
			SERVER_CONST.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		// generates a reest link
		const resetLink = `${config.front_app_url}/api/reset-password?token=${resetToken}`;
		const mailOptions = {
			to: email,
			subject: "Password Reset",
			html: ` Hello ${user.username},<p>We received a request to reset your password. If you didn't initiate this request, please ignore this email.</p>
           <p>To reset your password, please click the link below:</p>
           <p><a href="${resetLink}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">Reset Password</a></p>
           <p>If the link doesn't work, you can copy and paste the following URL into your browser:</p>
           <p>${resetLink}</p>
           <p>This link will expire in 1 hour for security reasons.</p>
           <p>If you didn't request a password reset, you can safely ignore this email.</p>
           <p>Best regards,<br>PMS Team</p>`,
		};
		const emailStatus = await sendMail(
			mailOptions.to,
			mailOptions.subject,
			mailOptions.html
		);
		if (emailStatus) {
			res.status(200).json({
				statusCode: 200,
				status: "success",
				message: "Password reset link sent to your email",
			});
		} else {
			res.status(400).json({
				statusCode: 400,
				status: "error",
				message: "Something went wrong, try again",
			});
		}
		return;
	}

	/**
	 * handles users reset password
	 *
	 * @params {Request} req - The request object
	 * @params {Response} res - The response object
	 */
	public async resetPassword(req: Request, res: Response): Promise<void> {
		const { newPassword, token } = req.body;
		const service = new UsersService();
		let email;

		try {
			const decodedToken = jwt.verify(token, SERVER_CONST.JWT_SECRET);
			if (!decodedToken) {
				throw new Error("Invalid reset token");
			}
			email = decodedToken["email"];
		} catch (error) {
			console.error(error);
			res
				.status(400)
				.json({
					statusCode: 400,
					status: "error",
					message: "Invalid or expired reset token",
				})
				.end();
			return;
		}

		try {
			const user = await UsersUtil.getUserByEmail(email);
			if (!user) {
				res
					.status(404)
					.json({ statusCode: 404, status: "error", message: "User not found" })
					.end();
				return;
			}

			// encrypts the user's new password
			user.password = await encryptString(newPassword);
			const result = await service.update(user.user_id, user);

			if (result.statusCode === 200) {
				res.status(200).json({
					statusCode: 200,
					status: "success",
					message: "Password changed successfully",
				});
			} else {
				res.status(result.statusCode).json(result);
			}
		} catch (error) {
			console.error(error);
			res
				.status(500)
				.json({
					statusCode: 500,
					status: "error",
					message: "Something went wrong, try again",
				})
				.end();
		}
	}
}

/**
 * handles user utils
 *
 * @params {username} string - The username of the user
 * @returns null
 */
export class UsersUtil {
	public static async getUserFromUsername(username: string) {
		try {
			if (username) {
				const service = new UsersService();
				const users = await service.customQuery(`username = '${username}'`);
				if (users && users.length > 0) {
					return users[0];
				}
			}
		} catch (error) {
			console.error(`Error while getUserFromToken() => ${error.message}`);
		}
		return null;
	}

	public static async getUserByEmail(email: string) {
		try {
			if (email) {
				const service = new UsersService();
				const users = await service.customQuery(`email = '${email}'`);
				if (users && users.length > 0) {
					return users[0];
				}
			}
		} catch (error) {
			console.error(`Error while getUserFromToken() => ${error.message}`);
		}
		return null;
	}

	public static async checkValidUserIds(user_ids: Array<string>) {
		const userService = new UsersService();

		const users = await userService.findByIds(user_ids);
		console.log(users);
		return users.data.length === user_ids.length;
	}

	public static async getUsernamesById(user_ids: Array<string>) {
		const userService = new UsersService();

		const queryResult = await userService.findByIds(user_ids);
		if (queryResult.statusCode === 200) {
			const users = queryResult.data;
			const usernames = users.map((user) => {
				return {
					username: user.username,
					user_id: user.user_id,
				};
			});
			return usernames;
		}
		return [];
	}
}
