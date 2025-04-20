// src/components/SearchBar/index.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState } from "react";

function SearchBar({ searchTerm, handleSearch }) {
	const [inputFocused, setInputFocused] = useState(false);
	const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");

	const handleInputChange = (e) => {
		setLocalSearchTerm(e.target.value);
		handleSearch(e);
	};

	const clearSearch = () => {
		setLocalSearchTerm("");
		const syntheticEvent = { target: { value: "" } };
		handleSearch(syntheticEvent);
	};

	return (
		<Card className="mb-6 shadow-sm hover:shadow-md transition-all duration-200">
			<CardContent className="p-4">
				<div className="flex w-full items-center space-x-2 relative">
					<div
						className={`flex-grow relative transition-all duration-200 ${
							inputFocused ? "ring-2 ring-primary rounded-md" : ""
						}`}
					>
						<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							<Search className="h-5 w-5" />
						</div>

						<Input
							type="text"
							placeholder="Search for volunteer opportunities..."
							value={localSearchTerm}
							onChange={handleInputChange}
							onFocus={() => setInputFocused(true)}
							onBlur={() => setInputFocused(false)}
							className="pl-10 pr-10 py-6 text-base focus-visible:ring-1"
						/>

						{localSearchTerm && (
							<button
								onClick={clearSearch}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
								aria-label="Clear search"
							>
								<X className="h-5 w-5" />
							</button>
						)}
					</div>

					<Button
						variant="outline"
						className="px-4 py-6 shadow-md hover:shadow-lg transition-all bg-primary"
						onClick={() => console.log("Search button clicked")}
					>
						<Search className="h-4 w-4 mr-2" />
						Search
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default SearchBar;
