// src/components/DocumentUploader/index.jsx
import DocumentViewer from "@/components/DocumentViewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

const DocumentUploader = ({
  profile,
  onUploadSuccess,
  setError,
  isOrganizer = false, // Simple flag to determine document type
}) => {
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(null);

  // Set properties based on user type
  const documentType = isOrganizer ? "certification" : "nric";
  const title = isOrganizer ? "Charity Certification" : "NRIC Verification";
  const description = isOrganizer
    ? "Upload your charity certification document. This helps us verify your organization's charitable status."
    : "Upload your NRIC for identity verification. This helps us ensure the safety and security of our community.";
  const endpoint = isOrganizer ? "/profile/certification" : "/profile/nric";
  const fileKey = isOrganizer ? "certification_document" : "nric_image";

  // Get document data from the correct property in profile
  const documentData = isOrganizer
    ? profile?.certification_document || null
    : profile?.nric_image || null;

  // Check if document is rejected
  const isRejected = isOrganizer
    ? profile?.verification_status === "rejected" ||
      (documentData && documentData.requires_reupload)
    : documentData && documentData.requires_reupload;

  console.log(`DocumentUploader for ${documentType}:`, documentData);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleUpload = async () => {
    if (!documentFile) return;
    setUploading(true);
    setLocalSuccess(null);
    if (setError) setError(null);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append(fileKey, documentFile);

      // Use the API endpoint
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000/api"
        }${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Set the local success message instead of using the parent's setSuccess
        setLocalSuccess(
          data.message ||
            `Document uploaded successfully. It will be verified by an administrator.`
        );
        setDocumentFile(null);

        // Notify parent component about successful upload
        if (onUploadSuccess && typeof onUploadSuccess === "function") {
          onUploadSuccess();
        }
      } else {
        if (setError) setError(data.message || `Failed to upload document`);
      }
    } catch (err) {
      console.error(`Error uploading document:`, err);
      if (setError) setError(`Failed to upload document. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documentData?.verified ? (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your document has been verified
                </AlertDescription>
              </Alert>

              {documentData.filename && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    Your Uploaded Document
                  </h3>
                  <DocumentViewer
                    filename={documentData.filename}
                    documentType={documentType}
                  />
                </div>
              )}
            </>
          ) : isRejected ? (
            <>
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  Your {isOrganizer ? "certification document" : "NRIC"} has
                  been rejected. Please upload a new document.
                  {documentData?.rejection_reason && (
                    <div className="mt-2 text-sm font-medium">
                      Reason: {documentData.rejection_reason}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground mt-2">
                {description}
              </div>

              {localSuccess && (
                <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription>{localSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="document_upload"
                    className="border border-input bg-background rounded-md px-3 py-2 text-sm cursor-pointer inline-block min-w-24 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Upload New Document
                  </label>
                  <span className="text-sm text-gray-600">
                    {documentFile ? documentFile.name : "No file chosen"}
                  </span>
                  <Input
                    id="document_upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: JPEG, PNG, PDF. Max size: 5MB.
                </p>
              </div>
              {documentFile && (
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
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
          ) : documentData?.uploaded_at ? (
            <>
              <Alert className="bg-yellow-50 border-yellow-200">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Your document has been uploaded and is pending verification
                </AlertDescription>
              </Alert>

              {documentData.filename && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">
                    Your Uploaded Document
                  </h3>
                  <DocumentViewer
                    filename={documentData.filename}
                    documentType={documentType}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">{description}</div>

              {/* Success message right above the file upload container */}
              {localSuccess && (
                <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription>{localSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="document_upload"
                    className="border border-input bg-background rounded-md px-3 py-2 text-sm cursor-pointer inline-block min-w-24 text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Upload Document
                  </label>
                  <span className="text-sm text-gray-600">
                    {documentFile ? documentFile.name : "No file chosen"}
                  </span>
                  <Input
                    id="document_upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: JPEG, PNG, PDF. Max size: 5MB.
                </p>
              </div>
              {documentFile && (
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
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

export default DocumentUploader;
