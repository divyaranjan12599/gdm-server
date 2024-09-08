import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD,
	},
});

const sendOtpEmail = async (email, otp) => {
	const templatePath = path.join(__dirname, "views", "otp_email.ejs");
	const html = await ejs.renderFile(templatePath, { otp });

	const mailOptions = {
		from: "DevManage999@gmail.com",
		to: email,
		subject: "Your OTP Code",
		html,
	};

	return transporter.sendMail(mailOptions);
};

const otpStore = {};

const generateOtp = () => {
	return crypto.randomInt(100000, 999999).toString();
};

const saveOtp = (email, otp) => {
	otpStore[email] = {
		otp,
		expiresAt: Date.now() + 10 * 60 * 1000,
	};
};

const verifyOtp = (email, otp) => {
	const otpData = otpStore[email];
	if (!otpData) return false;
	if (Date.now() > otpData.expiresAt) {
		delete otpStore[email];
		return false;
	}
	if (otpData.otp === otp) {
		delete otpStore[email];
		return true;
	}
	return false;
};

const sendUserAddedEmail = async (email, userName, defaultPassword) => {
	const templatePath = path.join(__dirname, "views", "added_user_email.ejs");
	const html = await ejs.renderFile(templatePath, { userName, defaultPassword });

	const mailOptions = {
		from: "DevManage999@gmail.com",
		to: email,
		subject: "Welcome to GDMTOOL",
		html,
	};

	return transporter.sendMail(mailOptions);
};

const sendAdminUserAddedEmail = async (adminEmail, adminUserName, newUserName, newUserEmail) => {
	const templatePath = path.join(__dirname, "views", "user_added_admin_email.ejs");
	const html = await ejs.renderFile(templatePath, { adminUserName, newUserName, newUserEmail });

	const mailOptions = {
		from: "DevManage999@gmail.com",
		to: adminEmail,
		subject: "New User Added",
		html,
	};

	return transporter.sendMail(mailOptions);
};

const sendAdminUserRemovedEmail = async (adminEmail, adminUserName, removedUserName, removedUserEmail) => {
	const templatePath = path.join(__dirname, "views", "user_removed_admin_email.ejs");
	const html = await ejs.renderFile(templatePath, { adminUserName, removedUserName, removedUserEmail });

	const mailOptions = {
		from: "DevManage999@gmail.com",
		to: adminEmail,
		subject: "User Removed",
		html,
	};

	return transporter.sendMail(mailOptions);
};

export { sendOtpEmail, generateOtp, saveOtp, verifyOtp, sendUserAddedEmail, sendAdminUserAddedEmail, sendAdminUserRemovedEmail };
