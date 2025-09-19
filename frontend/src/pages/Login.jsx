import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("admin@org.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") nav("/org");
      else if (user.role === "manager") nav(`/team/${user.teamId}`);
      else nav("/me");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-4 text-gray-900 dark:text-gray-100"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Login
        </button>

        <p className="text-xs text-gray-500">
          Try: admin@org.com / manager@org.com / konstantina@org.com (password)
        </p>
      </form>
    </div>
  );
}
