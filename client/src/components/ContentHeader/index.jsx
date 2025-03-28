// src/components/ContentHeader/index.jsx
import { Link } from "react-router-dom";

function ContentHeader({ title, links = [] }) {
	return (
		<div className="mb-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
				<h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
					{title}
				</h1>
				{links.length > 0 && (
					<nav className="flex" aria-label="Breadcrumb">
						<ol className="inline-flex items-center space-x-1 md:space-x-3">
							{links.map(
								({ to, label, isActive = false }, index) => (
									<li
										key={index}
										className="inline-flex items-center"
									>
										{index > 0 && (
											<span className="mx-2 text-gray-400">
												/
											</span>
										)}
										{!isActive ? (
											<Link
												to={to}
												className="text-sm font-medium text-primary hover:underline"
											>
												{label}
											</Link>
										) : (
											<span className="text-sm font-medium text-muted-foreground">
												{label}
											</span>
										)}
									</li>
								)
							)}
						</ol>
					</nav>
				)}
			</div>
			<div className="h-px bg-border mt-2 mb-4"></div>
		</div>
	);
}

export default ContentHeader;
