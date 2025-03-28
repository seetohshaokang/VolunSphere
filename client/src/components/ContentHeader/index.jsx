// src/components/ContentHeader/index.jsx
import React from "react";

function ContentHeader({ title }) {
	return (
		<div className="mb-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
				<h1 className="text-2xl font-bold mb-2 sm:mb-0 flex items-center">
					{title}
				</h1>
			</div>
			<div className="divider mt-2 mb-4"></div>
		</div>
	);
}

export default ContentHeader;
