import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { fetchCourses, bulkDeleteCourses } from "../api/courses";

export default function DeleteCoursesModal({ isOpen, onClose }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [confirm, setConfirm] = useState("");

  const coursesQ = useQuery({
    queryKey: ["courses", "with stats"],
    queryFn: () => fetchCourses({ stats: true }),
    enabled: isOpen,
  });
  const courses = coursesQ.data || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q)
    );
  }, [courses, search]);

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
      setSearch("");
      setConfirm("");
    }
  }, [isOpen]);

  function toggle(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  function selectAllVisible() {
    const next = new Set(selected);
    filtered.forEach((c) => next.add(String(c._id)));
    setSelected(next);
  }

  function clearAll() {
    setSelected(new Set());
  }

  const del = useMutation({
    mutationFn: async (ids) => bulkDeleteCourses(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      onClose?.();
    },
  });

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
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-courses-title"
    >
      <Container maxW="3xl" onClick={(e) => e.stopPropagation()}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="xl">
          <Heading id="delete-courses-title" size="sm" mb={4}>
            Delete courses
          </Heading>

          {/* Warning */}
          <Box
            mb={4}
            p={3}
            border="1px solid"
            borderColor="red.200"
            bg="red.50"
            color="red.800"
            rounded="md"
            fontSize="sm"
          >
            Deleting a course will also remove all related enrollments. This
            action cannot be undone.
          </Box>

          {/* Search + controls */}
          <HStack spacing={2} mb={2} wrap="wrap">
            <Box
              as="input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category…"
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
          </HStack>

          {/* List */}
          <Box
            border="1px solid"
            borderColor="gray.200"
            rounded="md"
            maxH="360px"
            overflow="auto"
            bg="white"
          >
            {filtered.length === 0 ? (
              <Box p={3}>
                <Text fontSize="sm" color="gray.600">
                  No courses match the search.
                </Text>
              </Box>
            ) : (
              filtered.map((c) => {
                const id = String(c._id);
                const checked = selected.has(id);
                const count = c.enrollmentsCount ?? 0;
                return (
                  <HStack
                    key={id}
                    as="label"
                    htmlFor={`c-${id}`}
                    justify="space-between"
                    px={3}
                    py={2}
                    _hover={{ bg: "gray.50" }}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                    <HStack spacing={3}>
                      <Box
                        as="input"
                        id={`c-${id}`}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(id)}
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">
                          {c.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {c.category || "General"} • {c.hours || 0}h • Due{" "}
                          {fmtDate(c.dueDate)} • {count}{" "}
                          {count === 1 ? "enrollment" : "enrollments"}
                        </Text>
                      </Box>
                    </HStack>
                  </HStack>
                );
              })
            )}
          </Box>

          {/* Confirmation */}
          <Box mt={4}>
            <Text fontSize="sm" mb={1}>
              Type <b>DELETE</b> to confirm removal of {selected.size} course
              {selected.size === 1 ? "" : "s"}:
            </Text>
            <Box
              as="input"
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              w="240px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          {/* Actions */}
          <HStack justify="flex-end" spacing={3} mt={4}>
            <Button
              variant="outline"
              bg="gray.300"
              _hover={{ bg: "gray.400" }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg="red.600"
              _hover={{ bg: "red.700" }}
              color="white"
              onClick={() => del.mutate(Array.from(selected))}
              isDisabled={
                selected.size === 0 || confirm !== "DELETE" || del.isPending
              }
            >
              {del.isPending
                ? "Deleting…"
                : `Delete ${selected.size} course${
                    selected.size === 1 ? "" : "s"
                  }`}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return dt.toLocaleDateString();
}
