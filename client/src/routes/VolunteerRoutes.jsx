// src/routes/VolunteerRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route } from "react-router-dom";
import VolunteerEventDetail from "../containers/Volunteer/EventDetail";
import OrganizerProfile from "../containers/Volunteer/OrganizerProfile";
import VolunteerProfile from "../containers/Volunteer/Profile";
import ReviewPage from "../containers/Volunteer/Review";
import ProtectedRoute from "./ProtectedRoute";
import EventMapContainer from "../containers/Volunteer/EventMapContainer";

export const VolunteerRoutes = (
	<>
		<Route element={<MainLayout />}>
			<Route
				path="/profile"
				element={
					<ProtectedRoute>
						<VolunteerProfile />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/volunteer/profile"
				element={
					<ProtectedRoute roleRequired="volunteer">
						<VolunteerProfile />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/organisers/:id"
				element={
					<ProtectedRoute roleRequired="volunteer">
						<OrganizerProfile />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/events/:id/review"
				element={
					<ProtectedRoute roleRequired="volunteer">
						<ReviewPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/organisers/:id/review"
				element={
					<ProtectedRoute roleRequired="volunteer">
						<ReviewPage />
					</ProtectedRoute>
				}
			/>
			<Route path="/events/map" element={<EventMapContainer />} />
			<Route
				path="/volunteer/events/:eventId"
				element={
					<ProtectedRoute roleRequired="volunteer">
						<VolunteerEventDetail />
					</ProtectedRoute>
				}
			/>
		</Route>
	</>
);
