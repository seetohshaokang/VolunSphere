// src/components/ReviewForm/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function ReviewForm({ type, targetId, targetName, onSubmitSuccess, onCancel, existingReview = null }) {
	const { user } = useAuth();
	const [rating, setRating] = useState(existingReview?.rating || 0);
	const [comment, setComment] = useState(existingReview?.comment || "");
	const [hoveredRating, setHoveredRating] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);
	
	const typeLabel = type === "event" ? "Event" : "Organiser";
	
	const isEditing = !!existingReview;

	const renderStars = () => {
		return (
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						className="focus:outline-none"
						onClick={() => setRating(star)}
						onMouseEnter={() => setHoveredRating(star)}
						onMouseLeave={() => setHoveredRating(0)}
					>
						<Star
							className={`h-8 w-8 cursor-pointer ${
								star <= (hoveredRating || rating)
									? "fill-yellow-400 text-yellow-400"
									: "text-gray-300"
							}`}
						/>
					</button>
				))}
				{rating > 0 && (
					<span className="ml-2 text-gray-700 font-medium">
						{rating === 1 && "Poor"}
						{rating === 2 && "Fair"}
						{rating === 3 && "Good"}
						{rating === 4 && "Very Good"}
						{rating === 5 && "Excellent"}
					</span>
				)}
			</div>
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (rating === 0) {
			setError("Please select a rating before submitting.");
			return;
		}

		setLoading(true);
		setError(null);
		
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));

			setSuccessMessage(isEditing ? "Review updated successfully!" : "Thank you for your review!");

			if (onSubmitSuccess) {
				onSubmitSuccess({ rating, comment, reviewer: user?.name || "You", date: new Date() });
			}
		} catch (err) {
			console.error("Error submitting review:", err);
			setError("Failed to submit review. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	
	if (!user) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-center p-4 text-center">
						<AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
						<p>Please log in to submit a review.</p>
					</div>
				</CardContent>
			</Card>
		);
	}
	
	return (
		<Card>
			<CardHeader>
				<CardTitle>{isEditing ? "Edit Your Review" : `Review this ${typeLabel}`}</CardTitle>
				<CardDescription>
					{isEditing 
						? "Update your feedback about your experience" 
						: `Share your experience with ${targetName}`}
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					{error && (
						<div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
							<AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
							<p>{error}</p>
						</div>
					)}
					
					{successMessage && (
						<div className="p-3 text-sm bg-green-50 border border-green-200 text-green-600 rounded-md">
							{successMessage}
						</div>
					)}
					
					<div className="space-y-2">
						<label className="font-medium block">
							Rate your experience
							<span className="text-red-500">*</span>
						</label>
						{renderStars()}
					</div>
					
					<div className="space-y-2">
						<label className="font-medium block" htmlFor="comment">
							Your feedback
						</label>
						<Textarea
							id="comment"
							placeholder={`Tell others about your experience with this ${type}...`}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={4}
						/>
					</div>
				</CardContent>
				
				<CardFooter className="flex justify-end gap-3">
					{onCancel && (
						<Button 
							type="button" 
							variant="outline"
							onClick={onCancel}
							disabled={loading}
						>
							Cancel
						</Button>
					)}
					<Button 
						type="submit" 
						disabled={loading || rating === 0 || !!successMessage}
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isEditing ? "Updating..." : "Submitting..."}
							</>
						) : (
							isEditing ? "Update Review" : "Submit Review"
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}

export default ReviewForm;