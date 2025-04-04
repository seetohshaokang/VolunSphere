// src/containers/Review/index.jsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Loader2, MapPin, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";
import ReviewForm from "../../../components/ReviewForm";

function ReviewPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [target, setTarget] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {

        let mockTarget;
        let mockReviews;

        if (type === "event") {
          mockTarget = {
            id: id,
            name: "Weekend Tutoring Program",
            description: "Weekly tutoring sessions for primary school students",
            location: "Ang Mo Kio Community Centre",
            date: "Every Saturday",
            organiser_name: "Happy Children Happy Future",
            organiser_id: "org123",
            image_url: "/src/assets/default-event.jpg",
          };

          mockReviews = [
            {
              id: "rev1",
              reviewer: "John Lee",
              reviewer_id: "user1",
              rating: 5,
              comment:
                "Great experience! Well organized and very fulfilling. The kids were amazing and the staff was very supportive.",
              date: "2025-03-15T08:00:00Z",
              avatar: null,
            },
            {
              id: "rev2",
              reviewer: "Sarah Tan",
              reviewer_id: "user2",
              rating: 4,
              comment:
                "Really enjoyed volunteering here. The only downside was the location was a bit hard to find.",
              date: "2025-03-10T10:30:00Z",
              avatar: null,
            },
          ];
        } else {
          mockTarget = {
            id: id,
            organisation_name: "Happy Children Happy Future",
            description:
              "Founded in June 2017, Happy Children Happy Future (HCHF) is an initiative committed to transforming the lives of Primary 1 to Secondary 3 students from low-income or single-parent families.",
            address:
              "Block 123, Ang Mo Kio Avenue 6, #01-234, Singapore 560123",
            profile_picture_url: "/src/assets/default-avatar-red.png",
          };

          mockReviews = [
            {
              id: "rev1",
              reviewer: "Michael Wong",
              reviewer_id: "user3",
              rating: 5,
              comment:
                "A fantastic organization with a clear mission. I've volunteered with them multiple times and they are very well organized.",
              date: "2025-03-05T14:20:00Z",
              avatar: null,
            },
            {
              id: "rev2",
              reviewer: "Lisa Chen",
              reviewer_id: "user4",
              rating: 5,
              comment:
                "The staff is amazing and the impact they're having on children's education is incredible. Highly recommend volunteering with them!",
              date: "2025-02-28T09:15:00Z",
              avatar: null,
            },
          ];
        }

        if (user) {
          const userHasReview = mockReviews.find(
            (review) => review.reviewer_id === user.id
          );
          if (userHasReview) {
            setUserReview(userHasReview);
            mockReviews = mockReviews.filter(
              (review) => review.reviewer_id !== user.id
            );
          }
        }

        setTarget(mockTarget);
        setReviews(mockReviews);
      } catch (err) {
        console.error(`Error fetching ${type} data:`, err);
        setError(`Failed to load ${type} details. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, user]);

  const handleSubmitReview = (newReview) => {
    const completeReview = {
      id: userReview?.id || `new-${Date.now()}`,
      reviewer: newReview.reviewer,
      reviewer_id: user.id,
      rating: newReview.rating,
      comment: newReview.comment,
      date: newReview.date.toISOString(),
      avatar: user.avatar || null,
    };

    setUserReview(completeReview);
    setIsEditingReview(false);

    const entityUrl = type === "event" ? `/events/${id}` : `/organisers/${id}`;
    setTimeout(() => {
      navigate(entityUrl);
    }, 2000);
  };

  const calculateAverageRating = () => {
    if (!reviews.length && !userReview) return 0;

    const allReviews = userReview ? [...reviews, userReview] : reviews;
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / allReviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-4 text-lg">Loading details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!target) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertDescription>
          {type === "event" ? "Event" : "Organiser"} not found.
        </AlertDescription>
      </Alert>
    );
  }

  const entityName = type === "event" ? target.name : target.organisation_name;
  const entityUrl = type === "event" ? `/events/${id}` : `/organisers/${id}`;

  const breadcrumbLinks = [
    { to: "/", label: "Home" },
    {
      to: type === "event" ? "/events" : "/organisers",
      label: type === "event" ? "Events" : "Organisers",
    },
    { to: entityUrl, label: entityName },
    { label: "Review", isActive: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Removed the first ContentHeader that was causing the error */}
          
          <ContentHeader
            title={`Review ${type === "event" ? "Event" : "Organiser"}`}
            links={breadcrumbLinks}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    {type === "event" ? (
                      <img
                        src={target.image_url}
                        alt={target.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage
                          src={target.profile_picture_url}
                          alt={target.organisation_name}
                        />
                        <AvatarFallback>
                          {target.organisation_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <h2 className="text-xl font-bold">
                      {type === "event"
                        ? target.name
                        : target.organisation_name}
                    </h2>

                    {type === "event" && (
                      <div className="mt-4 space-y-2 text-left">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">
                            {target.organiser_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">{target.date}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">
                            {target.location}
                          </span>
                        </div>
                      </div>
                    )}

                    {type === "organiser" && (
                      <div className="mt-4 text-left">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">
                            {target.address}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <p className="text-gray-600 text-sm mb-2">
                        Average Rating
                      </p>
                      <div className="flex items-center justify-center">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-bold text-lg">
                          {calculateAverageRating()}
                        </span>
                        <span className="ml-1 text-gray-500">/ 5</span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({userReview ? reviews.length + 1 : reviews.length}{" "}
                          {reviews.length + (userReview ? 1 : 0) === 1
                            ? "review"
                            : "reviews"}
                          )
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={entityUrl}>
                        Back to {type === "event" ? "Event" : "Organiser"}{" "}
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {!userReview || isEditingReview ? (
                <ReviewForm
                  type={type}
                  targetId={id}
                  targetName={
                    type === "event" ? target.name : target.organisation_name
                  }
                  onSubmitSuccess={handleSubmitReview}
                  onCancel={
                    isEditingReview ? () => setIsEditingReview(false) : null
                  }
                  existingReview={isEditingReview ? userReview : null}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="border-b pb-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage
                              src={
                                user.avatar ||
                                "/src/assets/default-avatar-blue.png"
                              }
                              alt={userReview.reviewer}
                            />
                            <AvatarFallback>
                              {userReview.reviewer.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {userReview.reviewer}
                            </h3>
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
                                {new Date(
                                  userReview.date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingReview(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="mt-3 text-gray-700">
                        {userReview.comment}
                      </p>
                    </div>

                    <h3 className="font-semibold text-lg mb-4">
                      Other Reviews
                    </h3>

                    {reviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No other reviews yet.
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="flex items-start">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage
                                src={
                                  review.avatar ||
                                  "/src/assets/default-avatar-blue.png"
                                }
                                alt={review.reviewer}
                              />
                              <AvatarFallback>
                                {review.reviewer.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {review.reviewer}
                              </h3>
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
                              <p className="mt-2 text-gray-700">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ReviewPage;