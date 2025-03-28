// src/containers/Home/components/FilterControls.jsx
import React from "react";

function FilterControls({
	filters,
	categories,
	locations,
	handleFilterChange,
}) {
	return (
		<div className="row mb-4">
			<div className="col-12">
				<div className="card">
					<div className="card-body">
						<div className="row">
							<div className="col-md-3 mb-3">
								<label className="form-label">Category</label>
								<select
									className="form-select"
									value={filters.category}
									onChange={(e) =>
										handleFilterChange(
											"category",
											e.target.value
										)
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

							<div className="col-md-3 mb-3">
								<label className="form-label">Location</label>
								<select
									className="form-select"
									value={filters.location}
									onChange={(e) =>
										handleFilterChange(
											"location",
											e.target.value
										)
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

							<div className="col-md-3 mb-3">
								<label className="form-label">
									Price Range
								</label>
								<div className="input-group">
									<input
										type="number"
										className="form-control"
										placeholder="Min"
										value={filters.priceRange.min}
										onChange={(e) =>
											handleFilterChange(
												"priceMin",
												e.target.value
											)
										}
									/>
									<span className="input-group-text">to</span>
									<input
										type="number"
										className="form-control"
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

							<div className="col-md-3 mb-3">
								<label className="form-label">Date Range</label>
								<div className="row">
									<div className="col-6">
										<input
											type="date"
											className="form-control"
											value={filters.dateRange.start}
											onChange={(e) =>
												handleFilterChange(
													"dateStart",
													e.target.value
												)
											}
										/>
									</div>
									<div className="col-6">
										<input
											type="date"
											className="form-control"
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
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default FilterControls;
