import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/subscription")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="relative mx-auto w-full max-w-3xl rounded-2xl bg-gradient-to-b from-[#65D1F8] to-[#6CCFD0] p-[2px] shadow-lg">
      {/* Inner Content with White Background */}
      <div className="rounded-2xl bg-white p-6">
        {/* Title with Gradient Text */}
        <h2 className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] bg-clip-text text-center text-2xl font-extrabold text-transparent">
          Spark Plus+ Membership
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Unlock Exclusive Perks and Elevate Your Sports Experience!
        </p>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white">
                <th className="border-r border-white p-4 text-left font-semibold">
                  Feature
                </th>
                <th className="border-r border-white p-4 text-center font-semibold">
                  Free Users
                </th>
                <th className="p-4 text-center font-semibold">Spark Plus+</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="border-r border-gray-300 p-4 font-medium text-[#514747]">
                  Detailed Filters
                </td>
                <td className="border-r border-gray-300 p-4 text-center">
                  ❌ Limited
                </td>
                <td className="p-4 text-center">✅ Full Access</td>
              </tr>
              <tr className="border-t">
                <td className="border-r border-gray-300 p-4 font-medium text-[#514747]">
                  Matching Limits
                </td>
                <td className="border-r border-gray-300 p-4 text-center">
                  ⏳ Daily Limit
                </td>
                <td className="p-4 text-center">🚀 Unlimited Matches</td>
              </tr>
              <tr className="border-t">
                <td className="border-r border-gray-300 p-4 font-medium text-[#514747]">
                  Priority on Waitlists
                </td>
                <td className="border-r border-gray-300 p-4 text-center">
                  ⛔ No Priority
                </td>
                <td className="p-4 text-center">🎟️ Skip the Line!</td>
              </tr>
              <tr className="border-t">
                <td className="border-r border-gray-300 p-4 font-medium text-[#514747]">
                  Exclusive Club & Events
                </td>
                <td className="border-r border-gray-300 p-4 text-center">
                  🚫 Not Available
                </td>
                <td className="p-4 text-center">🏆 VIP Access</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Call to Action Button */}
        <div className="mt-6 flex justify-center">
          <button className="transform rounded-lg bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-105 hover:from-[#65D1F8] hover:to-[#6CCFD0]">
            Join Spark Plus+ Now
          </button>
        </div>
      </div>
    </Card>
  );
}
