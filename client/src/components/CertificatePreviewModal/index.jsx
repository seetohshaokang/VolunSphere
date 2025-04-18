import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Award, Download, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CertificatePreviewModal({
	isOpen,
	onClose,
	certificateData,
}) {
	const navigate = useNavigate();

	if (!certificateData) return null;

	const { certificate_id, pdf_path } = certificateData;

	// Construct the full URLs for the certificate
	const certificateUrl = `http://localhost:8000${pdf_path}`;
	const downloadUrl = `http://localhost:8000/api/certificates/download/${certificate_id}`;

	// Function to handle certificate verification
	const handleVerifyCertificate = () => {
		// Close the modal first
		onClose();

		// Navigate to the verification page
		navigate(`/certificates/verify/${certificate_id}`);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Certificate Generated</DialogTitle>
					<DialogDescription>
						Your certificate has been generated successfully
					</DialogDescription>
				</DialogHeader>

				<div className="relative min-h-[60vh] border rounded-md bg-gray-50 flex flex-col items-center justify-center p-8">
					<div className="text-center mb-6">
						<Award className="h-20 w-20 text-primary mb-4 mx-auto" />
						<h3 className="text-2xl font-semibold mb-2">
							Certificate Ready!
						</h3>
						<p className="text-muted-foreground max-w-md mx-auto">
							Your certificate has been generated successfully.
							You can view it in your browser or download it to
							your device.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 mt-6">
						<Button
							variant="outline"
							size="lg"
							className="flex items-center px-6"
							onClick={() =>
								window.open(certificateUrl, "_blank")
							}
						>
							<ExternalLink className="h-5 w-5 mr-2" />
							View Certificate
						</Button>
						<Button
							size="lg"
							className="flex items-center px-6"
							onClick={() => window.open(downloadUrl, "_blank")}
						>
							<Download className="h-5 w-5 mr-2" />
							Download Certificate
						</Button>
					</div>

					<div className="mt-8 text-center">
						<p className="text-sm text-muted-foreground mb-2">
							Share this certificate on your social media or
							include it in your portfolio
						</p>
						<p className="text-xs text-muted-foreground">
							Certificate ID: {certificate_id}
						</p>
					</div>
				</div>

				<DialogFooter className="flex items-center justify-between">
					<Button
						variant="link"
						onClick={handleVerifyCertificate}
						className="text-sm"
					>
						Verify Certificate
					</Button>
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
