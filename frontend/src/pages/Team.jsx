import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTeamKpis } from "../api/kpis";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Team() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["kpi", "team", id],
    queryFn: () => fetchTeamKpis(id),
  });

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    completion: d.completionRate,
    score: d.avgScore,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Team KPIs (Team ID: {id})</h2>

      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Completion & Avg Score
        </h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#2563eb"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
