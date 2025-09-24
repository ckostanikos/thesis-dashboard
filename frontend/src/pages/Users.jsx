import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { fetchUsersAdmin } from "../api/users";
import { fetchTeams } from "../api/teams";
import EditUserModal from "../components/EditUserModal";

export default function Users() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [editing, setEditing] = useState(null); // user being edited

  const teamsQ = useQuery({ queryKey: ["teams"], queryFn: fetchTeams });
  const usersQ = useQuery({
    queryKey: ["admin-users", q, role, teamId],
    queryFn: () => fetchUsersAdmin({ q, role, teamId }),
  });

  const teams = teamsQ.data || [];
  const users = usersQ.data || [];
  const teamMap = useMemo(() => {
    const m = new Map();
    teams.forEach((t) => m.set(String(t._id), t.name));
    return m;
  }, [teams]);

  const roles = useMemo(() => ["", "admin", "manager", "employee"], []);

  return (
    <Container maxW="6xl" px={4}>
      <Flex align="center" gap={3} mb={4}>
        <Heading size="sm">Users</Heading>
        <Text fontSize="sm" color="gray.600">
          ({users.length})
        </Text>
      </Flex>

      {/* Filters */}
      <HStack spacing={3} wrap="wrap" mb={3}>
        <Box
          as="input"
          type="text"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          px={3}
          py={2}
          bg="#F3F4F6"
          border="1px solid"
          borderColor="gray.300"
          rounded="md"
          w={{ base: "100%", md: "300px" }}
        />
        <Box
          as="select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          px={3}
          py={2}
          bg="#F3F4F6"
          border="1px solid"
          borderColor="gray.300"
          rounded="md"
        >
          {roles.map((r) => (
            <option key={r || "any"} value={r}>
              {r ? r : "All roles"}
            </option>
          ))}
        </Box>
        <Box
          as="select"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          px={3}
          py={2}
          bg="#F3F4F6"
          border="1px solid"
          borderColor="gray.300"
          rounded="md"
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </Box>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setQ("");
            setRole("");
            setTeamId("");
          }}
        >
          Clear
        </Button>
      </HStack>

      {/* Table */}
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
              <HeaderCell>Name</HeaderCell>
              <HeaderCell>Email</HeaderCell>
              <HeaderCell>Role</HeaderCell>
              <HeaderCell>Team</HeaderCell>
              <HeaderCell></HeaderCell>
            </Box>
          </Box>
          <Box as="tbody">
            {users.map((u) => (
              <Box
                as="tr"
                key={u._id}
                _hover={{ bg: "gray.50" }}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Cell>{u.name || "—"}</Cell>
                <Cell mono>{u.email}</Cell>
                <Cell>{u.role}</Cell>
                <Cell>{teamMap.get(String(u.teamId)) || "—"}</Cell>
                <Cell align="right">
                  <Button
                    size="sm"
                    onClick={() => nav(`/users/${u._id}`)}
                    bg="blue.600"
                    _hover={{ bg: "blue.700" }}
                    color="white"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    ml={2}
                    onClick={() => setEditing(u)}
                    variant="outline"
                  >
                    Edit
                  </Button>
                </Cell>
              </Box>
            ))}
            {users.length === 0 && (
              <Box as="tr">
                <Cell colSpan={5}>
                  <Text fontSize="sm" color="gray.600">
                    No users match the filters.
                  </Text>
                </Cell>
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

function HeaderCell({ children }) {
  return (
    <Box as="th" textAlign="left" px={3} py={2} fontSize="sm" color="gray.700">
      {children}
    </Box>
  );
}
function Cell({ children, align = "left", colSpan, mono = false }) {
  return (
    <Box
      as="td"
      px={3}
      py={2}
      colSpan={colSpan}
      textAlign={align}
      fontSize="sm"
      fontFamily={
        mono
          ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
          : undefined
      }
    >
      {children}
    </Box>
  );
}
function renderTeam(teams, id) {
  if (!id) return "—";
  const t = teams.find((x) => String(x._id) === String(id));
  return t?.name || "—";
}
