// src/routes/OrganizerRoutes.jsx
import MainLayout from "@/components/MainLayout";
import { Route } from "react-router-dom";
import Profile from "../containers/Common/Profile";
import OrganizerDashboard from "../containers/Organizer/Dashboard";
import OrganizerEventDetail from "../containers/Organizer/EventDetail";
import OrganizerManageEvent from "../containers/Organizer/ManageEvent";
import EventVolunteersPage from "../containers/Organizer/EventVolunteers";
import ProtectedRoute from "./ProtectedRoute";

export const OrganizerRoutes = (
  <>
    <Route
      element={
        <ProtectedRoute roleRequired="organiser">
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute roleRequired="organiser">
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="/organizer" element={<OrganizerDashboard />} />
      <Route
        path="/organizer/events/:eventId"
        element={<OrganizerEventDetail />}
      />
      <Route
        path="/organizer/events/:eventId/volunteers"
        element={<EventVolunteersPage />}
      />
      <Route path="/events/create" element={<OrganizerManageEvent />} />
      <Route path="/events/edit/:id" element={<OrganizerManageEvent />} />
    </Route>
  </>
);
