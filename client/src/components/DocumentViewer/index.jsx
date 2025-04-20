// src/components/DocumentViewer/index.jsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Maximize2, RefreshCw, X } from "lucide-react";
import { useState } from "react";

const DocumentViewer = ({
	filename,
	className = "",
	documentType = "nric",
}) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isPdf, setIsPdf] = useState(
		filename?.toLowerCase().endsWith(".pdf")
	);

	const uploadPath =
		documentType === "certification" ? "organizer_docs" : "nric";

	const getDocumentUrl = () => {
		if (!filename) return null;
		const url = `${
			import.meta.env.VITE_API_URL || "http://localhost:8000"
		}/uploads/${uploadPath}/${filename}?t=${Date.now()}`;
		console.log(`Constructed document URL:`, url);
		return url;
	};
	const handleRetry = () => {
		setLoading(true);
		setError(false);

		const doc = document.getElementById(`doc-${documentType}-${filename}`);
		if (doc) {
			doc.src = getDocumentUrl();
		}
	};

	const openFullscreen = () => {
		setIsFullscreen(true);
	};

	if (!filename) {
		return (
			<div
				className={`flex justify-center items-center p-4 border rounded-md ${className}`}
			>
				<p className="text-gray-500">No document available</p>
			</div>
		);
	}

	return (
		<>
			<div
				className={`relative border rounded-md overflow-hidden ${className}`}
			>
				{loading && (
					<div className="absolute inset-0 flex justify-center items-center bg-gray-50 bg-opacity-80 z-10">
						<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
					</div>
				)}

				{error && (
					<div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-50 bg-opacity-90 z-20">
						<AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
						<p className="text-sm text-gray-600 mb-2">
							Failed to load document
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRetry}
							className="flex items-center"
						>
							<RefreshCw className="h-4 w-4 mr-1" /> Retry
						</Button>
					</div>
				)}

				{/* View button overlay */}
				{!loading && !error && (
					<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100 z-10">
						<Button
							variant="secondary"
							size="sm"
							onClick={openFullscreen}
							className="flex items-center"
						>
							<Maximize2 className="h-4 w-4 mr-1" /> View Full
							Document
						</Button>
					</div>
				)}

				{isPdf ? (
					<div className="flex justify-center items-center h-72 bg-gray-50">
						<div className="flex flex-col items-center">
							<embed
								id={`doc-${documentType}-${filename}`}
								src={getDocumentUrl()}
								type="application/pdf"
								width="100%"
								height="100"
								className="mb-2"
								onLoad={() => setLoading(false)}
								onError={() => {
									setLoading(false);
									setError(true);
									console.error(`Failed to load document`);
								}}
							/>
							<p className="text-sm text-gray-600">
								PDF Document
							</p>
							<Button
								variant="outline"
								size="sm"
								onClick={openFullscreen}
								className="mt-2"
							>
								<Maximize2 className="h-4 w-4 mr-1" /> View PDF
							</Button>
						</div>
					</div>
				) : (
					<img
						id={`doc-${documentType}-${filename}`}
						src={getDocumentUrl()}
						alt="Document"
						className="max-w-full max-h-72 object-contain w-full"
						onLoad={() => setLoading(false)}
						onError={() => {
							setLoading(false);
							setError(true);
							console.error(`Failed to load document`);
						}}
					/>
				)}
			</div>

			{/* Fullscreen document modal */}
			<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
				<DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black flex items-center justify-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsFullscreen(false)}
						className="absolute right-2 top-2 text-white hover:bg-white hover:bg-opacity-20 z-50"
					>
						<X className="h-5 w-5" />
					</Button>

					{isPdf ? (
						<iframe
							src={getDocumentUrl()}
							width="100%"
							height="100%"
							style={{ border: "none" }}
							title="Document Viewer"
						/>
					) : (
						<img
							src={getDocumentUrl()}
							alt="Document Full View"
							className="max-w-full max-h-[90vh] object-contain"
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default DocumentViewer;
