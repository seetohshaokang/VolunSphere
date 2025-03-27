import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png"; // Update path to logo

function Sidebar() {
	return (
		<aside className="main-sidebar sidebar-dark-primary elevation-4">
			<Link to="/" className="brand-link">
				<img
					src={logo}
					alt="VolunSphere Logo"
					className="brand-image img-circle elevation-3"
					style={{ opacity: ".8" }}
				/>
				<span className="brand-text font-weight-light">
					VolunSphere
				</span>
			</Link>
			<div className="sidebar">
				<nav className="mt-2">
					<ul
						className="nav nav-pills nav-sidebar flex-column"
						data-widget="treeview"
						role="menu"
						data-accordion="false"
					>
						<li className="nav-item">
							<Link to="/events/create" className="nav-link">
								<i className="nav-icon fa fa-plus-circle" />
								<p>Create New Event</p>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/events" className="nav-link">
								<i className="nav-icon fa fa-calendar" />
								<p>Browse Events</p>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/profile" className="nav-link">
								<i className="nav-icon fa fa-user" />
								<p>My Profile</p>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</aside>
	);
}

export default Sidebar;
