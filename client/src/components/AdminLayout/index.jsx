import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../AdminSidebar";
import Footer from "../Footer";
import Navbar from "../Navbar";

const AdminLayout = () => {
	const [minContentHeight, setMinContentHeight] = useState("auto");
	const location = useLocation();

	// Update min-height when route changes to ensure consistent sidebar height
	useEffect(() => {
		const updateMinHeight = () => {
			const windowHeight = window.innerHeight;
			const navbarHeight = 64; // Approximate navbar height
			const footerHeight = 60; // Approximate footer height
			const padding = 48; // Account for top and bottom padding

			const availableHeight =
				windowHeight - navbarHeight - footerHeight - padding;
			setMinContentHeight(`${availableHeight}px`);
		};

		updateMinHeight();
		window.addEventListener("resize", updateMinHeight);

		return () => window.removeEventListener("resize", updateMinHeight);
	}, [location.pathname]);

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div
						className="flex flex-row gap-6"
						style={{ minHeight: minContentHeight }}
					>
						<div className="w-48 flex-shrink-0">
							<AdminSidebar />
						</div>
						<div className="flex-1 max-w-[calc(100%-13rem)]">
							<Outlet />
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
};

export default AdminLayout;
