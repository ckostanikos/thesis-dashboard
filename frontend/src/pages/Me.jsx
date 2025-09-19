import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../api/me";

export default function Me() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const { user, enrollments } = data;
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Welcome, {user.name}</h2>
      <h3 className="font-medium mb-2">My Courses</h3>
      <ul className="space-y-2">
        {enrollments.map((e) => (
          <li key={e._id} className="bg-white rounded-lg p-3 border">
            <div className="font-medium">{e?.course?.title}</div>
            <div className="text-sm text-gray-600">
              {e?.course?.category} • {e?.course?.hours}h
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${e.progress || 0}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Progress: {e.progress || 0}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
