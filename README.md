# VolunSphere - Volunteer Engagement Platform

_A web platform to connect volunteers with organisations and manage events efficiently._

---

## 📖 Overview

VolunSphere is a **volunteer engagement platform** that enables:

-   **Volunteers** to browse and sign up for events, track hours, and build connections
-   **Organisations** to create and manage volunteering opportunities
-   **Admin** to oversee the platform and approve event listings

📌 **Project for IS3106 - Enterprise Systems Interface Design and Development.**

---

## 🚀 Features

### For Volunteers

-   Browse, search, and sign up for volunteer events
-   View event details and location on maps
-   Track volunteer hours and participation history
-   Review events and organizations
-   Build a volunteer profile and track personal impact
-   Discover organizations and their upcoming events

### For Organizations

-   Create and manage volunteer events
-   Track registrations and attendance
-   View volunteer details for registered participants
-   Manage organization profile and verification
-   Analyze participation metrics and event statistics

### For Administrators

-   Oversee platform operations and system statistics
-   Approve event listings and organizational profiles
-   Manage user accounts and handle reports
-   Access comprehensive dashboard analytics
-   Maintain platform integrity and safety

---

## 💻 Technologies Used

| **Stack**          | **Technologies**                    |
| ------------------ | ----------------------------------- |
| **Frontend**       | React.js, Tailwind CSS, Shadcn/UI   |
| **Backend**        | Node.js (Express), MongoDB          |
| **Authentication** | JWT, Passport                       |
| **Features**       | Google Maps API, PDF generation     |
| **Deployment**     | Vercel (Frontend), Render (Backend) |

---

## 1️⃣ Setup & Installation

### Clone the Repository

```bash
git clone https://github.com/seetohshaokang/VolunSphere.git
cd VolunSphere
```

## 2️⃣ Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

## 3️⃣ Set up Environment Variables

Create a `.env` file in the client folder:

```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=<Your Google Maps API Key>
```

Create a `.env.server` file in the server folder with your MongoDB connection string and other required variables.

## 4️⃣ Start the Development Server

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

## 🔧 Additional Scripts

```bash
# Seed review data (server)
npm run seed-reviews

# Auto-complete events that have passed
npm run auto-complete
```

## 👥 Team Members

| **Name**             |
| -------------------- |
| **Bryan Eng**        |
| **Chong Zi Yuan**    |
| **Edwitt Lim**       |
| **Sohn Jong Hyun**   |
| **Seetoh Shao Kang** |
