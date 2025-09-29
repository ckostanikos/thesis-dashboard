import mongoose from "mongoose";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

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
            // overdue = not completed & course dueDate < now
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

// #1 Enrollments per course (top 10)
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

// #2 Completion rate per course (top 10 by total enrollments)
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

// #3 Team performance (avg completion rate per team)
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

// #4 Overdue by course
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
