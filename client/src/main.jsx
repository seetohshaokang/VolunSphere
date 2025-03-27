import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Font Awesome
import "bootstrap/dist/css/bootstrap.min.css";
// AdminLTE script (if using)
// import "admin-lte/dist/js/adminlte.min";

// Import style sheets
import "./styles/ForgotPassword.module.css";
import "./styles/Login.module.css";
import "./styles/Profile.module.css";
import "./styles/Registration.module.css";
import "./styles/RegistrationOrganiser.module.css";
import "./styles/RegistrationVolunteer.module.css";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>
);
