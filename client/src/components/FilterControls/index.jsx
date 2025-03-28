// src/components/FilterControls/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function FilterControls({
	filters,
	categories,
	locations,
	handleFilterChange,
}) {
	return (
		<Card className="mb-6">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">Filter Options</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={filters.category}
							onValueChange={(value) =>
								handleFilterChange("category", value)
							}
						>
							<SelectTrigger id="category">
								<SelectValue placeholder="All Categories" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Categories
								</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location">Location</Label>
						<Select
							value={filters.location}
							onValueChange={(value) =>
								handleFilterChange("location", value)
							}
						>
							<SelectTrigger id="location">
								<SelectValue placeholder="All Locations" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Locations
								</SelectItem>
								{locations.map((location) => (
									<SelectItem key={location} value={location}>
										{location}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Price Range</Label>
						<div className="flex gap-2 items-center">
							<Input
								type="number"
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
							<Input
								type="number"
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
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-end mt-4">
					<Button
						variant="outline"
						onClick={() => {
							// Reset all filters
							handleFilterChange("category", "all");
							handleFilterChange("location", "all");
							handleFilterChange("priceMin", 0);
							handleFilterChange("priceMax", 1000);
							handleFilterChange("dateStart", "");
							handleFilterChange("dateEnd", "");
						}}
					>
						Reset Filters
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default FilterControls;
