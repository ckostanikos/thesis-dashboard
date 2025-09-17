import Kpi from "../models/kpi.model.js";

export async function getOrgKpis(req, res) {
  try {
    const data = await Kpi.find({ scope: "org" }).sort({ date: 1 }).lean();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch org KPIs" });
  }
}
