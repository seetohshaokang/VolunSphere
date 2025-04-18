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
				qrCodeDataUrl,
				event.location || "No location specified"
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
		qrCodeDataUrl,
		location = "No location specified" // Add default location parameter
	) {
		return new Promise((resolve, reject) => {
			try {
				// Create a landscape-oriented PDF
				const doc = new PDFDocument({
					size: "A4",
					layout: "landscape", // Change to landscape orientation
					margin: 40,
					info: {
						Title: "Volunteer Participation Certificate",
						Author: "VolunSphere",
					},
				});

				const stream = fs.createWriteStream(filePath);
				doc.pipe(stream);

				// Set up dimensions for landscape
				const pageWidth = doc.page.width;
				const pageHeight = doc.page.height;

				// Add decorative border
				doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
					.lineWidth(1.5)
					.strokeColor("#3b82f6")
					.stroke();

				// Add logo (left side)
				if (fs.existsSync(this.logoPath)) {
					doc.image(this.logoPath, 50, 50, { width: 80 });
				}

				// Add QR code (right side)
				doc.image(qrCodeDataUrl, pageWidth - 140, 50, { width: 80 });

				// Add header
				doc.fontSize(28)
					.font("Helvetica-Bold")
					.fillColor("#1e293b")
					.text(
						"CERTIFICATE OF PARTICIPATION",
						pageWidth / 2 - 200,
						60,
						{
							width: 400,
							align: "center",
						}
					);

				// Main certificate content with subtle background
				doc.roundedRect(70, 120, pageWidth - 140, 200, 10)
					.fillColor("#f8fafc")
					.fill();

				// Certificate text
				doc.fontSize(16)
					.font("Helvetica")
					.fillColor("#334155")
					.text("This certifies that", { align: "center" }, 140);

				// Volunteer name (larger and bold)
				doc.fontSize(24)
					.font("Helvetica-Bold")
					.fillColor("#0f172a")
					.text(volunteerName.toUpperCase(), { align: "center" })
					.moveDown(0.5);

				// Continuing certificate text
				doc.fontSize(16)
					.font("Helvetica")
					.fillColor("#334155")
					.text("has successfully participated as a volunteer in", {
						align: "center",
					})
					.moveDown(0.5);

				// Event name (larger)
				doc.fontSize(22)
					.font("Helvetica-Bold")
					.fillColor("#0f172a")
					.text(eventName.toUpperCase(), { align: "center" })
					.moveDown(0.5);

				// Organizer and date
				doc.fontSize(16)
					.font("Helvetica")
					.fillColor("#334155")
					.text(`organized by ${organizerName} on ${eventDate}`, {
						align: "center",
					});

				// Left section - Skills
				doc.roundedRect(80, 340, 260, 130, 5)
					.fillColor("#f0f9ff")
					.fill();

				doc.fontSize(14)
					.font("Helvetica-Bold")
					.fillColor("#0f172a")
					.text("SKILLS DEMONSTRATED:", 100, 360);

				// Add skills as bullet points
				doc.fontSize(12).font("Helvetica").fillColor("#334155");

				let yPosition = 390;
				skills.forEach((skill) => {
					doc.text(`• ${skill}`, 110, yPosition);
					yPosition += 20;
				});

				// Right section - Event Details
				doc.roundedRect(pageWidth - 340, 340, 260, 130, 5)
					.fillColor("#f0f9ff")
					.fill();

				doc.fontSize(14)
					.font("Helvetica-Bold")
					.fillColor("#0f172a")
					.text("EVENT DETAILS:", pageWidth - 320, 360);

				// Add event details
				doc.fontSize(12)
					.font("Helvetica")
					.fillColor("#334155")
					.text(`Location: ${location}`, pageWidth - 320, 390)
					.text(
						`Duration: ${
							hours > 0 ? `${hours} hours` : "Not recorded"
						}`,
						pageWidth - 320,
						410
					)
					.text(
						`Cause: ${skills[0] || "Volunteering"}`,
						pageWidth - 320,
						430
					);

				// Signature lines
				doc.fontSize(12)
					.font("Helvetica")
					.fillColor("#0f172a")
					.text("_________________________", 100, 500)
					.text("_________________________", pageWidth - 320, 500)
					.moveDown(0.2);

				doc.text(organizerName, 100, 515)
					.text("Digital Signature", pageWidth - 320, 515)
					.moveDown(0.2);

				doc.fontSize(10).text("Event Organizer", 100, 530);

				// Certificate ID and verification info
				doc.fontSize(10)
					.fillColor("#64748b")
					.text(
						`Certificate ID: ${certificateId}`,
						80,
						pageHeight - 60
					)
					.text(
						`Verify at: voluntsphere.com/verify`,
						pageWidth - 300,
						pageHeight - 60
					);

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
