import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { fetchCourses } from "../api/courses";
import { assignCourse, checkEnrollmentStatus } from "../api/enrollments";
import { fetchUsersAdmin, fetchTeamMembers } from "../api/users";

export default function AssignCourseModal({ isOpen, onClose }) {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [hideEnrolled, setHideEnrolled] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [summary, setSummary] = useState(null);
  const listRef = useRef(null);

  // who am I?
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const role = (user?.role || "employee").toLowerCase();
  const teamId = user?.teamId || null;
  const isAdmin = role === "admin";
  const isManager = role === "manager";

  // courses
  const coursesQ = useQuery({ queryKey: ["courses"], queryFn: fetchCourses });

  // users to assign (employees only; managers limited to their team)
  const usersQ = useQuery({
    queryKey: ["assignable-users", role, teamId],
    queryFn: async () => {
      if (isAdmin) return fetchUsersAdmin({ role: "employee , manager" });
      if (isManager && teamId) return fetchTeamMembers(teamId);
      return [];
    },
    enabled: isOpen,
  });

  const users = usersQ.data || [];
  const userMap = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(String(u._id), u));
    return m;
  }, [users]);

  // Filter by search
  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  // Enrollment status for current course among visible users
  const allIds = useMemo(() => users.map((u) => String(u._id)), [users]);

  const enrollCheckQ = useQuery({
    queryKey: ["enroll-check", courseId, allIds.join(",")],
    queryFn: () => checkEnrollmentStatus(courseId, allIds),
    enabled: isOpen && !!courseId && users.length > 0,
    staleTime: 60_000,
  });

  const enrolledSet = useMemo(() => {
    const ids = enrollCheckQ.data?.enrolledUserIds || [];
    return new Set(ids.map(String));
  }, [enrollCheckQ.data]);

  // Final filtered list (apply hideEnrolled)
  const visibleUsers = useMemo(() => {
    const base = filteredBySearch;
    if (!courseId || !hideEnrolled) return base;
    return base.filter((u) => !enrolledSet.has(String(u._id)));
  }, [filteredBySearch, hideEnrolled, courseId, enrolledSet]);

  // toggle a single user (ignore already-enrolled)
  function toggle(id) {
    if (enrolledSet.has(id)) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  // select all visible
  function selectAllVisible() {
    const next = new Set(selected);
    visibleUsers.forEach((u) => {
      const id = String(u._id);
      if (!enrolledSet.has(id)) next.add(id);
    });
    setSelected(next);
  }
  function clearAll() {
    setSelected(new Set());
  }

  // reset on open/close
  useEffect(() => {
    if (isOpen) {
      setSummary(null);
      setSearch("");
      setHideEnrolled(true);
      setSelected(new Set());
      setTimeout(() => listRef.current?.focus?.(), 0);
    } else {
      setCourseId("");
    }
  }, [isOpen]);

  // assign mutation (batch over selected, skipping enrolled just in case)
  const assignMany = useMutation({
    mutationFn: async ({ courseId, userIds }) => {
      const toAssign = userIds.filter((id) => !enrolledSet.has(id));
      const results = await Promise.allSettled(
        toAssign.map((uid) => assignCourse(uid, courseId))
      );

      // summarize
      let ok = 0,
        dup = 0,
        fail = 0;
      const details = toAssign.map((uid, idx) => {
        const r = results[idx];
        if (r.status === "fulfilled") {
          ok++;
          return { userId: uid, status: "ok" };
        }
        const msg =
          r.reason?.response?.data?.message || r.reason?.message || "Error";
        if (
          /already exists/i.test(msg) ||
          /already enrolled/i.test(msg) ||
          r.reason?.response?.status === 409
        ) {
          dup++;
          return { userId: uid, status: "duplicate", message: msg };
        }
        fail++;
        return { userId: uid, status: "error", message: msg };
      });

      // Also include users you had selected but are already enrolled
      const preEnrolled = Array.from(selected).filter((id) =>
        enrolledSet.has(id)
      );
      preEnrolled.forEach((uid) =>
        details.push({
          userId: uid,
          status: "duplicate",
          message: "Already enrolled",
        })
      );
      dup += preEnrolled.length;

      return {
        ok,
        dup,
        fail,
        total: toAssign.length + preEnrolled.length,
        details,
      };
    },
    onSuccess: (s) => {
      // attach user objects for readability
      const withNames = {
        ...s,
        details: s.details.map((d) => ({
          ...d,
          user: userMap.get(d.userId) || null,
        })),
      };
      setSummary(withNames);
      // optional: refetch any "me" or team enrollments if you show them elsewhere
      qc.invalidateQueries({ queryKey: ["me-for-library"] });
    },
  });

  const anySelected = selected.size > 0;
  const assignDisabled = !courseId || !anySelected || assignMany.isPending;

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.700"
      zIndex={1000}
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      overflow="auto"
      py={8}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-course-title"
      onClick={onClose}
    >
      <Container maxW="3xl" onClick={(e) => e.stopPropagation()}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="xl">
          <Heading id="assign-course-title" size="sm" mb={4}>
            Assign a course
          </Heading>

          {/* Course picker */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Course
            </Text>
            <Box
              as="select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              w="100%"
              maxW="520px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            >
              <option value="" disabled>
                Choose a course…
              </option>
              {(coursesQ.data || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} {c.hours ? `(${c.hours}h)` : ""}
                </option>
              ))}
            </Box>

            {/* Enrolled badge legend */}
            {courseId && (
              <Text mt={2} fontSize="xs" color="gray.600">
                Users already enrolled are marked and cannot be selected.
              </Text>
            )}
          </Box>

          {/* Users search + controls */}
          <Box mb={2}>
            <Text fontSize="sm" mb={1}>
              {isAdmin ? "Employees" : "Team members"}
            </Text>
            <HStack spacing={2} mb={2} wrap="wrap">
              <Box
                as="input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                w="100%"
                maxW="520px"
                px={3}
                py={2}
                bg="#F3F4F6"
                border="1px solid"
                borderColor="gray.300"
                rounded="md"
              />
              <Button size="sm" onClick={selectAllVisible} variant="outline">
                Select all (visible)
              </Button>
              <Button size="sm" onClick={clearAll} variant="outline">
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHideEnrolled((v) => !v)}
                title="Hide/show users already enrolled in this course"
              >
                {hideEnrolled ? "Show enrolled" : "Hide enrolled"}
              </Button>
            </HStack>

            {/* User list */}
            <Box
              tabIndex={-1}
              ref={listRef}
              border="1px solid"
              borderColor="gray.200"
              rounded="md"
              maxH="340px"
              overflow="auto"
              bg="white"
            >
              {usersQ.isLoading ? (
                <Box p={3}>
                  <Text fontSize="sm">Loading users…</Text>
                </Box>
              ) : visibleUsers.length === 0 ? (
                <Box p={3}>
                  <Text fontSize="sm" color="gray.600">
                    No users match filters.
                  </Text>
                </Box>
              ) : (
                visibleUsers.map((u) => {
                  const id = String(u._id);
                  const checked = selected.has(id);
                  const isEnrolled = courseId && enrolledSet.has(id);
                  return (
                    <HStack
                      key={id}
                      as="label"
                      htmlFor={`u-${id}`}
                      justify="space-between"
                      px={3}
                      py={2}
                      _hover={{ bg: "gray.50" }}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                      opacity={isEnrolled ? 0.6 : 1}
                    >
                      <HStack spacing={3}>
                        <Box
                          as="input"
                          id={`u-${id}`}
                          type="checkbox"
                          checked={checked && !isEnrolled}
                          disabled={!!isEnrolled}
                          onChange={() => toggle(id)}
                        />
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {u.name || u.email}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {u.email}
                          </Text>
                        </Box>
                      </HStack>

                      {/* Right-side status */}
                      {isEnrolled ? (
                        <Text
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          rounded="md"
                          bg="green.50"
                          color="green.700"
                        >
                          Enrolled
                        </Text>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          {u.role}
                        </Text>
                      )}
                    </HStack>
                  );
                })
              )}
            </Box>
          </Box>

          {/* Detailed results */}
          {summary && (
            <Box
              mt={4}
              p={3}
              border="1px solid"
              borderColor="gray.200"
              bg="gray.50"
              rounded="md"
              fontSize="sm"
            >
              <Text mb={2}>
                Assigned: <b>{summary.ok}</b> • Already enrolled:{" "}
                <b>{summary.dup}</b> • Failed: <b>{summary.fail}</b> /{" "}
                {summary.total}
              </Text>
              <Box
                border="1px solid"
                borderColor="gray.200"
                rounded="md"
                overflow="hidden"
              >
                {summary.details.map((d, i) => {
                  const name = d.user?.name || d.user?.email || d.userId;
                  const color =
                    d.status === "ok"
                      ? "green.700"
                      : d.status === "duplicate"
                      ? "gray.700"
                      : "red.700";
                  const bg =
                    d.status === "ok"
                      ? "green.50"
                      : d.status === "duplicate"
                      ? "gray.50"
                      : "red.50";
                  return (
                    <HStack
                      key={i}
                      justify="space-between"
                      px={3}
                      py={2}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      bg={bg}
                    >
                      <Text>{name}</Text>
                      <Text fontSize="xs" color={color} title={d.message || ""}>
                        {d.status}
                      </Text>
                    </HStack>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Actions */}
          <HStack justify="flex-end" spacing={3} mt={4}>
            <Button
              variant="outline"
              bg="gray.300"
              _hover={{ bg: "gray.400" }}
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              bg="green.600"
              _hover={{ bg: "green.700" }}
              color="white"
              onClick={() =>
                assignMany.mutate({
                  courseId,
                  userIds: Array.from(selected),
                })
              }
              isDisabled={assignDisabled}
            >
              {assignMany.isPending
                ? "Assigning…"
                : `Assign to ${selected.size} user${
                    selected.size === 1 ? "" : "s"
                  }`}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
