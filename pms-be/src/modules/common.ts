import * as bcrypt from "bcrypt";

export const Rights = {
	ROLES: {
		ADD: "add_role",
		EDIT: "edit_role",
		GET_ALL: "get_all_role",
		GET_DETAILS: "get_details_role",
		DELETE: "delete_role",
		ALL: "add_role, edit_role, get_all_role, get_details_role, delete_role",
	},
	USERS: {
		ADD: "add_user",
		EDIT: "edit_user",
		GET_ALL: "get_all_user",
		GET_DETAILS: "get_details_user",
		DELETE: "delete_user",
		ALL: "add_user, edit_user, get_all_user, get_details_user, delete_user",
	},
	PROJECTS: {
		ADD: "add_project",
		EDIT: "edit_project",
		GET_ALL: "get_all_project",
		GET_DETAILS: "get_details_project",
		DELETE: "delete_project",
		ALL: "add_project, edit_project, get_all_project, get_details_project, delete_project",
	},
	TASKS: {
		ADD: "add_task",
		EDIT: "edit_task",
		GET_ALL: "get_all_task",
		GET_DETAILS: "get_details_task",
		DELETE: "delete_task",
		ALL: "add_task, edit_task, get_all_task, get_details_task, delete_task",
	},
	COMMENTS: {
		ADD: "add_comment",
		EDIT: "edit_comment",
		GET_ALL: "get_all_comment",
		GET_DETAILS: "get_details_comment",
		DELETE: "delete_comment",
		ALL: "add_comment, edit_comment, get_all_comment, get_details_comment, delete_comment",
	},
};

/**
 * Encrypts a string using bcrypt hashing.
 *
 * @param {string} s - The string to be encrypted.
 * @returns {Promise<string>} - The encrypted string.
 */
export const encryptString = async (s: string): Promise<string> => {
	const encryptedString = await bcrypt.hash(s, 8);
	return encryptedString;
};

/**
 * Compares a string with a bcrypt hast to determine if they are the same.
 *
 * @param {string} s - The string to be compared.
 * @param {string} hash - The bcrypt hash to compare with.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the strings are the same.
 */

export const bcryptCompare = async (
	s: string,
	hash: string
): Promise<boolean> => {
	const isMatch = await bcrypt.compare(s, hash);
	return isMatch;
};

export const SERVER_CONST = {
	JWT_SECRET: "SecretKeyOfPMSWorkFlow",
	ACCESS_TOKEN_EXPIRY_TIME_SECONDS: 1 * 8 * 60 * 60, // 8 hours
	REFRESH_TOKEN_EXPIRY_TIME_SECONDS: 5 * 7 * 24 * 60 * 60, // one week
};
