import React from "react";
import { Link } from "react-router-dom";

function ContentHeader({ title, links }) {
	const listItems = links.map(({ to, label, isActive = false }, index) => {
		if (!isActive) {
			return (
				<li className="breadcrumb-item" key={index}>
					<Link to={to}>{label}</Link>
				</li>
			);
		} else {
			return (
				<li className="breadcrumb-item active" key={index}>
					{label}
				</li>
			);
		}
	});

	return (
		<div className="content-header">
			<div className="container-fluid">
				<div className="row mb-2">
					<div className="col-sm-6">
						<h1 className="m-0 text-dark">{title}</h1>
					</div>
					<div className="col-sm-6">
						<ol className="breadcrumb float-sm-right">
							{listItems}
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ContentHeader;
