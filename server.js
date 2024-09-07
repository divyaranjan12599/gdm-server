import express, { response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "./models/userModel.js";

import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());

const connectDb = async () => {
	try {
		const connect = await mongoose.connect(MONGO_URI);
	} catch (error) {
		console.log("Db is not connected!!!", error);
	}
};

connectDb();

app.use("/user", userRoutes);

app.post("/api/auth/reset-password", async (req, res) => {
	const { email, otp, newPassword } = req.body;

	try {
		const otpValid = await verifyOtp(email, otp);
		if (!otpValid) {
			return res.status(400).json({ message: "Invalid or expired OTP" });
		}

        console.log("OTP : ", otpValid)

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		const result = await User.updateOne({ email }, { password: hashedPassword });
        console.log("Result : ", result)
		if (result.nModified === 0) {
			throw new Error("No document matched the query. Password not updated.");
		}

		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Error updating password:", error);
		res.status(500).json({ message: error.message || "Error updating password" });
	}
});


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

app.post("/api/auth/send-otp", (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ message: "Email is required" });
	}

	const otp = generateOtp();
	saveOtp(email, otp);

	sendOtpEmail(email, otp)
		.then(() => {
			res.status(200).json({ message: "OTP sent successfully" });
		})
		.catch((error) => {
			console.error("Error sending OTP:", error);
			res.status(500).json({ message: "Failed to send OTP" });
		});
});

app.post("/api/auth/verify-otp", (req, res) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		return res.status(400).json({ message: "Email and OTP are required" });
	}

	if (verifyOtp(email, otp)) {
		res.status(200).json({ message: "OTP verified successfully" });
	} else {
		res.status(400).json({ message: "Invalid or expired OTP" });
	}
});

const server = app.listen(port, () => {
	console.log("listening on port", port);
});
