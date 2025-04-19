// src/components/FilterControls/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Add custom styles for date inputs
const datePickerStyles = `
  input[type="date"] {
    cursor: pointer !important;
  }
  
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer !important;
  }
`;

function FilterControls({
	filters,
	categories,
	handleFilterChange,
	showMapView = false,
	toggleMapView = () => {},
}) {
	const [categoryOpen, setCategoryOpen] = useState(false);

	const handleCategoryClick = (category) => {
		const newValue = filters.category === category ? "all" : category;
		handleFilterChange("category", newValue);
		setCategoryOpen(false);
	};

	return (
		<>
			{/* Inject custom styles */}
			<style>{datePickerStyles}</style>

			<Card className="mb-6">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">Filter Options</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								open={categoryOpen}
								onOpenChange={setCategoryOpen}
							>
								<SelectTrigger
									id="category"
									className="bg-white"
								>
									<span className="truncate">
										{filters.category === "all"
											? "All Categories"
											: filters.category}
									</span>
								</SelectTrigger>
								<SelectContent className="bg-white border shadow-md z-50">
									<div className="py-1">
										<div
											className={cn(
												"cursor-pointer px-2 py-1.5 rounded text-sm transition",
												"hover:text-blue-600 hover:font-medium hover:shadow-sm",
												filters.category === "all"
													? "text-blue-600 font-semibold"
													: "text-gray-700"
											)}
											onClick={() =>
												handleCategoryClick("all")
											}
										>
											All Categories
										</div>
										{categories.map((category) => (
											<div
												key={category}
												className={cn(
													"cursor-pointer px-2 py-1.5 rounded text-sm transition",
													"hover:text-blue-600 hover:font-medium hover:shadow-sm",
													filters.category ===
														category
														? "text-blue-600 font-semibold"
														: "text-gray-700"
												)}
												onClick={() =>
													handleCategoryClick(
														category
													)
												}
											>
												{category}
											</div>
										))}
									</div>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label>Date Range</Label>
							<div className="grid grid-cols-2 gap-2">
								<Input
									type="date"
									value={filters.dateRange.start}
									onChange={(e) =>
										handleFilterChange(
											"dateStart",
											e.target.value
										)
									}
									className="bg-white hover:border-primary hover:shadow-sm transition-all"
								/>
								<Input
									type="date"
									value={filters.dateRange.end}
									onChange={(e) =>
										handleFilterChange(
											"dateEnd",
											e.target.value
										)
									}
									className="bg-white hover:border-primary hover:shadow-sm transition-all"
								/>
							</div>
						</div>

						{/* Map View Toggle Button (Replacing Location filter) */}
						<div className="space-y-2">
							<Label htmlFor="map-view">View Mode</Label>

							<div className="flex overflow-hidden rounded-md border border-input">
								<button
									id="grid-view"
									onClick={() =>
										!showMapView || toggleMapView()
									}
									className={`flex items-center justify-center py-2 px-4 w-1/2 text-sm font-medium transition-colors ${
										!showMapView
											? "bg-[#14213D] text-white"
											: "bg-white text-gray-700 hover:bg-gray-50"
									}`}
								>
									<span className="flex items-center space-x-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											className="h-4 w-4 mr-2"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M4 6h16M4 10h16M4 14h16M4 18h16"
											/>
										</svg>
										Grid
									</span>
								</button>
								<button
									id="map-view"
									onClick={() =>
										showMapView || toggleMapView()
									}
									className={`flex items-center justify-center py-2 px-4 w-1/2 text-sm font-medium transition-colors ${
										showMapView
											? "bg-[#14213D] text-white"
											: "bg-white text-gray-700 hover:bg-gray-50"
									}`}
								>
									<span className="flex items-center space-x-1">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											className="h-4 w-4 mr-2"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
											/>
										</svg>
										Map
									</span>
								</button>
							</div>
						</div>

						<div className="flex justify-end pt-[2rem]">
							<Button
								variant="outline"
								onClick={() => {
									handleFilterChange("category", "all");
									handleFilterChange("priceMin", 0);
									handleFilterChange("priceMax", 1000);
									handleFilterChange("dateStart", "");
									handleFilterChange("dateEnd", "");
								}}
								className="hover:bg-gray-100 transition-colors"
							>
								Reset Filters
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

export default FilterControls;
