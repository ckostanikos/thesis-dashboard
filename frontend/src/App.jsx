import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  HStack,
  Stack,
  Heading,
  Button,
  IconButton,
  Collapsible,
  Link as ChakraLink,
  Text,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";

function NavItem({ to, children, onClick }) {
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
      onClick={onClick}
    >
      {children}
    </ChakraLink>
  );
}

export default function App() {
  const nav = useNavigate();
  const loc = useLocation();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, md: true });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  // Close mobile menu when route changes
  useEffect(() => {
    onClose();
  }, [loc.pathname, onClose]);

  return (
    <Box
      minH="100dvh"
      bg="white"
      color="gray.900"
      display="flex"
      flexDirection="column"
    >
      {/* NAVBAR */}
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

            {/* Desktop nav */}
            {isDesktop && (
              <HStack spacing={1} ms={6}>
                <NavItem to="/me">My Dashboard</NavItem>
                <NavItem to="/org">Org</NavItem>
                {/* <NavItem to="/team/DEFAULT_TEAM_ID">Team</NavItem> */}
              </HStack>
            )}

            {/* Actions */}
            <HStack spacing={2} ms="auto">
              <Button
                size="sm"
                bg="gray.600"
                _hover={{ bg: "gray.700" }}
                color="white"
                onClick={logout}
                boxShadow="sm"
              >
                Logout
              </Button>

              {!isDesktop && (
                <IconButton
                  aria-label="Toggle menu"
                  variant="outline"
                  onClick={onToggle}
                >
                  {isOpen ? "Close" : "Menu"}
                </IconButton>
              )}
            </HStack>
          </Flex>

          {/* Mobile dropdown (v3 Collapsible) */}
          {!isDesktop && (
            <Collapsible.Root open={isOpen}>
              <Collapsible.Content>
                <Box pb={3}>
                  <Stack spacing={1}>
                    <NavItem to="/me" onClick={onClose}>
                      My Dashboard
                    </NavItem>
                    <NavItem to="/org" onClick={onClose}>
                      Org
                    </NavItem>
                  </Stack>
                </Box>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </Container>
      </Box>

      {/* CONTENT */}
      <Container maxW="6xl" px={4} py={6} flex="1">
        <Outlet />
      </Container>

      {/* FOOTER */}
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
            <Text fontWeight="bold">Company SkillHub</Text>
            <Text>dev@helpdesk.com</Text>
            <Text ms="auto">All Rights Reserved.</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
