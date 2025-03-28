// src/components/Sidebar/index.jsx
import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
	return (
		<aside className="main-sidebar sidebar-dark-primary elevation-4">
			<div className="sidebar">
				<nav className="mt-2">
					<ul
						className="nav nav-pills nav-sidebar flex-column"
						data-widget="treeview"
						role="menu"
						data-accordion="false"
					>
						<li className="nav-item">
							<Link to="/manageCustomer" className="nav-link">
								<i className="nav-icon fa fa-plus-circle" />
								<p>Create New Customer</p>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/listCustomers" className="nav-link">
								<i className="nav-icon fa fa-users" />
								<p>List Customers</p>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</aside>
	);
}

export default Sidebar;
