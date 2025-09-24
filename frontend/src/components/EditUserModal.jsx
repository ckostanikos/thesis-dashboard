import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { updateUserAdmin } from "../api/users";

export default function EditUserModal({ isOpen, onClose, user, teams = [] }) {
  const qc = useQueryClient();
  const [role, setRole] = useState(user?.role || "employee");
  const [teamId, setTeamId] = useState(user?.teamId || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const teamOptions = useMemo(() => teams || [], [teams]);

  useEffect(() => {
    if (isOpen && user) {
      setRole(user.role || "employee");
      setTeamId(user.teamId || "");
      setPassword("");
      setConfirm("");
      setError("");
    }
  }, [isOpen, user]);

  const save = useMutation({
    mutationFn: async () => {
      setError("");
      const payload = {};
      payload.role = role;

      // team assignment: managers/employees can have a team; admins typically not
      if (role === "manager" || role === "employee") {
        payload.teamId = teamId || null;
      } else {
        payload.teamId = null;
      }

      if (password) {
        if (password.length < 6)
          throw new Error("Password must be at least 6 characters");
        if (password !== confirm) throw new Error("Passwords do not match");
        payload.password = password;
      }

      return updateUserAdmin(user._id, payload);
    },
    onSuccess: () => {
      // refresh lists & details
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["user-detail", user?._id] });
      onClose?.();
    },
    onError: (e) => {
      setError(e?.response?.data?.message || e.message || "Failed to update");
    },
  });

  if (!isOpen || !user) return null;

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
      aria-labelledby="edit-user-title"
    >
      <Container maxW="lg" onClick={(e) => e.stopPropagation()}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="xl">
          <Heading id="edit-user-title" size="sm" mb={4}>
            Edit user
          </Heading>

          <Box mb={3}>
            <Text fontSize="sm" color="gray.700" mb={1}>
              Name
            </Text>
            <Text fontSize="sm">{user.name || "—"}</Text>
            <Text fontSize="xs" color="gray.600">
              {user.email}
            </Text>
          </Box>

          {/* Role */}
          <Box mb={3}>
            <Text fontSize="sm" color="gray.700" mb={1}>
              Role
            </Text>
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
              <option value="employee">employee</option>
              <option value="manager">manager</option>
              <option value="admin">admin</option>
            </Box>
          </Box>

          {/* Team */}
          <Box mb={3}>
            <Text fontSize="sm" color="gray.700" mb={1}>
              Team{" "}
              {role === "manager" ? "(required for managers)" : "(optional)"}
            </Text>
            <Box
              as="select"
              value={teamId || ""}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={role === "admin"}
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            >
              <option value="">— No team —</option>
              {teamOptions.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Box>
          </Box>

          {/* Password */}
          <Box mb={2}>
            <Text fontSize="sm" color="gray.700" mb={1}>
              New password (optional)
            </Text>
            <Box
              as="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>
          <Box mb={3}>
            <Text fontSize="sm" color="gray.700" mb={1}>
              Confirm new password
            </Text>
            <Box
              as="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          {error && (
            <Box
              mb={3}
              p={2}
              bg="red.50"
              color="red.700"
              border="1px solid"
              borderColor="red.200"
              rounded="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

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
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              color="white"
              onClick={() => save.mutate()}
              isDisabled={save.isPending || (role === "manager" && !teamId)}
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
