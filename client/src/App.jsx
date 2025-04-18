import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppRoutes />
				<Toaster
					position="top-right"
					toastOptions={{
						dureation: 4000,
						style: {
							background: "#333",
							color: "#fff",
						},
					}}
				/>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
