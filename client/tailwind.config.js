/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#0d6efd", // Bootstrap primary blue
				secondary: "#6c757d", // Bootstrap secondary gray
				success: "#28a745", // Bootstrap success green
				danger: "#dc3545", // Bootstrap danger red
				warning: "#ffc107", // Bootstrap warning yellow
				info: "#17a2b8", // Bootstrap info cyan
				light: "#f8f9fa", // Bootstrap light gray
				dark: "#343a40", // Bootstrap dark gray
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				volunsphere: {
					primary: "#0d6efd",
					"primary-focus": "#0b5ed7",
					"primary-content": "#ffffff",
					secondary: "#6c757d",
					"secondary-focus": "#5a6268",
					"secondary-content": "#ffffff",
					accent: "#17a2b8",
					"accent-focus": "#138496",
					"accent-content": "#ffffff",
					neutral: "#343a40",
					"neutral-focus": "#23272b",
					"neutral-content": "#ffffff",
					"base-100": "#ffffff",
					"base-200": "#f8f9fa",
					"base-300": "#e9ecef",
					"base-content": "#212529",
					info: "#17a2b8",
					success: "#28a745",
					warning: "#ffc107",
					error: "#dc3545",
				},
			},
			"light",
		],
	},
};
