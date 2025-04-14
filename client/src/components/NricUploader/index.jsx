// src/components/NricUploader/index.jsx
import NricViewer from "@/components/NricViewer"; // Import the NricViewer component
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useState } from "react";

const NricUploader = ({ profile, onUploadSuccess, setError, setSuccess }) => {
	const [nricFile, setNricFile] = useState(null);
	const [uploadingNric, setUploadingNric] = useState(false);

	console.log("NricUploader received profile:", profile);
	console.log("NricUploader - nric_image:", profile?.nric_image);
	console.log("Has uploaded_at?", !!profile?.nric_image?.uploaded_at);
	console.log("Has filename?", !!profile?.nric_image?.filename);

	const handleNricFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setNricFile(file);
		}
	};

	const handleNricUpload = async () => {
		if (!nricFile) return;

		setUploadingNric(true);
		if (setError) setError(null);
		if (setSuccess) setSuccess(null);

		try {
			// Create FormData for the API call
			const formData = new FormData();
			formData.append("nric_image", nricFile);

			// Use the Api.uploadNRIC method
			const response = await fetch(
				`${
					import.meta.env.VITE_API_URL || "http://localhost:8000/api"
				}/profile/nric`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"token"
						)}`,
					},
					body: formData,
				}
			);

			const data = await response.json();

			if (response.ok) {
				if (setSuccess)
					setSuccess(
						data.message ||
							"NRIC uploaded successfully. It will be verified by an administrator."
					);
				setNricFile(null);

				// Notify parent component about successful upload
				if (onUploadSuccess && typeof onUploadSuccess === "function") {
					onUploadSuccess();
				}
			} else {
				if (setError) setError(data.message || "Failed to upload NRIC");
			}
		} catch (err) {
			console.error("Error uploading NRIC:", err);
			if (setError) setError("Failed to upload NRIC. Please try again.");
		} finally {
			setUploadingNric(false);
		}
	};

	return (
		<Card className="md:col-span-3">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle>NRIC Verification</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{profile?.nric_image?.verified ? (
						<>
							<Alert className="bg-green-50 border-green-200">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-700">
									Your NRIC has been verified
								</AlertDescription>
							</Alert>

							{/* Using NricViewer component for consistency */}
							{profile.nric_image.filename && (
								<div className="mt-4">
									<h3 className="text-sm font-semibold mb-2">
										Your Uploaded NRIC
									</h3>
									<NricViewer
										filename={
											profile.nric_image.filename ||
											profile.nric_image.data
										}
									/>
								</div>
							)}
						</>
					) : profile?.nric_image?.uploaded_at ? (
						<>
							<Alert className="bg-yellow-50 border-yellow-200">
								<Clock className="h-4 w-4 text-yellow-600" />
								<AlertDescription className="text-yellow-700">
									Your NRIC has been uploaded and is pending
									verification
								</AlertDescription>
							</Alert>

							{/* Using NricViewer component for consistency */}
							{profile.nric_image.filename && (
								<div className="mt-4">
									<h3 className="text-sm font-semibold mb-2">
										Your Uploaded NRIC
									</h3>
									<NricViewer
										filename={profile.nric_image.filename}
									/>
								</div>
							)}
						</>
					) : (
						<>
							<div className="text-sm text-muted-foreground">
								Upload your NRIC for identity verification. This
								helps us ensure the safety and security of our
								community.
							</div>
							<div className="relative">
								<div className="flex items-center gap-2">
									<label
										htmlFor="nric_upload"
										className="border border-input bg-background rounded-md px-3 py-2 text-sm cursor-pointer inline-block min-w-24 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
									>
										Upload NRIC
									</label>
									<span className="text-sm text-gray-600">
										{nricFile
											? nricFile.name
											: "No file chosen"}
									</span>
									<Input
										id="nric_upload"
										type="file"
										accept="image/*"
										onChange={handleNricFileChange}
										className="hidden"
									/>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Accepted formats: JPEG, PNG, WebP. Max size:
									5MB.
								</p>
							</div>
							{nricFile && (
								<Button
									onClick={handleNricUpload}
									disabled={uploadingNric}
								>
									{uploadingNric ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Uploading...
										</>
									) : (
										"Submit for Verification"
									)}
								</Button>
							)}
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default NricUploader;
