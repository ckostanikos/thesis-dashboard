import { useQuery } from "@tanstack/react-query";
import { fetchOrgKpis } from "../api/kpis";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Org() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kpi", "org"],
    queryFn: fetchOrgKpis,
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    completion: d.completionRate,
    score: d.avgScore,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Completion & Avg Score
      </h3>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                color: "#fff",
                borderRadius: "0.5rem",
              }}
            />
            <Line type="monotone" dataKey="completion" stroke="#2563eb" />
            <Line type="monotone" dataKey="score" stroke="#16a34a" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Keep list as fallback (optional) */}
      <ul className="space-y-2">
        {data.map((row) => (
          <li
            key={row._id}
            className="bg-white rounded-lg p-3 border flex justify-between"
          >
            <span>{new Date(row.date).toLocaleDateString()}</span>
            <span>
              Completion: {row.completionRate}% • AvgScore: {row.avgScore}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
