import { Box } from "@chakra-ui/react";
export default function Chip({ children }) {
  return (
    <Box
      as="span"
      px={2}
      py={1}
      bg="#EDF2F7"
      color="#1A202C"
      borderRadius="full"
      fontSize="xs"
      border="1px solid"
      borderColor="#E2E8F0"
      whiteSpace="nowrap"
    >
      {children}
    </Box>
  );
}
