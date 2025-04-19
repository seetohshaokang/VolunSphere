import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Api from "../../helpers/Api";

export default function CertificateButton({ eventId, eventName, onGenerated }) {
	const [loading, setLoading] = useState(false);

	const handleGenerateCertificate = async () => {
		setLoading(true);
		try {
			const response = await Api.generateCertificate(eventId);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to generate certificate"
				);
			}

			const data = await response.json();

			// Call the callback with the certificate data
			if (onGenerated && typeof onGenerated === "function") {
				onGenerated(data.data);
			}

			toast.success(
				`Certificate for "${eventName}" generated successfully`
			);
		} catch (error) {
			console.error("Error generating certificate:", error);
			toast.error(error.message || "Failed to generate certificate");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			className="p-2 h-9 border border-gray-300 rounded-md flex items-center justify-center"
			onClick={handleGenerateCertificate}
			disabled={loading}
		>
			{loading ? (
				<Loader2 className="h-5 w-5 animate-spin" />
			) : (
				<Award className="h-5 w-5" />
			)}
		</Button>
	);
}
