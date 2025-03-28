import React from "react";

function FilterControls({
	filters,
	categories,
	locations,
	handleFilterChange,
}) {
	return (
		<div className="card bg-base-100 shadow mb-6">
			<div className="card-body">
				<h2 className="card-title text-lg mb-4">Filter Options</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">Category</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={filters.category}
							onChange={(e) =>
								handleFilterChange("category", e.target.value)
							}
						>
							<option value="">All Categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Location</span>
						</label>
						<select
							className="select select-bordered w-full"
							value={filters.location}
							onChange={(e) =>
								handleFilterChange("location", e.target.value)
							}
						>
							<option value="">All Locations</option>
							{locations.map((location) => (
								<option key={location} value={location}>
									{location}
								</option>
							))}
						</select>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Price Range</span>
						</label>
						<div className="flex gap-2 items-center">
							<input
								type="number"
								className="input input-bordered w-full"
								placeholder="Min"
								value={filters.priceRange.min}
								onChange={(e) =>
									handleFilterChange(
										"priceMin",
										e.target.value
									)
								}
							/>
							<span>to</span>
							<input
								type="number"
								className="input input-bordered w-full"
								placeholder="Max"
								value={filters.priceRange.max}
								onChange={(e) =>
									handleFilterChange(
										"priceMax",
										e.target.value
									)
								}
							/>
						</div>
					</div>

					<div className="form-control">
						<label className="label">
							<span className="label-text">Date Range</span>
						</label>
						<div className="grid grid-cols-2 gap-2">
							<input
								type="date"
								className="input input-bordered w-full"
								value={filters.dateRange.start}
								onChange={(e) =>
									handleFilterChange(
										"dateStart",
										e.target.value
									)
								}
							/>
							<input
								type="date"
								className="input input-bordered w-full"
								value={filters.dateRange.end}
								onChange={(e) =>
									handleFilterChange(
										"dateEnd",
										e.target.value
									)
								}
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-end mt-4">
					<button
						className="btn btn-outline btn-primary"
						onClick={() => {
							// Reset all filters
							handleFilterChange("category", "");
							handleFilterChange("location", "");
							handleFilterChange("priceMin", 0);
							handleFilterChange("priceMax", 1000);
							handleFilterChange("dateStart", "");
							handleFilterChange("dateEnd", "");
						}}
					>
						Reset Filters
					</button>
				</div>
			</div>
		</div>
	);
}

export default FilterControls;
