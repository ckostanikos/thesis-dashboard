import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "../api/me";
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import CourseCard from "../components/CourseCard";

export default function Me() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  if (isLoading) {
    return (
      <Flex py={8} justify="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box
        my={4}
        p={3}
        border="1px solid"
        borderColor="red.200"
        bg="red.50"
        color="red.800"
        borderRadius="md"
        fontSize="sm"
      >
        Error: {error.message}
      </Box>
    );
  }

  const { user, enrollments = [] } = data ?? {};

  return (
    <Container maxW="6xl" px={0}>
      <Box
        bg="#F7FAFC"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={4}
        py={3}
        mb={6}
      >
        <Heading size="sm">Enrolled Courses</Heading>
      </Box>

      <Stack spacing={6}>
        {enrollments.map((e) => (
          <CourseCard key={e._id} enrollment={e} />
        ))}
        {enrollments.length === 0 && (
          <Box
            p={6}
            textAlign="center"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
          >
            <Heading size="sm" mb={2}>
              No courses yet
            </Heading>
            <Text color="gray.600">
              When you enroll, your courses will appear here.
            </Text>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
