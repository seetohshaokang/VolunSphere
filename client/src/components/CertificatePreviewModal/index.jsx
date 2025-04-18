import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Download, ExternalLink, Loader2, X } from "lucide-react";
import { useState } from "react";

export default function CertificatePreviewModal({
	isOpen,
	onClose,
	certificateData,
}) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	if (!certificateData) return null;

	const { certificate_id, pdf_path } = certificateData;

	// Construct the full URL for the certificate
	const certificateUrl = `http://localhost:8000/certificates${pdf_path}`;
	const downloadUrl = `http://localhost:8000/api/certificates/download/${certificate_id}`;
	const verifyUrl = `http://localhost:8000/api/certificates/verify/${certificate_id}`;

	const handleIframeLoad = () => {
		setLoading(false);
	};

	const handleIframeError = () => {
		setLoading(false);
		setError("Failed to load certificate preview");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Certificate Preview</DialogTitle>
					<DialogDescription>
						Your certificate has been generated successfully
					</DialogDescription>
				</DialogHeader>

				<div className="relative min-h-[60vh] border rounded-md bg-gray-50">
					{loading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					)}

					{error ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center text-red-500">
							<X className="h-12 w-12 mb-4" />
							<p>{error}</p>
							<Button
								variant="outline"
								className="mt-4"
								onClick={() =>
									window.open(certificateUrl, "_blank")
								}
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								View in Browser
							</Button>
						</div>
					) : (
						<iframe
							src={certificateUrl}
							className="w-full h-[60vh]"
							onLoad={handleIframeLoad}
							onError={handleIframeError}
						/>
					)}
				</div>

				<DialogFooter className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Certificate ID: {certificate_id}
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => window.open(verifyUrl, "_blank")}
						>
							Verify Certificate
						</Button>
						<Button
							onClick={() => window.open(downloadUrl, "_blank")}
						>
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
