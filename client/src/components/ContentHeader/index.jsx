import React from "react";
import { Link } from "react-router-dom";

function ContentHeader({ title, links }) {
	return (
		<div className="mb-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
				<h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
					{title}
				</h1>

				<nav className="breadcrumbs">
					<ul className="text-sm">
						{links.map(({ to, label, isActive = false }, index) => (
							<li
								key={index}
								className={isActive ? "font-semibold" : ""}
							>
								{!isActive ? (
									<Link
										to={to}
										className="text-primary hover:underline"
									>
										{label}
									</Link>
								) : (
									<span>{label}</span>
								)}
							</li>
						))}
					</ul>
				</nav>
			</div>
			<div className="divider mt-2 mb-4"></div>
		</div>
	);
}

export default ContentHeader;
