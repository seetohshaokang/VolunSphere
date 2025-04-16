// server / utils / emailUtils.js
const nodemailer = require("nodemailer");

// Create transporter using Mailtrap credentials
const transporter = nodemailer.createTransport({
	host: "sandbox.smtp.mailtrap.io",
	port: 2525,
	auth: {
		user: "e8f6f1de30a3c7",
		pass: "6be6347a0af9dc",
	},
});

// Send password reset email
const sendResetEmail = async (email, token) => {
	const resetLink = `http://localhost:5173/reset-password/${token}`;
	const message = {
		from: '"VolunSphere" <no-reply@volunsphere.com>',
		to: email,
		subject: "Reset Your Password",
		html: `
      <h2>Reset Your Password</h2>
      <p>You requested a password reset for your VolunSphere account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      `,
	};

	await transporter.sendMail(message);
};

module.exports = {
	sendResetEmail,
};
