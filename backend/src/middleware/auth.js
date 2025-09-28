export default function requireAuth(req, res, next) {
  if (req.session?.userId) {
    req.user = {
      id: req.session.userId,
      role: req.session.role,
      teamId: req.session.teamId,
    };
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}
