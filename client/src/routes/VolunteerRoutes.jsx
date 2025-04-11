// src/routes/VolunteerRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route } from "react-router-dom";
import Profile from "../containers/Common/Profile";
import OrganizerProfile from "../containers/Volunteer/OrganizerProfile";
import ReviewPage from "../containers/Volunteer/Review";
import ProtectedRoute from "./ProtectedRoute";

export const VolunteerRoutes = (
	<>
		<Route element={<MainLayout />}>
			<Route
				path="/profile"
				element={
					<ProtectedRoute>
						<Profile />
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
		</Route>
	</>
);
