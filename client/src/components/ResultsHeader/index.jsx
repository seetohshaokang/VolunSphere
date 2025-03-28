import React from "react";

function ResultsHeader({ eventCount }) {
	return (
		<div className="card bg-base-100 shadow mb-6">
			<div className="card-body py-4">
				<h2 className="card-title text-lg m-0">
					Explore {eventCount} opportunities
				</h2>
			</div>
		</div>
	);
}

export default ResultsHeader;
