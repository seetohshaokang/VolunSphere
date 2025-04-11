// src/containers/OrganiserProfile/index.jsx
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ExternalLink, Facebook, Globe, HelpCircle, Info, Instagram, Loader2, Mail, MapPin, Phone, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentHeader from "../../../components/ContentHeader";
import { useAuth } from "../../../contexts/AuthContext";
import Api from "../../../helpers/Api";
import { getEventImageUrl } from "../../../helpers/eventHelper";

function OrganisationProfile() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [organisation, setOrganisation] = useState(null);
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showReportModal, setShowReportModal] = useState(false);
	const [reportReason, setReportReason] = useState("");
	const [reportDetails, setReportDetails] = useState("");
	const [submittingReport, setSubmittingReport] = useState(false);
	const [reportSuccess, setReportSuccess] = useState(false);
	const [imageTimestamp, setImageTimestamp] = useState(Date.now());

	useEffect(() => {
		const fetchOrganisationData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Need to update this with API Calls
				const mockOrganisation = {
					_id: id,
					organisation_name: "The Community Foundation of Singapore",
					description: "Founded in 2008, the Community Foundation of Singapore (CFS) is the country's only community foundation. We are a registered charity with Institution of a Public Character (IPC) status. We believe in enabling giving that is thoughtful and impactful, working with donors to develop customised giving plans that are aligned to their values and passions.",
					phone: "+65 6550 9529",
					profile_picture_url: "/src/assets/default-avatar-red.png",
					verification_status: "verified",
					address: "6 Eu Tong Sen Street, #04-88, The Central, Singapore 059817",
					website: "https://www.cf.org.sg",
					email: "contactus@cf.org.sg",
					established: "2008",
					team_size: "25-50 members",
					social_media: {
						facebook: "https://facebook.com/CommunityFoundationofSG",
						instagram: "https://instagram.com/commfoundationsg"
					}
				};

				const mockEvents = [
					{
						id: "e1",
						name: "Healthcare Support Program",
						date: "Every Tuesday",
						description: "Weekly health support sessions for elderly",
						location: "Various Community Centers",
						registered_count: 12,
						max_volunteers: 25,
						status: "active",
						image_url: "/src/assets/default-event.jpg"
					},
					{
						id: "e2",
						name: "Annual Fundraising Gala",
						date: "2025-06-15",
						description: "Our annual charity gala to raise funds for community programs",
						location: "Marina Bay Sands Convention Centre",
						registered_count: 30,
						max_volunteers: 50,
						status: "active",
						image_url: "/src/assets/default-event.jpg"
					},
					{
						id: "e3",
						name: "Community Care Day",
						date: "2025-05-10",
						description: "A day dedicated to providing care packages and services to underprivileged families",
						location: "Various HDB Estates",
						registered_count: 18,
						max_volunteers: 40,
						status: "active",
						image_url: "/src/assets/default-event.jpg"
					}
				];

				setOrganisation(mockOrganisation);
				setEvents(mockEvents);
				setLoading(false);
			} catch (err) {
				console.error("Error fetching organiser data:", err);
				setError("Failed to load organisation profile. Please try again later.");
				setLoading(false);
			}
		};

		fetchOrganisationData();
	}, [id]);

	useEffect(() => {
		if (events.length > 0) {
			setImageTimestamp(Date.now());
		}
	}, [events]);

	const handleReport = async () => {
		if (!reportReason) {
			return;
		}

		setSubmittingReport(true);
		try {

			await new Promise(resolve => setTimeout(resolve, 1000));

			setReportSuccess(true);
			setSubmittingReport(false);
		} catch (err) {
			console.error("Error reporting organisation:", err);
			setError("Failed to submit report. Please try again.");
			setSubmittingReport(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<div className="flex justify-center items-center py-12">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
						</div>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<Alert variant="destructive" className="my-6">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	if (!organisation) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<Alert variant="destructive" className="my-6">
							<AlertDescription>Organisation not found.</AlertDescription>
						</Alert>
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<ContentHeader
						title={organisation.organisation_name}
						links={[
							{ to: "/", label: "Home" },
							{ to: "/events", label: "Events" },
							{ label: organisation.organisation_name, isActive: true },
						]}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-1">
							<Card>
								<CardContent className="pt-6">
									<div className="flex flex-col items-center text-center mb-6">
										<Avatar className="h-32 w-32 mb-4">
											<AvatarImage
												src={organisation.profile_picture_url}
												alt={organisation.organisation_name}
											/>
											<AvatarFallback>
												{organisation.organisation_name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<h2 className="text-2xl font-bold">{organisation.organisation_name}</h2>
										<div className="flex items-center mt-2">
											{organisation.verification_status === "verified" && (
												<Badge className="bg-green-100 text-green-800 mr-2">
													Verified
												</Badge>
											)}
											<Badge className="bg-blue-100 text-blue-800">
												Organiser
											</Badge>
										</div>
									</div>

									<div className="space-y-4 mt-6">
										<div className="flex items-start">
											<Info className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Established</h3>
												<p className="text-gray-600">{organisation.established}</p>
											</div>
										</div>
										
										<div className="flex items-start">
											<Users className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Team Size</h3>
												<p className="text-gray-600">{organisation.team_size}</p>
											</div>
										</div>

										<div className="flex items-start">
											<Phone className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Contact Number</h3>
												<p className="text-gray-600">{organisation.phone}</p>
											</div>
										</div>

										<div className="flex items-start">
											<Mail className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Email</h3>
												<p className="text-gray-600">{organisation.email}</p>
											</div>
										</div>

										<div className="flex items-start">
											<MapPin className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Address</h3>
												<p className="text-gray-600">{organisation.address}</p>
											</div>
										</div>

										<div className="flex items-start">
											<Globe className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
											<div>
												<h3 className="font-medium">Website</h3>
												<a 
													href={organisation.website} 
													target="_blank" 
													rel="noopener noreferrer" 
													className="text-primary hover:underline flex items-center"
												>
													{organisation.website.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')}
													<ExternalLink className="h-3 w-3 ml-1" />
												</a>
											</div>
										</div>
									</div>

									<div className="mt-6 pt-6 border-t border-gray-200">
										<h3 className="font-medium mb-2">Social Media</h3>
										<div className="flex justify-center gap-4">
											{organisation.social_media?.facebook && (
												<a href={organisation.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
													<Facebook className="h-6 w-6" />
												</a>
											)}
											{organisation.social_media?.instagram && (
												<a href={organisation.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
													<Instagram className="h-6 w-6" />
												</a>
											)}
										</div>
									</div>

									{user && user.role === "volunteer" && (
										<div className="mt-6 pt-6 border-t border-gray-200">
											<h3 className="font-medium mb-3">Share Your Experience</h3>
											<Button asChild className="w-full">
												<Link to={`/organisers/${id}/review`}>
													<Star className="h-4 w-4 mr-2" />
													Write a Review
												</Link>
											</Button>
											
											<Button 
												variant="outline" 
												className="w-full text-red-600 border-red-200 hover:bg-red-50 mt-3"
												onClick={() => setShowReportModal(true)}
											>
												Report this organisation
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div className="lg:col-span-2">
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>About</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="whitespace-pre-line text-gray-700">{organisation.description}</p>
									
									<div className="mt-8">
										<h3 className="text-lg font-semibold mb-4">Our programmes</h3>
										<div className="space-y-3">
											<div className="flex items-center p-3 rounded-md bg-blue-50">
												<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
													<HelpCircle className="h-5 w-5 text-blue-600" />
												</div>
												<div>
													<h4 className="font-medium">Healthcare Support</h4>
													<p className="text-sm text-gray-600">Supporting lower-income families with healthcare needs</p>
												</div>
											</div>
											
											<div className="flex items-center p-3 rounded-md bg-green-50">
												<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
													<Users className="h-5 w-5 text-green-600" />
												</div>
												<div>
													<h4 className="font-medium">Community Development</h4>
													<p className="text-sm text-gray-600">Building stronger communities through collective effort</p>
												</div>
											</div>
											
											<div className="flex items-center p-3 rounded-md bg-purple-50">
												<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
													<Star className="h-5 w-5 text-purple-600" />
												</div>
												<div>
													<h4 className="font-medium">Social Service Support</h4>
													<p className="text-sm text-gray-600">Bridging gaps in social services for vulnerable populations</p>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
							
							<Card>
								<CardHeader>
									<CardTitle>Current Volunteer Opportunities</CardTitle>
									<CardDescription>Join one of our ongoing initiatives</CardDescription>
								</CardHeader>
								<CardContent>
									{events.length === 0 ? (
										<p className="text-center text-gray-500 my-6">No active events at the moment.</p>
									) : (
										<div className="space-y-4">
											{events.map((event) => (
												<div key={event.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
													<div className="md:w-1/4">
														<img 
															src={getEventImageUrl(event.image_url, imageTimestamp)} 
															alt={event.name} 
															className="rounded-md w-full h-32 object-cover"
														/>
													</div>
													<div className="md:w-3/4">
														<h3 className="text-lg font-semibold mb-1">{event.name}</h3>
														<div className="flex flex-wrap gap-y-2 gap-x-4 mb-2 text-sm text-gray-600">
															<div className="flex items-center">
																<Calendar className="h-4 w-4 mr-1" />
																{typeof event.date === 'string' && !event.date.includes('-') 
																	? event.date 
																	: new Date(event.date).toLocaleDateString()
																}
															</div>
															<div className="flex items-center">
																<MapPin className="h-4 w-4 mr-1" />
																{event.location}
															</div>
															<div className="flex items-center">
																<Users className="h-4 w-4 mr-1" />
																{event.registered_count}/{event.max_volunteers} volunteers
															</div>
														</div>
														<p className="text-sm text-gray-600 mb-3">{event.description}</p>
														<Button asChild size="sm">
															<Link to={`/events/${event.id}`}>View Details</Link>
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
									
									<div className="mt-6 text-center">
										<Button asChild variant="outline">
											<Link to="/events">View All Events</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<Dialog open={showReportModal} onOpenChange={setShowReportModal}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Report Organisation</DialogTitle>
								<DialogDescription>
									If you believe this organisation violates our community guidelines, please report them below.
								</DialogDescription>
							</DialogHeader>
							
							{reportSuccess ? (
								<div className="bg-green-50 p-4 rounded-md text-green-800 my-4">
									Thank you for your report. Our team will review it shortly.
								</div>
							) : (
								<>
									<div className="space-y-4 py-4">
										<div className="space-y-2">
											<label className="font-medium">Reason for Report <span className="text-red-600">*</span></label>
											<select 
												className="w-full p-2 border rounded-md"
												value={reportReason}
												onChange={(e) => setReportReason(e.target.value)}
												required
											>
												<option value="">Select a reason</option>
												<option value="inappropriate_content">Inappropriate Content</option>
												<option value="misinformation">Misinformation</option>
												<option value="scam">Potential Scam</option>
												<option value="harmful_behavior">Harmful Behavior</option>
												<option value="other">Other</option>
											</select>
										</div>
										
										<div className="space-y-2">
											<label className="font-medium">Additional Details</label>
											<Textarea 
												placeholder="Please provide more information about your report..."
												value={reportDetails}
												onChange={(e) => setReportDetails(e.target.value)}
												rows={4}
											/>
										</div>
									</div>
									
									<DialogFooter>
										<Button variant="outline" onClick={() => setShowReportModal(false)}>
											Cancel
										</Button>
										<Button 
											onClick={handleReport} 
											disabled={!reportReason || submittingReport}
										>
											{submittingReport ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Submitting...
												</>
											) : (
												'Submit Report'
											)}
										</Button>
									</DialogFooter>
								</>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</main>
			<Footer />
		</div>
	);
}

export default OrganisationProfile;