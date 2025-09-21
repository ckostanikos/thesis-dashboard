import { NavLink } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";

function NavItem({ to, children }) {
  return (
    <ChakraLink
      as={NavLink}
      to={to}
      px={3}
      py={2}
      rounded="md"
      fontSize="sm"
      _hover={{ bg: "gray.100", color: "gray.900", textDecoration: "none" }}
      style={({ isActive }) =>
        isActive
          ? {
              background: "#2563EB",
              color: "white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }
          : { color: "#4B5563" }
      }
    >
      {children}
    </ChakraLink>
  );
}

const roleLinks = (role, teamId) => {
  switch ((role || "employee").toLowerCase()) {
    case "admin":
      return [
        { to: "/org", label: "Dashboard" },
        { to: "/library", label: "Library" },
        { to: "/users", label: "Users" },
      ];
    case "manager":
      return [
        { to: teamId ? `/team/${teamId}` : "/manager", label: "Dashboard" },
        { to: "/me", label: "My Learning" },
        { to: "/library", label: "Library" },
        { to: "/profile", label: "Profile" },
      ];
    default: // employee
      return [
        { to: "/me", label: "My Learning" },
        { to: "/library", label: "Library" },
        { to: "/profile", label: "Profile" },
      ];
  }
};

export default function Navbar({ role, teamId, onLogout }) {
  const links = roleLinks(role, teamId);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={50}
      borderBottom="1px"
      borderColor="gray.200"
      bg="#EDF2F7"
      sx={{ backdropFilter: "blur(6px)" }}
    >
      <Container maxW="6xl" px={4}>
        <Flex align="center" gap={3} h={14}>
          {/* Brand */}
          <HStack spacing={2}>
            <Box
              h={7}
              w={7}
              display="grid"
              placeItems="center"
              rounded="xl"
              bgGradient="linear(to-br, blue.600, indigo.600)"
              color="white"
              fontWeight="bold"
              fontSize="sm"
              boxShadow="sm"
            >
              TD
            </Box>
            <Heading size="sm" letterSpacing="tight">
              Thesis Dashboard
            </Heading>
          </HStack>

          {/* Links */}
          <HStack spacing={1} ml={6}>
            {links.map((l) => (
              <NavItem key={l.to} to={l.to}>
                {l.label}
              </NavItem>
            ))}
          </HStack>

          {/* Actions */}
          <HStack spacing={2} ml="auto">
            <Button
              size="sm"
              bg="gray.600"
              _hover={{ bg: "gray.700" }}
              color="white"
              onClick={onLogout}
              boxShadow="sm"
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
