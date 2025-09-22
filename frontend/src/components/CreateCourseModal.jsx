// src/components/CreateCourseModal.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
} from "@chakra-ui/react";
import { createCourse } from "../api/courses";

const DEFAULT_CATEGORIES = [
  "General",
  "Security",
  "Analytics",
  "Productivity",
  "Design",
  "Development",
  "Marketing",
  "Sales",
  "Customer Service",
  "HR",
  "Finance",
  "Legal",
  "IT",
  "Other",
];

export default function CreateCourseModal({
  isOpen,
  onClose,
  categories = [],
}) {
  const qc = useQueryClient();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [minutes, setMinutes] = useState("");
  const [dueDate, setDueDate] = useState(""); // yyyy-mm-dd
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState("");
  const fileInputRef = useRef(null);

  // close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const cats = useMemo(() => {
    const fromProps = (categories || []).filter(Boolean);
    const base = fromProps.length ? fromProps : DEFAULT_CATEGORIES;
    return Array.from(new Set(base));
  }, [categories]);

  // 1 MB cap (Data URL will be ~33% larger; raise Express limit server-side)
  const MAX_BYTES = 1 * 1024 * 1024;

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setFileErr("");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setFileErr("Image is larger than 1 MB. Please choose a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileErr("");
    setFile(f);
  }

  async function fileToDataUrl(f) {
    if (!f) return undefined;
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result); // data:image/*;base64,...
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const m = Number(minutes) || 0;
      const hours = Math.max(0, Math.round((m / 60) * 10) / 10);
      const imageUrl = await fileToDataUrl(file); // may be undefined

      const payload = {
        title: title.trim(),
        category: category || "General",
        hours,
        dueDate: dueDate || undefined, // backend defaults if empty
        description: description.trim(),
        imageUrl, // Data URL string or undefined
      };

      return createCourse(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      // reset local state
      setTitle("");
      setDescription("");
      setCategory("General");
      setMinutes("");
      setDueDate("");
      setFile(null);
      setFileErr("");
      onClose?.();
    },
  });

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.700"
      zIndex={1000}
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      overflow="auto"
      py={8}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-course-title"
      onClick={onClose}
    >
      <Container maxW="2xl" onClick={(e) => e.stopPropagation()}>
        <Box bg="white" borderRadius="xl" p={6} boxShadow="xl">
          <Heading id="create-course-title" size="sm" mb={4}>
            Create a course
          </Heading>

          {/* Title */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Course Title
            </Text>
            <Box
              as="input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              w="100%"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          {/* Description */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Description
            </Text>
            <Box
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              w="100%"
              h="240px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              resize="vertical"
            />
          </Box>

          {/* Category */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Category
            </Text>

            <Box
              as="input"
              type="text"
              list="course-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              w="300px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              placeholder="Type or pick a category"
            />
            <Box as="datalist" id="course-categories">
              {cats.map((c) => (
                <option key={c} value={c} />
              ))}
            </Box>

            <Text fontSize="xs" color="gray.500" mt={1}>
              Start typing to add a new category or pick an existing one.
            </Text>
          </Box>

          {/* Duration (minutes) */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Duration (in minutes)
            </Text>
            <Box
              as="input"
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              w="300px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          {/* Due Date */}
          <Box mb={4}>
            <Text fontSize="sm" mb={1}>
              Due Date
            </Text>
            <Box
              as="input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              w="300px"
              px={3}
              py={2}
              bg="#F3F4F6"
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
            />
          </Box>

          {/* Thumbnail (<= 1 MB) */}
          <Box mb={6}>
            <Text fontSize="sm" mb={1}>
              Upload thumbnail{" "}
              <Text as="span" color="gray.500">
                (max 1 MB)
              </Text>
            </Text>
            <HStack align="flex-start" spacing={3}>
              <Box
                as="input"
                type="file"
                accept="image/*"
                onChange={onPickFile}
                w="300px"
                px={3}
                py={2}
                bg="#F3F4F6"
                border="1px solid"
                borderColor="gray.300"
                rounded="md"
                ref={fileInputRef}
              />
              <Box>
                {file && (
                  <Box
                    w="96px"
                    h="96px"
                    border="1px solid"
                    borderColor="gray.200"
                    rounded="md"
                    bgImage={`url(${URL.createObjectURL(file)})`}
                    bgSize="cover"
                    bgPos="center"
                    title={file.name}
                  />
                )}
                {fileErr && (
                  <Text fontSize="xs" color="red.600" mt={2}>
                    {fileErr}
                  </Text>
                )}
              </Box>
            </HStack>
          </Box>

          {/* Error (mutation) */}
          {mutation.isError && (
            <Box
              mb={4}
              p={3}
              border="1px solid"
              borderColor="red.200"
              bg="red.50"
              color="red.800"
              rounded="md"
              fontSize="sm"
            >
              {mutation.error?.response?.data?.message ||
                mutation.error?.message ||
                "Failed to create course"}
            </Box>
          )}

          {/* Actions */}
          <HStack justify="flex-end" spacing={3}>
            <Button
              variant="outline"
              bg="gray.300"
              _hover={{ bg: "gray.400" }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              bg="#1F4662"
              _hover={{ bg: "#16384E" }}
              color="white"
              onClick={() => mutation.mutate()}
              isDisabled={!title.trim() || !!fileErr || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
}
