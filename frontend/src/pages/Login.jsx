import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, Text } from "@chakra-ui/react";
import { login } from "../api/auth";

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

      if (user.role === "admin") nav("/company"); // or your admin landing
      else if (user.role === "manager") nav(`/team/${user.teamId}`);
      else nav("/my-courses");
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Login failed";
      setError(msg);
    }
  }

  return (
    <Box minH="100dvh" display="grid" placeItems="center" bg="gray.100">
      <Container maxW="sm" w="full">
        <Box
          bg="white"
          p={6}
          rounded="xl"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Heading size="sm" mb={4}>
            Sign in
          </Heading>

          {error && (
            <Box
              role="alert"
              mb={3}
              p={3}
              bg="red.50"
              color="red.800"
              border="1px solid"
              borderColor="red.200"
              rounded="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          <Box as="form" onSubmit={onSubmit}>
            <Box mb={3}>
              <Text
                as="label"
                htmlFor="email"
                fontSize="sm"
                mb={1}
                display="block"
              >
                Email
              </Text>
              <Box
                as="input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                w="100%"
                px={3}
                py={2}
                bg="#F3F4F6"
                border="1px solid"
                borderColor="gray.300"
                rounded="md"
              />
            </Box>

            <Box mb={4}>
              <Text
                as="label"
                htmlFor="password"
                fontSize="sm"
                mb={1}
                display="block"
              >
                Password
              </Text>
              <Box
                as="input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                w="100%"
                px={3}
                py={2}
                bg="#F3F4F6"
                border="1px solid"
                borderColor="gray.300"
                rounded="md"
              />
            </Box>

            <Button
              type="submit"
              w="100%"
              bg="blue.600"
              _hover={{ bg: "blue.700" }}
              color="white"
            >
              Login
            </Button>

            <Text fontSize="xs" color="gray.500" mt={3}>
              Forgot your password? Contact the admin. (admin@org.com)
            </Text>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
