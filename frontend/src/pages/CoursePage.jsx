import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { fetchCourse, updateCourse } from "../api/courses";
import { fetchMe } from "../api/me";
import { markCompleted } from "../api/enrollments";

function roleOfCurrentUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null")?.role || "employee"
    );
  } catch {
    return "employee";
  }
}

export default function CoursePage() {
  const { id } = useParams(); // courseId
  const qc = useQueryClient();
  const role = roleOfCurrentUser();

  const courseQ = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
  });
  const meQ = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const userId = meQ.data?.user?._id;
  const enrollment = useMemo(() => {
    const list = meQ.data?.enrollments || [];
    return list.find((e) => String(e.courseId) === String(id));
  }, [meQ.data, id]);

  const completed =
    Boolean(enrollment?.completedAt) ||
    Number(enrollment?.progress || 0) >= 100;

  const toggle = useMutation({
    mutationFn: (next) => markCompleted(id, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["user-detail", userId] }); // if open elsewhere
    },
  });

  const [editOpen, setEditOpen] = useState(false);
  const saveEdit = useMutation({
    mutationFn: (payload) => updateCourse(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", id] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      setEditOpen(false);
    },
  });

  if (courseQ.isLoading || meQ.isLoading) {
    return (
      <Container maxW="6xl" px={4}>
        <Text>Loading…</Text>
      </Container>
    );
  }
  if (courseQ.error) {
    return (
      <Container maxW="6xl" px={4}>
        <Text color="red.600">Error: {courseQ.error.message}</Text>
      </Container>
    );
  }

  const c = courseQ.data;

  return (
    <Container maxW="6xl" px={4}>
      {/* Header */}
      <HStack justify="space-between" align="start" mb={4}>
        <Box>
          <Heading size="md">{c.title}</Heading>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {c.category || "General"} • {c.hours || 0}h • Due{" "}
            {fmtDate(c.dueDate)}
          </Text>
        </Box>

        {role === "admin" && (
          <Button
            size="sm"
            bg="blue.600"
            _hover={{ bg: "blue.700" }}
            color="white"
            onClick={() => setEditOpen(true)}
          >
            Edit course
          </Button>
        )}
      </HStack>

      {/* Thumbnail */}
      {c.imageUrl && (
        <Image
          src={c.imageUrl}
          alt={c.title}
          borderRadius="lg"
          objectFit="cover"
          w="100%"
          maxH="360px"
          mb={4}
        />
      )}

      {/* Description */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        rounded="xl"
        p={4}
        mb={4}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {c.description || "No description."}
        </pre>
      </Box>

      {/* Completion control */}
      {role !== "admin" && (
        <Box
          mt={4}
          p={3}
          border="1px solid"
          borderColor="gray.200"
          rounded="md"
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack spacing={3}>
            <Box
              as="input"
              type="checkbox"
              checked={completed}
              onChange={(e) => toggle.mutate(e.target.checked)}
              disabled={!enrollment || toggle.isPending}
            />
            <Text fontSize="sm">
              I have completed this course {enrollment ? "" : "(not enrolled)"}
            </Text>
          </HStack>
          {toggle.isPending && (
            <Text fontSize="xs" color="gray.500">
              Saving…
            </Text>
          )}
        </Box>
      )}

      {/* Edit modal (simple) */}
      {editOpen && (
        <EditCourseModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          course={c}
          onSave={(payload) => saveEdit.mutate(payload)}
          isSaving={saveEdit.isPending}
          error={
            saveEdit.error?.response?.data?.message || saveEdit.error?.message
          }
        />
      )}
    </Container>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : dt.toLocaleDateString();
}
