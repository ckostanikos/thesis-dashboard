import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import {
  Box,
  Button,
  Input,
  Text,
  Heading,
  VStack,
  Alert,
  Container,
  Field, // <-- v3 forms
} from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("admin@org.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      if (user.role === "admin") nav("/org");
      else if (user.role === "manager") nav(`/team/${user.teamId}`);
      else nav("/me");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <Box minH="100dvh" bg="gray.100" display="flex" alignItems="center">
      <Container maxW="sm">
        <Box
          as="form"
          onSubmit={onSubmit}
          bg="white"
          borderRadius="xl"
          boxShadow="sm"
          p={6}
        >
          <VStack align="stretch" spacing={4}>
            <Heading size="md">Sign in</Heading>

            {error && (
              <Alert.Root status="error" variant="subtle" borderRadius="md">
                <Alert.Icon />
                <Alert.Description fontSize="sm">{error}</Alert.Description>
              </Alert.Root>
            )}

            <Field.Root>
              <Field.Label fontSize="sm">Email</Field.Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="gray.50"
                borderColor="gray.300"
              />
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="sm">Password</Field.Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.50"
                borderColor="gray.300"
              />
            </Field.Root>

            <Button type="submit" colorScheme="blue" w="full">
              Login
            </Button>

            <Text fontSize="xs" color="gray.500">
              Try: admin@org.com / manager@org.com / konstantina@org.com
              (password)
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
