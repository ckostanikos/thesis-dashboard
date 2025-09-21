export function getRoles(_req, res) {
  // Keep this in sync with your User.role enum
  res.json(["admin", "manager", "employee"]);
}
