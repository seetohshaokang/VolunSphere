// server/services/certificateService.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const Certificate = require("../models/Certificate");
const Volunteer = require("../models/Volunteer");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Organiser = require("../models/Organiser");

class CertificateService {
	constructor() {
		// Create certificates directory if it doesn't exist
		this.certificatesDir = path.join(__dirname, "../public/certificates");
		if (!fs.existsSync(this.certificatesDir)) {
			fs.mkdirSync(this.certificatesDir, { recursive: true });
		}

		// Path to logo
		this.logoPath = path.join(
			__dirname,
			"../../client/src/assets/volunsphere.png"
		);
	}

	async generateCertificate(userId, volunteerId, eventId) {
		try {
			// Generate a unique certificate ID
			const certificateId = uuidv4();

			// Fetch required data
			const volunteer = await Volunteer.findOne({ _id: volunteerId });
			const event = await Event.findOne({ _id: eventId }).populate(
				"organiser_id"
			);
			const registration = await EventRegistration.findOne({
				user_id: userId,
				event_id: eventId,
			});

			if (!volunteer || !event || !registration) {
				throw new Error("Required data not found");
			}

			// Calculate hours contributed (if available)
			let hoursContributed = 0;
			if (registration.check_in_time && registration.check_out_time) {
				const checkInTime = new Date(registration.check_in_time);
				const checkOutTime = new Date(registration.check_out_time);
				hoursContributed =
					(checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert ms to hours
				hoursContributed = Math.round(hoursContributed * 10) / 10; // Round to 1 decimal place
			}

			// Get skills from volunteer profile (max 3)
			const skills = volunteer.skills.slice(0, 3);

			// Generate QR code for verification
			const verificationUrl = `http://localhost:5000/api/certificates/verify/${certificateId}`;
			const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

			// Define the certificate file path
			const pdfPath = path.join(
				this.certificatesDir,
				`${certificateId}.pdf`
			);

			// Generate the PDF certificate
			await this.createPDF(
				pdfPath,
				certificateId,
				volunteer.name,
				event.name,
				event.organiser_id.name,
				new Date(
					event.start_datetime || event.created_at
				).toLocaleDateString(),
				hoursContributed,
				skills,
				qrCodeDataUrl
			);

			// Save certificate record to database
			const certificate = new Certificate({
				user_id: userId,
				volunteer_id: volunteerId,
				event_id: eventId,
				certificate_id: certificateId,
				pdf_path: `/certificates/${certificateId}.pdf`,
				hours_contributed: hoursContributed,
				skills_demonstrated: skills,
			});

			await certificate.save();

			return {
				certificate_id: certificateId,
				pdf_path: `/certificates/${certificateId}.pdf`,
			};
		} catch (error) {
			console.error("Error generating certificate:", error);
			throw error;
		}
	}

	async createPDF(
		filePath,
		certificateId,
		volunteerName,
		eventName,
		organizerName,
		eventDate,
		hours,
		skills,
		qrCodeDataUrl
	) {
		return new Promise((resolve, reject) => {
			try {
				const doc = new PDFDocument({
					size: "A4",
					margin: 50,
					info: {
						Title: "Volunteer Participation Certificate",
						Author: "VolunSphere",
					},
				});

				const stream = fs.createWriteStream(filePath);
				doc.pipe(stream);

				// Add logo
				if (fs.existsSync(this.logoPath)) {
					doc.image(this.logoPath, 50, 50, { width: 100 });
				}

				// Add QR code
				doc.image(qrCodeDataUrl, 450, 50, { width: 100 });

				// Title
				doc.fontSize(24)
					.font("Helvetica-Bold")
					.text("CERTIFICATE OF PARTICIPATION", { align: "center" })
					.moveDown(1);

				// Certificate content
				doc.fontSize(14)
					.font("Helvetica")
					.text("This certifies that", { align: "center" })
					.moveDown(0.5);

				doc.fontSize(18)
					.font("Helvetica-Bold")
					.text(volunteerName, { align: "center" })
					.moveDown(0.5);

				doc.fontSize(14)
					.font("Helvetica")
					.text("has successfully participated as a volunteer in", {
						align: "center",
					})
					.moveDown(0.5);

				doc.fontSize(18)
					.font("Helvetica-Bold")
					.text(eventName, { align: "center" })
					.moveDown(0.5);

				doc.fontSize(14)
					.font("Helvetica")
					.text(`organized by ${organizerName} on ${eventDate}`, {
						align: "center",
					})
					.moveDown(1);

				// Hours and skills
				if (hours > 0) {
					doc.text(
						`Contributing ${hours} hours and demonstrating skills in:`,
						{ align: "center" }
					).moveDown(0.5);
				} else {
					doc.text("Demonstrating skills in:", {
						align: "center",
					}).moveDown(0.5);
				}

				doc.fontSize(16)
					.font("Helvetica-Oblique")
					.text(skills.join(", ") || "Volunteering", {
						align: "center",
					})
					.moveDown(2);

				// Signature lines
				doc.fontSize(12)
					.font("Helvetica")
					.text("_________________________", 100, 500)
					.text("_________________________", 350, 500)
					.moveDown(0.5);

				doc.text(organizerName, 100, 520)
					.text("Digital Signature", 350, 520)
					.moveDown(0.5);

				doc.fontSize(10).text("Event Organizer", 100, 535).moveDown(3);

				// Certificate ID and verification info
				doc.fontSize(10)
					.text(`Certificate ID: ${certificateId}`, 100, 600)
					.text("Verify at: voluntsphere.com/verify", 350, 600);

				doc.end();

				stream.on("finish", () => {
					resolve(filePath);
				});

				stream.on("error", (error) => {
					reject(error);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	async verifyCertificate(certificateId) {
		try {
			const certificate = await Certificate.findOne({
				certificate_id: certificateId,
			})
				.populate("volunteer_id")
				.populate("event_id")
				.populate({
					path: "event_id",
					populate: {
						path: "organiser_id",
						model: "Organiser",
					},
				});

			if (!certificate) {
				return null;
			}

			return {
				isValid: true,
				certificate_id: certificateId,
				volunteer_name: certificate.volunteer_id.name,
				event_name: certificate.event_id.name,
				organizer_name: certificate.event_id.organiser_id.name,
				issuance_date: certificate.issuance_date.toLocaleDateString(),
				event_date: new Date(
					certificate.event_id.start_datetime ||
						certificate.event_id.created_at
				).toLocaleDateString(),
				hours_contributed: certificate.hours_contributed,
				skills_demonstrated: certificate.skills_demonstrated,
			};
		} catch (error) {
			console.error("Error verifying certificate:", error);
			throw error;
		}
	}
}

module.exports = new CertificateService();
