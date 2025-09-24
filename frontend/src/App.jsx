import { Outlet, useNavigate } from "react-router-dom";
import { Box, Container, Flex, Text } from "@chakra-ui/react";
import Navbar from "./components/Navbar";

export default function App() {
  const nav = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const role = user?.role || "employee";
  const teamId = user?.teamId || null;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  return (
    <Box
      minH="100dvh"
      bg="white"
      color="gray.900"
      display="flex"
      flexDirection="column"
    >
      <Navbar role={role} teamId={teamId} onLogout={logout} />

      <Container maxW="6xl" px={4} py={6} flex="1">
        <Outlet />
      </Container>

      <Box
        mt="auto"
        py={6}
        bg="#EDF2F7"
        borderTop="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="6xl">
          <Flex
            align="center"
            color="gray.700"
            fontSize="sm"
            wrap="wrap"
            gap={3}
          >
            <Text fontWeight="bold">Employee Learning & Tracking System</Text>
            <Text>admin@org.com</Text>
            <Text ml="auto">All Rights Reserved.</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
