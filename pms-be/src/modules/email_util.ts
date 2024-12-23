import * as nodemailer from "nodemailer";
import * as config from "../../server_config.json";

export const sendMail = async (to: string, subject: string, body: string) => {
	try {
		// a nodemailer transporter using gmail credentials
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: config.email_config.email,
				pass: config.email_config.password,
			},
		});
		// defined email options
		const mailOptions = {
			from: config.email_config.from,
			to: to,
			subject: subject,
			html: body,
		};

		// send email
		const status = await transporter.sendMail(mailOptions);
		if (status?.messageId) {
			return status.messageId;
		} else {
			return false;
		}
	} catch (error) {
		console.error(`Error while sendMail => ${error.message}`);
		return false;
	}
};
