import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function App() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const nav = useNavigate();
  const loc = useLocation();

  // Dark mode toggle (applies class to <html>)
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-14 flex items-center gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 grid place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-sm">
                TD
              </div>
              <span className="font-semibold tracking-tight">
                Thesis Dashboard
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              <NavItem to="/me">My Dashboard</NavItem>
              <NavItem to="/org">Org</NavItem>
              {/* Example team link; replace ID or remove */}
              {/* <NavItem to="/team/DEFAULT_TEAM_ID">Team</NavItem> */}
            </nav>

            {/* Spacer */}
            <div className="ml-auto flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDark((d) => !d)}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {dark ? "🌙" : "🌞"}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium bg-red-600 text-white hover:opacity-90 shadow-sm"
              >
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {/* simple hamburger / close */}
                <span
                  className={`block h-0.5 w-4 bg-current transition ${
                    open ? "rotate-45 translate-y-0.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-4 bg-current my-1 transition ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-4 bg-current transition ${
                    open ? "-rotate-45 -translate-y-0.5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {open && (
            <nav className="md:hidden pb-3">
              <div className="flex flex-col gap-1">
                <NavItem to="/me" mobile>
                  My Dashboard
                </NavItem>
                <NavItem to="/org" mobile>
                  Org
                </NavItem>
                {/* <NavItem to="/team/DEFAULT_TEAM_ID" mobile>Team</NavItem> */}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, children, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-lg text-sm transition",
          mobile ? "px-3 py-2" : "px-3 py-1.5",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
