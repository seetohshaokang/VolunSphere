// src/routes/AdminRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route } from "react-router-dom";
import AdminDashboard from "../containers/Admin/Dashboard";
import AdminEventDetail from "../containers/Admin/EventDetail";
import AdminEvents from "../containers/Admin/Events";
import AdminReportDetail from "../containers/Admin/ReportDetail";
import AdminReports from "../containers/Admin/Reports";
import AdminUserDetail from "../containers/Admin/UserDetail";
import AdminUsers from "../containers/Admin/Users";
import AdminVerifications from "../containers/Admin/Verifications";
import ProtectedRoute from "./ProtectedRoute";

export const AdminRoutes = (
	<Route
		path="/admin"
		element={
			<ProtectedRoute roleRequired="admin">
				<MainLayout />
			</ProtectedRoute>
		}
	>
		<Route index element={<AdminDashboard />} />
		<Route path="users" element={<AdminUsers />} />
		<Route path="users/:id" element={<AdminUserDetail />} />
		<Route path="reports" element={<AdminReports />} />
		<Route path="reports/:id" element={<AdminReportDetail />} />
		<Route path="verifications" element={<AdminVerifications />} />
		<Route path="events" element={<AdminEvents />} />
		<Route path="events/:id" element={<AdminEventDetail />} />
	</Route>
);
