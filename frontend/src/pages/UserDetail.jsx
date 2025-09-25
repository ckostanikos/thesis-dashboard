import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { fetchEnrollmentsByUser } from "../api/enrollments";
import { fetchTeams } from "../api/teams";
import EditUserModal from "../components/EditUserModal";

export default function UserDetail() {
  const { id } = useParams();
  const [editing, setEditing] = useState(null);

  // Hooks must be top-level & unconditional
  const q = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () => fetchEnrollmentsByUser(id),
  });

  const teamsQ = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });

  // Safe fallbacks so hooks can run during loading
  const user = q.data?.user;
  const enrollments = q.data?.enrollments ?? [];
  const teams = teamsQ.data ?? [];

  const teamMap = useMemo(() => {
    const m = new Map();
    for (const t of teams) m.set(String(t._id), t.name);
    return m;
  }, [teams]);

  // Render branches AFTER all hooks
  if (q.isLoading) {
    return (
      <Container maxW="6xl" px={4}>
        <Text>Loading…</Text>
      </Container>
    );
  }
  if (q.error) {
    return (
      <Container maxW="6xl" px={4}>
        <Text color="red.600">Error: {q.error.message}</Text>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" px={4}>
      <Flex align="center" justify="space-between" mb={4}>
        <Box>
          <Heading size="sm">{user?.name}</Heading>
          <Text fontSize="sm" color="gray.600">
            {user?.email}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Role: {user?.role}{" "}
            {user?.teamId
              ? `• Team: ${teamMap.get(String(user.teamId)) || "—"}`
              : ""}
          </Text>
        </Box>
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => setEditing(user)}>
            Edit
          </Button>
        </HStack>
      </Flex>

      <Box
        border="1px solid"
        borderColor="gray.200"
        rounded="md"
        overflow="hidden"
        bg="white"
      >
        <Box as="table" w="100%" style={{ borderCollapse: "collapse" }}>
          <Box
            as="thead"
            bg="#F9FAFB"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Box as="tr">
              <Th>Course</Th>
              <Th>Category</Th>
              <Th>Hours</Th>
              <Th>Status</Th>
              <Th>Due</Th>
            </Box>
          </Box>
          <Box as="tbody">
            {enrollments.map((e) => (
              <Box
                as="tr"
                key={e._id}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Td>{e.course?.title || "—"}</Td>
                <Td>{e.course?.category || "—"}</Td>
                <Td>{e.course?.hours ?? "—"}h</Td>
                <Td>
                  {e.completedAt || (e.progress ?? 0) >= 100
                    ? "Completed"
                    : "In progress"}
                </Td>
                <Td>{fmtDate(e.dueDate || e.course?.dueDate)}</Td>
              </Box>
            ))}
            {enrollments.length === 0 && (
              <Box as="tr">
                <Td colSpan={5}>
                  <Text fontSize="sm" color="gray.600">
                    No enrollments yet.
                  </Text>
                </Td>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <EditUserModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        user={editing}
        teams={teams}
      />
    </Container>
  );
}

function Th({ children }) {
  return (
    <Box as="th" textAlign="left" px={3} py={2} fontSize="sm" color="gray.700">
      {children}
    </Box>
  );
}
function Td({ children, colSpan }) {
  return (
    <Box as="td" px={3} py={2} colSpan={colSpan} fontSize="sm">
      {children}
    </Box>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : dt.toLocaleDateString();
}
