const certificateService = require("../services/certificateService");
const Certificate = require("../models/Certificate");
const Volunteer = require("../models/Volunteer");
const path = require("path");
const fs = require("fs");

exports.generateCertificate = async (req, res) => {
	try {
		const userId = req.user.id;
		const { eventId } = req.params;

		// Find volunteer profile
		const volunteer = await Volunteer.findOne({ user_id: userId });
		if (!volunteer) {
			return res
				.status(404)
				.json({ message: "Volunteer profile not found" });
		}

		// Check if certificate already exists
		const existingCertificate = await Certificate.findOne({
			user_id: userId,
			event_id: eventId,
		});

		let certificateData;

		if (existingCertificate) {
			// Return existing certificate
			certificateData = {
				certificate_id: existingCertificate.certificate_id,
				pdf_path: existingCertificate.pdf_path,
			};
		} else {
			// Generate new certificate
			certificateData = await certificateService.generateCertificate(
				userId,
				volunteer._id,
				eventId
			);
		}

		return res.status(200).json({
			message: "Certificate generated successfully",
			data: certificateData,
		});
	} catch (error) {
		console.error("Error generating certificate:", error);
		return res.status(500).json({
			message: "Failed to generate certificate",
			error: error.message,
		});
	}
};

exports.downloadCertificate = async (req, res) => {
	try {
		const { certificateId } = req.params;

		// Find certificate
		const certificate = await Certificate.findOne({
			certificate_id: certificateId,
		});
		if (!certificate) {
			return res.status(404).json({ message: "Certificate not found" });
		}

		// Construct file path
		const filePath = path.join(
			__dirname,
			"../public",
			certificate.pdf_path
		);

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			return res
				.status(404)
				.json({ message: "Certificate file not found" });
		}

		// Send file
		return res.download(filePath);
	} catch (error) {
		console.error("Error downloading certificate:", error);
		return res.status(500).json({
			message: "Failed to download certificate",
			error: error.message,
		});
	}
};

exports.verifyCertificate = async (req, res) => {
	try {
		const { certificateId } = req.params;

		// Verify certificate
		const verificationResult = await certificateService.verifyCertificate(
			certificateId
		);

		if (!verificationResult) {
			return res.status(404).json({
				message: "Certificate not found or invalid",
			});
		}

		return res.status(200).json({
			message: "Certificate verified successfully",
			data: verificationResult,
		});
	} catch (error) {
		console.error("Error verifying certificate:", error);
		return res.status(500).json({
			message: "Failed to verify certificate",
			error: error.message,
		});
	}
};

exports.getVolunteerCertificates = async (req, res) => {
	try {
		const userId = req.user.id;

		// Find certificates for this volunteer
		const certificates = await Certificate.find({ user_id: userId })
			.populate("event_id")
			.sort({ issuance_date: -1 });

		const certificateData = certificates.map((cert) => ({
			certificate_id: cert.certificate_id,
			event_name: cert.event_id.name,
			issuance_date: cert.issuance_date.toLocaleDateString(),
			pdf_path: cert.pdf_path,
		}));

		return res.status(200).json({
			message: "Certificates retrieved successfully",
			data: certificateData,
		});
	} catch (error) {
		console.error("Error getting certificates:", error);
		return res.status(500).json({
			message: "Failed to retrieve certificates",
			error: error.message,
		});
	}
};
