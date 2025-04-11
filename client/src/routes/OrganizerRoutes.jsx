// src/routes/OrganizerRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route } from "react-router-dom";
import Profile from "../containers/Common/Profile";
import OrganizerDashboard from "../containers/Organizer/Dashboard";
import OrganizerEventDetail from "../containers/Organizer/EventDetail";
import OrganizerManageEvent from "../containers/Organizer/ManageEvent";
import ProtectedRoute from "./ProtectedRoute";

export const OrganizerRoutes = (
	<>
		<Route
			path="/profile"
			element={
				<ProtectedRoute roleRequired="organiser">
					<Profile />
				</ProtectedRoute>
			}
		/>

		<Route
			path="/events/create"
			element={
				<ProtectedRoute roleRequired="organiser">
					<OrganizerManageEvent />
				</ProtectedRoute>
			}
		/>

		<Route
			path="/events/edit/:id"
			element={
				<ProtectedRoute roleRequired="organiser">
					<OrganizerManageEvent />
				</ProtectedRoute>
			}
		/>

		<Route
			path="/organizer"
			element={
				<ProtectedRoute roleRequired="organiser">
					<MainLayout />
				</ProtectedRoute>
			}
		>
			<Route index element={<OrganizerDashboard />} />
			<Route path="events/:eventId" element={<OrganizerEventDetail />} />
		</Route>
	</>
);
