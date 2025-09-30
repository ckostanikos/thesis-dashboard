import mongoose from "mongoose";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

const toId = (v) => new mongoose.Types.ObjectId(String(v));

export async function overview(_req, res) {
  const [users, courses, enrolls] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.aggregate([
      {
        $facet: {
          total: [{ $count: "n" }],
          completed: [
            {
              $match: {
                $or: [
                  { completedAt: { $ne: null } },
                  { progress: { $gte: 100 } },
                ],
              },
            },
            { $count: "n" },
          ],
          overdue: [
            {
              $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "c",
              },
            },
            { $unwind: "$c" },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { completedAt: null },
                      { completedAt: { $exists: false } },
                      { progress: { $lt: 100 } },
                    ],
                  },
                  { "c.dueDate": { $lt: new Date() } },
                ],
              },
            },
            { $count: "n" },
          ],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ["$total.n", 0] }, 0] },
          completed: { $ifNull: [{ $arrayElemAt: ["$completed.n", 0] }, 0] },
          overdue: { $ifNull: [{ $arrayElemAt: ["$overdue.n", 0] }, 0] },
        },
      },
    ]),
  ]);

  const e = enrolls[0] || { total: 0, completed: 0, overdue: 0 };
  const completionRate = e.total
    ? Math.round((e.completed / e.total) * 100)
    : 0;

  res.json({
    users,
    courses,
    enrollments: e.total,
    completionRate,
    overdue: e.overdue,
  });
}

// Enrollments per course (top 10)
export async function enrollmentsByCourse(_req, res) {
  const rows = await Enrollment.aggregate([
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        title: "$course.title",
        count: 1,
      },
    },
  ]);
  res.json(rows);
}

// Completion rate per course (top 10 by total enrollments)
export async function completionRateByCourse(_req, res) {
  const rows = await Enrollment.aggregate([
    {
      $group: {
        _id: "$courseId",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gt: ["$progress", 99] },
                  { $ne: ["$completedAt", null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$course._id",
        title: "$course.title",
        total: 1,
        completed: 1,
        rate: {
          $cond: [
            { $gt: ["$total", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
  ]);
  res.json(rows);
}

// Team performance (avg completion rate per team)
export async function teamPerformance(_req, res) {
  const rows = await Enrollment.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "u",
      },
    },
    { $unwind: "$u" },
    { $match: { "u.teamId": { $ne: null } } },
    {
      $group: {
        _id: "$u.teamId",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gt: ["$progress", 99] },
                  { $ne: ["$completedAt", null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "teams",
        localField: "_id",
        foreignField: "_id",
        as: "t",
      },
    },
    { $unwind: "$t" },
    {
      $project: {
        _id: 0,
        teamId: "$t._id",
        team: "$t.name",
        total: 1,
        completed: 1,
        rate: {
          $cond: [
            { $gt: ["$total", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { rate: -1, total: -1 } },
  ]);
  res.json(rows);
}

export async function overdueByCourse(_req, res) {
  const rows = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "c",
      },
    },
    { $unwind: "$c" },
    {
      $match: {
        $and: [
          {
            $or: [
              { completedAt: null },
              { completedAt: { $exists: false } },
              { progress: { $lt: 100 } },
            ],
          },
          { "c.dueDate": { $lt: new Date() } },
        ],
      },
    },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "c",
      },
    },
    { $unwind: "$c" },
    {
      $project: {
        _id: 0,
        courseId: "$c._id",
        title: "$c.title",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  res.json(rows);
}

// Team Overview
export async function teamOverview(req, res, next) {
  try {
    const { teamId } = req.params;

    // 1) members in this team
    const members = await User.countDocuments({ teamId: toId(teamId) });

    // 2) enrollments for those members
    const agg = await Enrollment.aggregate([
      // join user to filter by team
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      { $match: { "u.teamId": toId(teamId) } },

      // compute totals/completed/overdue via facets
      {
        $facet: {
          total: [{ $count: "n" }],
          completed: [
            {
              $match: {
                $or: [
                  { completedAt: { $ne: null } },
                  { progress: { $gte: 100 } },
                ],
              },
            },
            { $count: "n" },
          ],
          overdue: [
            {
              $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "c",
              },
            },
            { $unwind: "$c" },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { completedAt: null },
                      { completedAt: { $exists: false } },
                      { progress: { $lt: 100 } },
                    ],
                  },
                  { "c.dueDate": { $lt: new Date() } },
                ],
              },
            },
            { $count: "n" },
          ],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ["$total.n", 0] }, 0] },
          completed: { $ifNull: [{ $arrayElemAt: ["$completed.n", 0] }, 0] },
          overdue: { $ifNull: [{ $arrayElemAt: ["$overdue.n", 0] }, 0] },
        },
      },
    ]);

    const e = agg[0] || { total: 0, completed: 0, overdue: 0 };
    const completionRate = e.total
      ? Math.round((e.completed / e.total) * 100)
      : 0;

    res.json({
      members,
      enrollments: e.total,
      completionRate,
      overdue: e.overdue,
    });
  } catch (err) {
    next(err);
  }
}

/** Team enrollments per course */
export async function teamEnrollmentsByCourse(req, res, next) {
  try {
    const { teamId } = req.params;

    const rows = await Enrollment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      { $match: { "u.teamId": toId(teamId) } },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "c",
        },
      },
      { $unwind: "$c" },
      {
        $project: {
          _id: 0,
          courseId: "$c._id",
          title: "$c.title",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** Team completion rate per course */
export async function teamCompletionRateByCourse(req, res, next) {
  try {
    const { teamId } = req.params;

    const rows = await Enrollment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      { $match: { "u.teamId": toId(teamId) } },
      {
        $group: {
          _id: "$courseId",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $gt: ["$progress", 99] },
                    { $ne: ["$completedAt", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "c",
        },
      },
      { $unwind: "$c" },
      {
        $project: {
          _id: 0,
          courseId: "$c._id",
          title: "$c.title",
          total: 1,
          completed: 1,
          rate: {
            $cond: [
              { $gt: ["$total", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { rate: -1, total: -1 } },
      { $limit: 10 },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** Team overdue by course */
export async function teamOverdueByCourse(req, res, next) {
  try {
    const { teamId } = req.params;

    const rows = await Enrollment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      { $match: { "u.teamId": toId(teamId) } },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "c",
        },
      },
      { $unwind: "$c" },
      {
        $match: {
          $and: [
            {
              $or: [
                { completedAt: null },
                { completedAt: { $exists: false } },
                { progress: { $lt: 100 } },
              ],
            },
            { "c.dueDate": { $lt: new Date() } },
          ],
        },
      },
      { $group: { _id: "$courseId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "c",
        },
      },
      { $unwind: "$c" },
      {
        $project: {
          _id: 0,
          courseId: "$c._id",
          title: "$c.title",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** Team performance by employee (avg completion %) */
export async function teamUserPerformance(req, res, next) {
  try {
    const { teamId } = req.params;

    const rows = await Enrollment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      { $match: { "u.teamId": toId(teamId) } },
      {
        $group: {
          _id: "$userId",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $gt: ["$progress", 99] },
                    { $ne: ["$completedAt", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      {
        $project: {
          _id: 0,
          userId: "$u._id",
          user: { $ifNull: ["$u.name", "$u.email"] },
          total: 1,
          completed: 1,
          rate: {
            $cond: [
              { $gt: ["$total", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { rate: -1, total: -1, user: 1 } },
      { $limit: 20 },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
