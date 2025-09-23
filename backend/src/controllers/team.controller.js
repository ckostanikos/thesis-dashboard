import Team from "../models/team.model.js";
import User from "../models/user.model.js";

export async function listTeams(_req, res) {
  try {
    const teams = await Team.find().sort({ name: 1 }).lean();
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
}

// NEW: list employees of a team (admin: any team; manager: only own team)
export async function listTeamMembers(req, res, next) {
  try {
    const teamId = req.params.id;
    const actor = req.user; // set by requireAuth

    if (!actor) return res.status(401).json({ message: "Unauthorized" });

    if (actor.role === "manager") {
      if (!actor.teamId || String(actor.teamId) !== String(teamId)) {
        return res.status(403).json({ message: "Forbidden: not your team" });
      }
    } else if (actor.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const members = await User.find({ teamId, role: "employee" })
      .select("_id name email role teamId")
      .sort({ name: 1, email: 1 })
      .lean();

    res.json(members);
  } catch (err) {
    next(err);
  }
}
