import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RightSidebar = () => {
  const trendingCrimes = [
    { id: 1, title: "Car Theft on the Rise", location: "Karachi" },
    { id: 2, title: "Pickpocketing Incidents", location: "Lahore" },
    { id: 3, title: "Cyber Fraud Cases", location: "Islamabad" },
  ];

  const safetyTips = [
    "Always lock your doors and windows.",
    "Avoid sharing personal info online.",
    "Stay alert in crowded places.",
    "Report suspicious activities immediately.",
  ];

  return (
    <aside className="w-[300px] hidden lg:block space-y-6">
      {/* Trending Crimes */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Trending Crimes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingCrimes.map((crime) => (
            <div key={crime.id} className="text-sm border-b pb-2 last:border-none">
              <p className="font-medium">{crime.title}</p>
              <p className="text-gray-500 text-xs">{crime.location}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Safety Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {safetyTips.map((tip, index) => (
            <p key={index} className="text-sm text-gray-700">
              • {tip}
            </p>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
};

export default RightSidebar;
