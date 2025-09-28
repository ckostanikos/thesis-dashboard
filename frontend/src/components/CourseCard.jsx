import { Box, Flex, Image, Heading, Text, Button } from "@chakra-ui/react";
import Chip from "./Chip";
import { Link as RouterLink } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";

function getStatus(progress, completedAt) {
  const done = !!completedAt || Number(progress) >= 100;
  return done ? "Completed" : "In progress";
}

function timeLeftLabel(dueDate) {
  const now = new Date();
  const ms = dueDate - now;
  if (isNaN(ms)) return "No due date";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return "Past due date";
  if (days < 30)
    return `${days} ${days === 1 ? "day" : "days"} left until due date`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} left until due date`;
}

export default function CourseCard({ enrollment }) {
  const title = enrollment?.course?.title ?? "Untitled course";
  const courseId = enrollment?.course?._id;
  const img = enrollment?.course?.imageUrl;
  const category = enrollment?.course?.category;
  const hours = enrollment?.course?.hours;
  const progress = enrollment?.progress ?? 0;
  const completedAt = enrollment?.completedAt ?? null;

  const plannedMin = enrollment?.course?.plannedMinutes;
  const minutesSpent = enrollment?.minutesSpent;
  const dueDate = enrollment?.course?.dueDate
    ? new Date(enrollment.course.dueDate)
    : null;

  let cta = completedAt || progress >= 100 ? "Open" : "Start";

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      boxShadow="sm"
      p={4}
    >
      <Flex gap={6} align="stretch" direction={{ base: "column", md: "row" }}>
        {/* Thumbnail */}
        <Box w={{ base: "100%", md: "320px" }} flexShrink={0}>
          <ChakraLink
            as={RouterLink}
            to={courseId ? `/courses/${courseId}` : "#"}
            _hover={{ textDecoration: "none" }}
          >
            <Image
              src={img || "https://picsum.photos/640/360"}
              alt={title}
              borderRadius="lg"
              objectFit="cover"
              w="100%"
              h={{ base: "160px", md: "180px" }}
            />
          </ChakraLink>
        </Box>

        {/* Content */}
        <Flex flex="1" direction="column" minW={0}>
          <Flex gap={2} wrap="wrap">
            {typeof plannedMin === "number" && (
              <Chip>Expected course duration of {plannedMin} minutes</Chip>
            )}
            {typeof minutesSpent === "number" && (
              <Chip>
                You’ve spent{" "}
                {minutesSpent === 0
                  ? "less than a minute"
                  : `${minutesSpent} minutes`}{" "}
                on this course
              </Chip>
            )}
            {dueDate && <Chip>{timeLeftLabel(dueDate)}</Chip>}
            <Chip>{getStatus(progress, completedAt)}</Chip>
          </Flex>

          <ChakraLink
            as={RouterLink}
            to={courseId ? `/courses/${courseId}` : "#"}
            _hover={{ textDecoration: "none" }}
          >
            <Heading size="md" mt={3} noOfLines={2}>
              {title}
            </Heading>
          </ChakraLink>
          {(category || hours) && (
            <Text mt={1} color="gray.600" fontSize="sm">
              {category ? `${category}` : ""}
              {category && hours ? " • " : ""}
              {hours ? `${hours}h` : ""}
            </Text>
          )}

          <Flex mt="auto" align="center" gap={4} wrap="wrap">
            <Button
              as={RouterLink}
              to={courseId ? `/courses/${courseId}` : "#"}
              bg="#2B6CB0"
              _hover={{ bg: "#2C5282" }}
              color="white"
              borderRadius="md"
              isDisabled={!courseId}
            >
              {cta}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
