// src/containers/Home/components/ResultsHeader.jsx
import React from "react";

function ResultsHeader({ eventCount }) {
	return (
		<div className="row mb-3">
			<div className="col-12">
				<div className="card">
					<div className="card-header">
						<h5 className="m-0">
							Explore {eventCount} opportunities
						</h5>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ResultsHeader;
