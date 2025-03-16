// Must need to connect to other jsx files
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Import AuthProvider
import AppRoutes from "./routes/AppRoutes";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
