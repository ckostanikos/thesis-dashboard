export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

// Special check: manager can only access their own team
export function requireManagerOfTeam() {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (req.user.role === "admin") return next(); // admins can see all teams
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Managers/Admins only" });
    }
    const teamId = req.params.id; // from /team/:id
    if (!teamId || String(req.user.teamId) !== String(teamId)) {
      return res.status(403).json({ message: "Forbidden: not your team" });
    }
    next();
  };
}
