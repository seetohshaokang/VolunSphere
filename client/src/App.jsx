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
					position="top-center"
					toastOptions={{
						// Default styles for all toasts
						style: {
							padding: "16px",
							border: "1px solid #E5E7EB",
							borderRadius: "0.375rem",
							marginBottom: "10px", // Added a bit of margin at the bottom
							marginLeft: "10px", // Added a bit of margin on the left
						},
						// Default duration
						duration: 4000,
						// Custom styles for different toast types
						success: {
							style: {
								background: "#dcfce7",
								color: "#166534",
								border: "1px solid #bbf7d0",
							},
							icon: "✅",
						},
						error: {
							style: {
								background: "#fee2e2",
								color: "#b91c1c",
								border: "1px solid #fecaca",
							},
							icon: "❌",
						},
					}}
				/>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
