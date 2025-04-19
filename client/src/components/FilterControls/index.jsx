// src/components/FilterControls/index.jsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  toggleMapView = () => { },
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
              <Select open={categoryOpen} onOpenChange={setCategoryOpen}>
                <SelectTrigger id="category" className="bg-white">
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
                      onClick={() => handleCategoryClick("all")}
                    >
                      All Categories
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category}
                        className={cn(
                          "cursor-pointer px-2 py-1.5 rounded text-sm transition",
                          "hover:text-blue-600 hover:font-medium hover:shadow-sm",
                          filters.category === category
                            ? "text-blue-600 font-semibold"
                            : "text-gray-700"
                        )}
                        onClick={() => handleCategoryClick(category)}
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
                    handleFilterChange("dateStart", e.target.value)
                  }
                  className="bg-white hover:border-primary hover:shadow-sm transition-all"
                />
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange("dateEnd", e.target.value)}
                  className="bg-white hover:border-primary hover:shadow-sm transition-all"
                />
              </div>
            </div>

                        {/* Map View Toggle Button (Replacing Location filter) */}
                        <div className="space-y-2">
              <Label htmlFor="map-view">View Mode</Label>

              <Button
                id="map-view"
                onClick={toggleMapView}
                variant="outline"
                className="w-full hover:bg-gray-100 transition-colors text-black border-black"
              >
                {showMapView ? (
                  <>
                    <List className="h-4 w-4 mr-2" />
                    <span>View as List</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>View on Map</span>
                  </>
                )}
              </Button>
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