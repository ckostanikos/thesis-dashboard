import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  HStack,
} from "@chakra-ui/react";
import { fetchMe, changeMyPassword } from "../api/me";

export default function Profile() {
  const meQ = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const change = useMutation({
    mutationFn: async () => {
      setErr("");
      setOk("");
      if (nextPassword.length < 6)
        throw new Error("New password must be at least 6 characters");
      if (nextPassword !== confirm) throw new Error("Passwords do not match");
      const res = await changeMyPassword(currentPassword, nextPassword);
      return res;
    },
    onSuccess: (res) => {
      setOk(res?.message || "Password updated");
      setCurrentPassword("");
      setNextPassword("");
      setConfirm("");
    },
    onError: (e) => {
      setErr(
        e?.response?.data?.message || e.message || "Failed to update password"
      );
    },
  });

  if (meQ.isLoading)
    return (
      <Container maxW="6xl" px={4}>
        <Text>Loading…</Text>
      </Container>
    );
  if (meQ.error)
    return (
      <Container maxW="6xl" px={4}>
        <Text color="red.600">Error: {meQ.error.message}</Text>
      </Container>
    );

  const { user } = meQ.data;

  return (
    <Container maxW="6xl" px={4}>
      <Heading size="sm" mb={4}>
        Profile
      </Heading>

      {/* Identity Card */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        rounded="xl"
        p={4}
        mb={6}
      >
        <Row label="Full name" value={user.name || "—"} />
        <Row label="Role" value={user.role || "—"} />
        <Row label="Email" value={user.email || "—"} />
      </Box>

      {/* Change Password */}
      <Heading size="xs" mb={2}>
        Change password
      </Heading>
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        rounded="xl"
        p={4}
      >
        {err && (
          <Box
            mb={3}
            p={2}
            bg="red.50"
            color="red.800"
            border="1px solid"
            borderColor="red.200"
            rounded="md"
            fontSize="sm"
          >
            {err}
          </Box>
        )}
        {ok && (
          <Box
            mb={3}
            p={2}
            bg="green.50"
            color="green.800"
            border="1px solid"
            borderColor="green.200"
            rounded="md"
            fontSize="sm"
          >
            {ok}
          </Box>
        )}

        <Field
          id="currentPassword"
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Field
          id="newPassword"
          label="New password"
          type="password"
          value={nextPassword}
          onChange={(e) => setNextPassword(e.target.value)}
        />
        <Field
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <HStack justify="flex-end" mt={3}>
          <Button
            onClick={() => change.mutate()}
            bg="blue.600"
            _hover={{ bg: "blue.700" }}
            color="white"
            isDisabled={
              change.isPending || !currentPassword || !nextPassword || !confirm
            }
          >
            {change.isPending ? "Saving…" : "Update password"}
          </Button>
        </HStack>
      </Box>
    </Container>
  );
}

function Row({ label, value }) {
  return (
    <HStack
      justify="space-between"
      py={2}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text fontSize="sm" color="gray.600">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium">
        {value}
      </Text>
    </HStack>
  );
}

function Field({ id, label, type = "text", value, onChange }) {
  return (
    <Box mb={3}>
      <Text as="label" htmlFor={id} fontSize="sm" mb={1} display="block">
        {label}
      </Text>
      <Box
        as="input"
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        w="100%"
        px={3}
        py={2}
        bg="#F3F4F6"
        border="1px solid"
        borderColor="gray.300"
        rounded="md"
      />
    </Box>
  );
}
