export function getRoles(_req, res) {
  // Keep this in sync with your User.role enum
  res.json(["sysadmin", "admin", "manager", "employee"]);
}
