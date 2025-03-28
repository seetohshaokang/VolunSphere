// src/components/ResultsHeader/index.jsx
import { Card, CardContent } from "@/components/ui/card";

function ResultsHeader({ eventCount }) {
	return (
		<Card className="mb-6">
			<CardContent className="py-4">
				<h2 className="text-lg font-semibold">
					Explore {eventCount} opportunities
				</h2>
			</CardContent>
		</Card>
	);
}

export default ResultsHeader;
