import Team from "../models/team.model.js";

export async function listTeams(_req, res) {
  try {
    const teams = await Team.find().sort({ name: 1 }).lean();
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
}
