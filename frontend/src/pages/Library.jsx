import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Text,
  Button,
  Spinner,
  HStack,
} from "@chakra-ui/react";
import { fetchCourses } from "../api/courses";
import { fetchMe } from "../api/me";
import { enrollSelf } from "../api/enrollments";
import CreateCourseModal from "../components/CreateCourseModal";

function fmtHours(h) {
  const n = Number(h) || 0;
  return `${n}h`;
}
function fmtDue(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function CourseTile({ course, showPlus, onPlus, isLoading }) {
  const img = course.imageUrl || "/images/placeholder.jpg"; // public/images/placeholder.jpg

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      transition="all 120ms ease"
      _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
      position="relative"
    >
      {/* Thumbnail (square) */}
      <Box position="relative" w="100%">
        <Box pb="100%" />
        <Box position="absolute" inset={0}>
          <Box
            as="img"
            src={img}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        {/* Optional enroll + */}
        {showPlus && (
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            borderRadius="full"
            bg="white"
            color="gray.800"
            _hover={{ bg: "gray.100" }}
            onClick={onPlus}
            isDisabled={isLoading}
            title="Enroll"
          >
            {isLoading ? "…" : "+"}
          </Button>
        )}
      </Box>

      {/* Info block below image */}
      <Box p={3}>
        <Text fontWeight="semibold" noOfLines={2} mb={1}>
          {course.title}
        </Text>
        <Text fontSize="xs" color="gray.600" minH="18px">
          {fmtHours(course.hours)} • Due: {fmtDue(course.dueDate)}
        </Text>
      </Box>
    </Box>
  );
}

export default function Library() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [isCreateOpen, setCreateOpen] = useState(false);

  // who am I?
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const role = (user?.role || "employee").toLowerCase();
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isManager = role === "manager";

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // data
  const {
    data: courses,
    isLoading: loadingCourses,
    error: coursesErr,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const {
    data: me,
    isLoading: loadingMe,
    error: meErr,
  } = useQuery({
    queryKey: ["me-for-library"],
    queryFn: fetchMe,
  });

  const enrolledIds = useMemo(() => {
    const list = me?.enrollments || [];
    return new Set(list.map((e) => String(e.course?._id || e.courseId)));
  }, [me]);

  const categories = useMemo(() => {
    const set = new Set((courses || []).map((c) => c.category || "General"));
    return ["all", ...Array.from(set).sort()];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (courses || []).filter((c) => {
      const matchText =
        !q ||
        (c.title || "").toLowerCase().includes(q) ||
        (c.category || "").toLowerCase().includes(q);
      const matchCat =
        category === "all" || (c.category || "General") === category;
      return matchText && matchCat;
    });
  }, [courses, search, category]);

  // mutations
  const enrollMutation = useMutation({
    mutationFn: (courseId) => enrollSelf(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me-for-library"] });
    },
  });

  if (loadingCourses || loadingMe) {
    return (
      <Flex py={10} justify="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (coursesErr || meErr) {
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
        Error: {coursesErr?.message || meErr?.message}
      </Box>
    );
  }

  return (
    <>
      <Container maxW="6xl" px={0}>
        {/* toolbar */}
        <Flex
          align="center"
          gap={3}
          mb={4}
          wrap="wrap"
          px={4}
          py={3}
          bg="#F7FAFC"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Heading size="sm" flexShrink={0}>
            Library
          </Heading>

          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="360px"
            bg="white"
            borderColor="gray.300"
          />

          <Box
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxW="220px"
            bg="white"
            border="1px solid"
            borderColor="gray.300"
            rounded="md"
            px={3}
            py={2}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </Box>

          <Box ml="auto" />

          {(isAdmin || isManager) && (
            <HStack spacing={2}>
              {isAdmin && (
                <Button
                  size="sm"
                  bg="blue.600"
                  _hover={{ bg: "blue.700" }}
                  color="white"
                  onClick={() => setCreateOpen(true)}
                >
                  Create a course
                </Button>
              )}
              <Button
                size="sm"
                bg="green.600"
                _hover={{ bg: "green.700" }}
                color="white"
                onClick={() => nav("/enrollments/assign")}
              >
                Assign a course
              </Button>
              {isAdmin && (
                <Button
                  size="sm"
                  bg="red.600"
                  _hover={{ bg: "red.700" }}
                  color="white"
                  onClick={() => nav("/courses/delete")}
                >
                  Delete a course
                </Button>
              )}
            </HStack>
          )}
        </Flex>

        {/* tiles */}
        {filtered.length === 0 ? (
          <Box
            p={6}
            textAlign="center"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="xl"
            mx={4}
          >
            <Heading size="sm" mb={2}>
              No courses found
            </Heading>
            <Text color="gray.600">Try adjusting your search or filters.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5} px={4} py={4}>
            {filtered.map((course) => {
              const id = String(course._id);
              const alreadyEnrolled = enrolledIds.has(id);
              const canShowPlus = (isEmployee || isManager) && !alreadyEnrolled;

              return (
                <CourseTile
                  key={id}
                  course={course}
                  showPlus={canShowPlus}
                  isLoading={enrollMutation.isPending}
                  onPlus={() => enrollMutation.mutate(id)}
                />
              );
            })}
          </SimpleGrid>
        )}
      </Container>
      <CreateCourseModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories.filter((c) => c !== "all")}
      />
    </>
  );
}
