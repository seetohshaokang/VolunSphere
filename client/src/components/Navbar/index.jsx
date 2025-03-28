import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogin = () => {
		navigate("/login");
	};

	const handleSignup = () => {
		navigate("/registration");
	};

	const handleProfileClick = () => {
		navigate("/profile");
	};

	return (
		<div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
			<div className="navbar-start">
				<label
					htmlFor="drawer-toggle"
					className="btn btn-ghost drawer-button lg:hidden"
				>
					<i className="fas fa-bars"></i>
				</label>
				<Link to="/" className="btn btn-ghost normal-case text-xl">
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-full overflow-hidden">
							<img
								src="/src/assets/volunsphere.png"
								alt="VolunSphere Logo"
								className="w-full h-full object-cover"
							/>
						</div>
						<span className="hidden sm:inline-block">
							VolunSphere
						</span>
					</div>
				</Link>
			</div>

			<div className="navbar-center hidden lg:flex">
				<div className="form-control w-64">
					<input
						type="text"
						placeholder="Search opportunities..."
						className="input input-bordered"
					/>
				</div>
			</div>

			<div className="navbar-end">
				{user ? (
					<div className="dropdown dropdown-end">
						<label
							tabIndex={0}
							className="btn btn-ghost btn-circle avatar"
						>
							<div className="w-10 rounded-full">
								<img
									src={
										user.photoURL ||
										"https://via.placeholder.com/40?text=User"
									}
									alt="Profile"
								/>
							</div>
						</label>
						<ul
							tabIndex={0}
							className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-50"
						>
							<li>
								<Link to="/profile" className="justify-between">
									Profile
									<span className="badge">New</span>
								</Link>
							</li>
							<li>
								<Link to="/events/user/registered">
									My Events
								</Link>
							</li>
							<li>
								<button onClick={logout}>Logout</button>
							</li>
						</ul>
					</div>
				) : (
					<div className="flex gap-2">
						<button
							onClick={handleLogin}
							className="btn btn-outline btn-primary"
						>
							Log In
						</button>
						<button
							onClick={handleSignup}
							className="btn btn-primary"
						>
							Sign Up
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default Navbar;
