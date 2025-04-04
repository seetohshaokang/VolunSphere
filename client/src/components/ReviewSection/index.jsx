// src/components/ReviewSection/index.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ReviewSection({ 
	entityId, 
	entityType, 
	entityName, 
	reviews = [], 
	isLoading = false, 
	showAllReviews = false,
	maxShownReviews = 3 
}) {
	const { user } = useAuth();
	const [showAll, setShowAll] = useState(showAllReviews);
	
	const userReview = user ? reviews.find(review => review.reviewer_id === user.id) : null;
	const otherReviews = user ? reviews.filter(review => review.reviewer_id !== user.id) : reviews;
	const displayedReviews = showAll ? otherReviews : otherReviews.slice(0, maxShownReviews);
	const hasMoreReviews = !showAll && otherReviews.length > maxShownReviews;
	
	const calculateAverageRating = () => {
		if (!reviews.length) return 0;
		
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return (sum / reviews.length).toFixed(1);
	};
	
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Reviews</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<span className="ml-3">Loading reviews...</span>
					</div>
				</CardContent>
			</Card>
		);
	}
	
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle>Reviews</CardTitle>
				{reviews.length > 0 && (
					<div className="flex items-center">
						<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
						<span className="ml-1 font-bold">{calculateAverageRating()}</span>
						<span className="ml-1 text-gray-500">/ 5</span>
						<span className="ml-2 text-sm text-gray-500">
							({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
						</span>
					</div>
				)}
			</CardHeader>
			<CardContent>
				{reviews.length === 0 ? (
					<div className="text-center py-6">
						<p className="text-gray-500 mb-4">No reviews yet. Be the first to share your experience!</p>
						{user && (
							<Button asChild>
								<Link to={`/${entityType}s/${entityId}/review`}>
									Write a Review
								</Link>
							</Button>
						)}
						{!user && (
							<div className="text-sm text-gray-500 italic">
								<Link to="/login" className="text-primary hover:underline">Log in</Link> to write a review
							</div>
						)}
					</div>
				) : (
					<div className="space-y-6">
						{userReview && (
							<div className="border-b pb-4 mb-4">
								<div className="flex justify-between items-start">
									<div className="flex items-start">
										<Avatar className="h-10 w-10 mr-3">
											<AvatarImage
												src={user.avatar || "/src/assets/default-avatar-blue.png"}
												alt={userReview.reviewer}
											/>
											<AvatarFallback>
												{userReview.reviewer.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold">{userReview.reviewer}</h3>
											<div className="flex items-center">
												{[...Array(5)].map((_, index) => (
													<Star
														key={index}
														className={`h-4 w-4 ${
															index < userReview.rating
																? "fill-yellow-400 text-yellow-400"
																: "text-gray-300"
														}`}
													/>
												))}
												<span className="ml-2 text-sm text-gray-500">
													{new Date(userReview.date).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										asChild
									>
										<Link to={`/${entityType}s/${entityId}/review`}>
											Edit Review
										</Link>
									</Button>
								</div>
								<p className="mt-3 text-gray-700">{userReview.comment}</p>
							</div>
						)}

						{otherReviews.length === 0 ? (
							userReview ? (
								<p className="text-gray-500 text-center">No other reviews yet.</p>
							) : (
								<div className="text-center py-6">
									<p className="text-gray-500 mb-4">No reviews yet. Be the first to share your experience!</p>
									{user && (
										<Button asChild>
											<Link to={`/${entityType}s/${entityId}/review`}>
												Write a Review
											</Link>
										</Button>
									)}
									{!user && (
										<div className="text-sm text-gray-500 italic">
											<Link to="/login" className="text-primary hover:underline">Log in</Link> to write a review
										</div>
									)}
								</div>
							)
						) : (
							<div>
								<h3 className="font-semibold text-gray-700 mb-4">
									{userReview ? "Other Reviews" : "All Reviews"}
								</h3>
								{displayedReviews.map(review => (
									<div key={review.id} className="flex items-start mb-6">
										<Avatar className="h-10 w-10 mr-3 flex-shrink-0">
											<AvatarImage
												src={review.avatar || "/src/assets/default-avatar-blue.png"}
												alt={review.reviewer}
											/>
											<AvatarFallback>
												{review.reviewer.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold">{review.reviewer}</h3>
											<div className="flex items-center">
												{[...Array(5)].map((_, index) => (
													<Star
														key={index}
														className={`h-4 w-4 ${
															index < review.rating
																? "fill-yellow-400 text-yellow-400"
																: "text-gray-300"
														}`}
													/>
												))}
												<span className="ml-2 text-sm text-gray-500">
													{new Date(review.date).toLocaleDateString()}
												</span>
											</div>
											<p className="mt-2 text-gray-700">{review.comment}</p>
										</div>
									</div>
								))}

								{hasMoreReviews && (
									<Button 
										variant="ghost" 
										className="mt-2"
										onClick={() => setShowAll(true)}
									>
										Show all {otherReviews.length} reviews
									</Button>
								)}
							</div>
						)}
					</div>
				)}
			</CardContent>
			<CardFooter className="pt-2">
				{user && !userReview && (
					<Button asChild className="w-full">
						<Link to={`/${entityType}s/${entityId}/review`}>
							Write a Review
						</Link>
					</Button>
				)}
				{!user && (
					<div className="w-full text-center">
						<Link to="/login" className="text-primary hover:underline">
							Log in
						</Link>{" "}
						to write a review
					</div>
				)}
			</CardFooter>
		</Card>
	);
}

export default ReviewSection;