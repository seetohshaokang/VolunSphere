import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink, Loader2, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../../helpers/Api";

export default function CertificateVerification() {
	const { certificateId } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [certificate, setCertificate] = useState(null);

	useEffect(() => {
		const verifyCertificate = async () => {
			if (!certificateId) {
				setError("Certificate ID is required");
				setLoading(false);
				return;
			}

			try {
				const response = await Api.verifyCertificate(certificateId);
				if (!response.ok) {
					throw new Error("Certificate could not be verified");
				}

				const data = await response.json();
				setCertificate(data.data);
			} catch (err) {
				setError(err.message || "Failed to verify certificate");
			} finally {
				setLoading(false);
			}
		};

		verifyCertificate();
	}, [certificateId]);

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
				<h2 className="text-xl font-semibold">Verifying Certificate</h2>
				<p className="text-muted-foreground">Please wait...</p>
			</div>
		);
	}

	if (error || !certificate) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<div className="bg-red-50 text-red-700 rounded-full p-4 mb-4">
					<X className="h-12 w-12" />
				</div>
				<h2 className="text-xl font-semibold text-red-700">
					Verification Failed
				</h2>
				<p className="text-muted-foreground mb-6">
					{error || "Certificate could not be verified"}
				</p>
				<Button
					onClick={() => (window.location.href = "/")}
					variant="outline"
				>
					Return to Home
				</Button>
			</div>
		);
	}

	const certificateUrl = `http://localhost:8000${certificate.pdf_path}`;
	const downloadUrl = `http://localhost:8000/api/certificates/download/${certificate.certificate_id}`;

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="max-w-3xl w-full">
				<div className="text-center mb-8">
					<div className="bg-green-50 text-green-700 rounded-full p-4 inline-block mb-4">
						<Shield className="h-12 w-12" />
					</div>
					<h2 className="text-2xl font-bold text-green-700">
						Certificate Verified
					</h2>
					<p className="text-muted-foreground">
						This certificate has been verified as authentic
					</p>
				</div>

				<Card className="p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Issued To
							</h3>
							<p className="text-lg font-medium">
								{certificate.volunteer_name}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Event
							</h3>
							<p className="text-lg font-medium">
								{certificate.event_name}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Organizer
							</h3>
							<p className="text-lg font-medium">
								{certificate.organizer_name}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Event Date
							</h3>
							<p className="text-lg font-medium">
								{certificate.event_date}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Hours Contributed
							</h3>
							<p className="text-lg font-medium">
								{certificate.hours_contributed ||
									"Not recorded"}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Skills Demonstrated
							</h3>
							<p className="text-lg font-medium">
								{certificate.skills_demonstrated &&
								certificate.skills_demonstrated.length > 0
									? certificate.skills_demonstrated.join(", ")
									: "Not specified"}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Certificate ID
							</h3>
							<p className="text-lg font-medium">
								{certificate.certificate_id}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">
								Issuance Date
							</h3>
							<p className="text-lg font-medium">
								{certificate.issuance_date}
							</p>
						</div>
					</div>
				</Card>

				<div className="flex flex-col md:flex-row gap-4 justify-center">
					<Button
						onClick={() => window.open(certificateUrl, "_blank")}
						variant="outline"
					>
						<ExternalLink className="h-4 w-4 mr-2" />
						View Certificate
					</Button>
					<Button onClick={() => window.open(downloadUrl, "_blank")}>
						<Download className="h-4 w-4 mr-2" />
						Download Certificate
					</Button>
				</div>
			</div>
		</div>
	);
}
