# VolunSphere API Documentation

## Authentication Endpoints

| Method | Endpoint                          | Description                   | Auth Required |
| ------ | --------------------------------- | ----------------------------- | ------------- |
| POST   | `/api/auth/register/volunteer`    | Register a new volunteer user | No            |
| POST   | `/api/auth/register/organiser`    | Register a new organiser user | No            |
| POST   | `/api/auth/register`              | Register a new user (generic) | No            |
| POST   | `/api/auth/login`                 | Login user                    | No            |
| POST   | `/api/auth/logout`                | Logout user                   | Yes           |
| POST   | `/api/auth/reset-password`        | Request password reset        | No            |
| POST   | `/api/auth/reset-password/:token` | Reset password using token    | No            |

## Profile Endpoints

| Method | Endpoint                     | Description                   | Auth Required |
| ------ | ---------------------------- | ----------------------------- | ------------- |
| GET    | `/api/profile`               | Fetch user profile            | Yes           |
| PUT    | `/api/profile`               | Update user profile           | Yes           |
| DELETE | `/api/profile`               | Delete user profile           | Yes           |
| POST   | `/api/profile/nric`          | Upload NRIC document          | Yes           |
| POST   | `/api/profile/certification` | Upload certification document | Yes           |
| GET    | `/api/profile/events`        | Get events for user's profile | Yes           |
| GET    | `/api/profile/organizer/:id` | Get public organizer profile  | No            |

## Event Endpoints

| Method | Endpoint                            | Description            | Auth Required | Role      |
| ------ | ----------------------------------- | ---------------------- | ------------- | --------- |
| GET    | `/api/events`                       | Get all events         | No            | -         |
| POST   | `/api/events`                       | Create a new event     | Yes           | Organiser |
| GET    | `/api/events/:id`                   | Get event by ID        | No            | -         |
| PUT    | `/api/events/:id`                   | Update event           | Yes           | Organiser |
| DELETE | `/api/events/:id`                   | Delete event           | Yes           | Organiser |
| POST   | `/api/events/:id/signup`            | Sign up for event      | Yes           | Volunteer |
| DELETE | `/api/events/:id/signup`            | Remove event signup    | Yes           | -         |
| GET    | `/api/events/:id/signup/status`     | Check signup status    | Yes           | -         |
| POST   | `/api/events/:id/reports`           | Report an event        | Yes           | -         |
| GET    | `/api/events/recommendations`       | Get recommended events | Yes           | Volunteer |
| GET    | `/api/events/:id/reviews`           | Get event reviews      | No            | -         |
| POST   | `/api/events/:id/reviews`           | Create event review    | Yes           | Volunteer |
| PUT    | `/api/events/:id/reviews/:reviewId` | Update event review    | Yes           | -         |
| DELETE | `/api/events/:id/reviews/:reviewId` | Delete event review    | Yes           | -         |
| GET    | `/api/events/:id/volunteers`        | Get event volunteers   | Yes           | Organiser |

## Registration Endpoints

| Method | Endpoint                           | Description                  | Auth Required | Role      |
| ------ | ---------------------------------- | ---------------------------- | ------------- | --------- |
| GET    | `/api/registrations`               | Get user registrations       | Yes           | -         |
| POST   | `/api/registrations`               | Create registration          | Yes           | Volunteer |
| GET    | `/api/registrations/:id`           | Get registration by ID       | Yes           | -         |
| PUT    | `/api/registrations/:id`           | Update registration          | Yes           | -         |
| DELETE | `/api/registrations/:id`           | Cancel registration          | Yes           | -         |
| POST   | `/api/registrations/:id/check-in`  | Check in registration        | Yes           | Organiser |
| POST   | `/api/registrations/:id/check-out` | Check out registration       | Yes           | Organiser |
| POST   | `/api/registrations/:id/feedback`  | Add feedback to registration | Yes           | -         |

## Report Endpoints

| Method | Endpoint           | Description      | Auth Required |
| ------ | ------------------ | ---------------- | ------------- |
| GET    | `/api/reports`     | Get user reports | Yes           |
| POST   | `/api/reports`     | Create report    | Yes           |
| GET    | `/api/reports/:id` | Get report by ID | Yes           |
| PUT    | `/api/reports/:id` | Update report    | Yes           |
| DELETE | `/api/reports/:id` | Delete report    | Yes           |

## Admin Endpoints

| Method | Endpoint                                 | Description                   | Auth Required | Permission     |
| ------ | ---------------------------------------- | ----------------------------- | ------------- | -------------- |
| GET    | `/api/admin/dashboard`                   | Get dashboard statistics      | Yes           | Admin          |
| GET    | `/api/admin/users`                       | Get all users                 | Yes           | manage_users   |
| GET    | `/api/admin/users/:id`                   | Get user by ID                | Yes           | manage_users   |
| PUT    | `/api/admin/users/:id/status`            | Update user status            | Yes           | manage_users   |
| GET    | `/api/admin/volunteers/verifications`    | Get pending verifications     | Yes           | manage_users   |
| PUT    | `/api/admin/volunteers/:id/verification` | Update verification status    | Yes           | manage_users   |
| GET    | `/api/admin/reports`                     | Get all reports               | Yes           | manage_reports |
| GET    | `/api/admin/reports/:id`                 | Get report by ID              | Yes           | manage_reports |
| PUT    | `/api/admin/reports/:id`                 | Update report status          | Yes           | manage_reports |
| GET    | `/api/admin/actions`                     | Get admin actions             | Yes           | manage_reports |
| POST   | `/api/admin/actions`                     | Create admin action           | Yes           | manage_reports |
| GET    | `/api/admin/events`                      | Get all events (admin view)   | Yes           | Admin          |
| GET    | `/api/admin/events/:id`                  | Get event by ID (admin view)  | Yes           | Admin          |
| PUT    | `/api/admin/events/:id/status`           | Update event status           | Yes           | Admin          |
| PUT    | `/api/admin/organisers/:id/verification` | Update organiser verification | Yes           | Admin          |

## Certificate Endpoints

| Method | Endpoint                                    | Description                | Auth Required | Role      |
| ------ | ------------------------------------------- | -------------------------- | ------------- | --------- |
| POST   | `/api/certificates/generate/:eventId`       | Generate certificate       | Yes           | Volunteer |
| GET    | `/api/certificates/download/:certificateId` | Download certificate       | No            | -         |
| GET    | `/api/certificates/verify/:certificateId`   | Verify certificate         | No            | -         |
| GET    | `/api/certificates/volunteer`               | Get volunteer certificates | Yes           | Volunteer |

## Utility Endpoints

| Method | Endpoint  | Description                | Auth Required |
| ------ | --------- | -------------------------- | ------------- |
| GET    | `/api`    | API root with version info | No            |
| GET    | `/health` | Health check endpoint      | No            |
